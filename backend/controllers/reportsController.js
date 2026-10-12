import { Session, Event } from "../models/index.js";

const DEFAULT_DAYS = 30;

function getDateRange(req) {
  const { startDate, endDate } = req.dateRange || {};
  const end = endDate || new Date();
  const start = startDate || new Date(end.getTime() - DEFAULT_DAYS * 24 * 60 * 60 * 1000);
  return { start, end };
}

function domainMatch(domain) {
  return domain ? { domain } : {};
}

export async function overview(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);
  const timeFilter = {
    ...dm,
    startedAt: { $gte: start, $lte: end },
  };
  const eventFilter = {
    ...dm,
    timestamp: { $gte: start, $lte: end },
  };

  try {
    const [pageViews, sessions, totalEvents, eventsByType] = await Promise.all([
      Event.countDocuments({ ...eventFilter, eventType: "pageview" }).exec(),
      Session.find(timeFilter).exec(),
      Event.countDocuments(eventFilter).exec(),
      Event.aggregate([
        { $match: { ...eventFilter, eventType: { $in: ["pageview", "click", "custom", "navigation"] } } },
        {
          $group: {
            _id: "$visitorId",
            eventCount: { $sum: 1 },
          },
        },
      ]).exec(),
    ]);

    const totalSessions = sessions.length;
    const uniqueVisitors = new Set(sessions.map((s) => s.visitorId)).size;

    const returningVisitorIds = sessions
      .reduce((acc, s) => {
        acc[s.visitorId] = (acc[s.visitorId] || 0) + 1;
        return acc;
      }, {});
    const returningVisitors = Object.values(returningVisitorIds).filter((c) => c > 1).length;
    const newVisitors = uniqueVisitors - returningVisitors;

    let bounceSessions = 0;
    let totalDuration = 0;
    let totalPageCount = 0;

    for (const s of sessions) {
      const isBounce = (s.pageCount || 0) <= 1 && (s.duration || 0) < 30;
      if (isBounce) bounceSessions += 1;
      totalDuration += s.duration || 0;
      totalPageCount += s.pageCount || 0;
    }

    const bounceRate = totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;
    const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const avgPagesPerSession = totalSessions > 0 ? totalPageCount / totalSessions : 0;

    res.json({
      success: true,
      data: {
        pageViews,
        uniqueVisitors,
        sessions: totalSessions,
        bounceRate: Math.round(bounceRate * 10) / 10,
        avgSessionDuration: Math.round(avgSessionDuration),
        avgPagesPerSession: Math.round(avgPagesPerSession * 100) / 100,
        returningVisitors,
        newVisitors,
        totalEvents,
      },
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate overview" });
  }
}

export async function sources(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);

  try {
    const results = await Session.aggregate([
      {
        $match: {
          ...dm,
          startedAt: { $gte: start, $lte: end },
          $or: [{ referrerDomain: { $exists: true, $ne: null } }, { utmSource: { $exists: true, $ne: null } }],
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $ifNull: ["$utmSource", false] },
              then: "$utmSource",
              else: {
                $cond: {
                  if: { $eq: [{ $ifNull: ["$referrerDomain", null] }, null] },
                  then: "direct",
                  else: "$referrerDomain",
                },
              },
            },
          },
          visits: { $sum: 1 },
        },
      },
      { $sort: { visits: -1 } },
    ]).exec();

    const total = results.reduce((sum, r) => sum + r.visits, 0);
    const data = results.map((r) => ({
      source: r._id,
      visits: r.visits,
      percentage: total > 0 ? Math.round((r.visits / total) * 1000) / 10 : 0,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate sources report" });
  }
}

export async function pages(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);

  try {
    const results = await Event.aggregate([
      {
        $match: {
          ...dm,
          eventType: "pageview",
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$path",
          title: { $first: "$title" },
          pageViews: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$visitorId" },
          totalDuration: {
            $sum: { $ifNull: ["$duration", 0] },
          },
        },
      },
      { $sort: { pageViews: -1 } },
      { $limit: 50 },
    ]).exec();

    const data = results.map((r) => ({
      path: r._id,
      title: r.title || r._id,
      pageViews: r.pageViews,
      uniqueVisitors: r.uniqueVisitors.length,
      avgTime: r.pageViews > 0 ? Math.round(r.totalDuration / r.pageViews) : 0,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate pages report" });
  }
}

export async function devices(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);

  try {
    const sessions = await Session.find({
      ...dm,
      startedAt: { $gte: start, $lte: end },
    }).exec();

    const total = sessions.length || 1;

    const deviceTypes = {};
    const browsers = {};
    const operatingSystems = {};

    for (const s of sessions) {
      const dt = s.deviceType || "unknown";
      deviceTypes[dt] = (deviceTypes[dt] || 0) + 1;

      const br = s.browser || "unknown";
      browsers[br] = (browsers[br] || 0) + 1;

      const os = s.os || "unknown";
      operatingSystems[os] = (operatingSystems[os] || 0) + 1;
    }

    const deviceTypeArr = Object.entries(deviceTypes)
      .map(([k, v]) => ({ type: k, count: v, percentage: Math.round((v / total) * 1000) / 10 }))
      .sort((a, b) => b.count - a.count);

    const browserArr = Object.entries(browsers)
      .map(([k, v]) => ({ browser: k, count: v, percentage: Math.round((v / total) * 1000) / 10 }))
      .sort((a, b) => b.count - a.count);

    const osArr = Object.entries(operatingSystems)
      .map(([k, v]) => ({ os: k, count: v, percentage: Math.round((v / total) * 1000) / 10 }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        deviceTypes: deviceTypeArr,
        browsers: browserArr,
        operatingSystems: osArr,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate devices report" });
  }
}

export async function events(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);

  try {
    const byType = await Event.aggregate([
      {
        $match: {
          ...dm,
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            eventType: "$eventType",
            customName: { $ifNull: ["$customName", null] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]).exec();

    const data = byType.map((r) => ({
      eventType: r._id.eventType,
      customName: r._id.customName,
      count: r.count,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate events report" });
  }
}

export async function live(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

  try {
    const activeSessions = await Session.find({
      ...dm,
      isActive: true,
      lastActivityAt: { $gte: fiveMinAgo },
    }).exec();

    const activeVisitors = new Set(activeSessions.map((s) => s.visitorId)).size;

    const recentEvents = await Event.find({
      ...dm,
      timestamp: { $gte: fiveMinAgo },
    })
      .sort({ timestamp: -1 })
      .limit(50)
      .select("path timestamp visitorId eventType eventId")
      .lean()
      .exec();

    res.json({
      success: true,
      data: {
        activeVisitors,
        activeSessions: activeSessions.length,
        recentEvents: recentEvents.map((e) => ({
          path: e.path,
          timestamp: e.timestamp,
          visitorId: e.visitorId,
          eventType: e.eventType,
          eventId: e.eventId,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate live report" });
  }
}

export async function timeSeries(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);
  const granularity = req.query.granularity === "hour" ? "hour" : "day";

  try {
    const dateFormat = granularity === "hour" ? "%Y-%m-%dT%H:00:00Z" : "%Y-%m-%d";

    const results = await Event.aggregate([
      {
        $match: {
          ...dm,
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$timestamp" } },
            eventType: "$eventType",
          },
          count: { $sum: 1 },
          visitors: { $addToSet: "$visitorId" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          pageViews: {
            $sum: { $cond: [{ $eq: ["$_id.eventType", "pageview"] }, "$count", 0] },
          },
          events: { $sum: "$count" },
          visitors: { $sum: { $size: "$visitors" } },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec();

    let sessionResults = [];
    if (granularity === "day") {
      sessionResults = await Session.aggregate([
        {
          $match: {
            ...dm,
            startedAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
            sessions: { $sum: 1 },
            sessionVisitors: { $addToSet: "$visitorId" },
          },
        },
      ]).exec();
    } else {
      sessionResults = await Session.aggregate([
        {
          $match: {
            ...dm,
            startedAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%dT%H:00:00Z", date: "$startedAt" } },
            sessions: { $sum: 1 },
            sessionVisitors: { $addToSet: "$visitorId" },
          },
        },
      ]).exec();
    }

    const sessionMap = {};
    for (const s of sessionResults) {
      sessionMap[s._id] = {
        sessions: s.sessions,
        visitors: s.sessionVisitors.length,
      };
    }

    const data = results.map((r) => ({
      date: r._id,
      pageViews: r.pageViews,
      sessions: sessionMap[r._id]?.sessions || 0,
      visitors: sessionMap[r._id]?.visitors || r.visitors,
      events: r.events,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate time-series report" });
  }
}

export async function funnel(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);
  const stepsParam = req.query.steps || "/";
  const stepPaths = stepsParam.split(",").map((s) => s.trim()).filter(Boolean);

  if (stepPaths.length < 2 || stepPaths.length > 10) {
    return res.status(400).json({
      success: false,
      error: "Steps must be between 2 and 10 paths (comma-separated)",
    });
  }

  try {
    const steps = [];
    let prevCount = null;

    for (let i = 0; i < stepPaths.length; i++) {
      const pathPattern = stepPaths[i];
      const matchStage = {
        ...dm,
        eventType: "pageview",
        path: { $regex: `^${pathPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        timestamp: { $gte: start, $lte: end },
      };

      const result = await Event.aggregate([
        { $match: matchStage },
        { $group: { _id: null, visitors: { $addToSet: "$visitorId" } } },
      ]).exec();

      const count = result[0]?.visitors?.length || 0;
      steps.push({
        step: i + 1,
        path: pathPattern,
        visitors: count,
      });
      prevCount = count;
    }

    const firstCount = steps[0]?.visitors || 0;
    const lastCount = steps[steps.length - 1]?.visitors || 0;
    const conversionRate = firstCount > 0 ? Math.round((lastCount / firstCount) * 1000) / 10 : 0;

    res.json({
      success: true,
      data: {
        steps,
        conversionRate,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate funnel report" });
  }
}

export async function retention(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);
  const granularity = req.query.granularity === "week" ? "week" : "day";
  const maxPeriods = Math.max(1, Math.min(52, Number(req.query.maxPeriods) || 12));

  try {
    const sessions = await Session.find({
      ...dm,
      startedAt: { $gte: start, $lte: end },
    })
      .sort({ visitorId: 1, startedAt: 1 })
      .select("visitorId startedAt")
      .lean()
      .exec();

    const visitorSessions = {};
    for (const s of sessions) {
      if (!visitorSessions[s.visitorId]) visitorSessions[s.visitorId] = [];
      visitorSessions[s.visitorId].push(s.startedAt);
    }

    const cohortMap = {};
    for (const [visitorId, dates] of Object.entries(visitorSessions)) {
      const firstDate = dates[0];
      const cohortKey = formatCohort(firstDate, granularity);
      if (!cohortMap[cohortKey]) cohortMap[cohortKey] = { size: 0, cohorts: {} };
      cohortMap[cohortKey].size += 1;
      for (const d of dates) {
        const period = periodDiff(firstDate, d, granularity);
        if (period >= 0 && period <= maxPeriods) {
          if (!cohortMap[cohortKey].cohorts[period]) cohortMap[cohortKey].cohorts[period] = 0;
          cohortMap[cohortKey].cohorts[period] += 1;
        }
      }
    }

    const data = Object.entries(cohortMap)
      .map(([cohort, info]) => {
        const size = info.size;
        const retention = [];
        for (let i = 0; i <= maxPeriods; i++) {
          if (i === 0) {
            retention.push({ period: 0, retained: size, rate: 100 });
          } else if (info.cohorts[i] !== undefined) {
            retention.push({
              period: i,
              retained: info.cohorts[i],
              rate: size > 0 ? Math.round((info.cohorts[i] / size) * 1000) / 10 : 0,
            });
          } else {
            retention.push(null);
          }
        }
        return { cohort, size, retention };
      })
      .sort((a, b) => (a.cohort > b.cohort ? 1 : -1));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate retention report" });
  }
}

export async function heatmap(req, res) {
  const path = req.query.path || "/";
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);

  try {
    const results = await Event.aggregate([
      {
        $match: {
          ...dm,
          eventType: "click",
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            tagName: "$element.tagName",
            id: "$element.id",
            className: "$element.className",
            text: "$element.text",
            href: "$element.href",
          },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { clicks: -1 } },
      { $limit: 100 },
    ]).exec();

    const totalClicks = results.reduce((sum, r) => sum + r.clicks, 0) || 1;
    const elements = results.map((r) => ({
      element: {
        tagName: r._id.tagName,
        id: r._id.id,
        className: r._id.className,
        text: r._id.text,
        href: r._id.href,
      },
      clicks: r.clicks,
      percentage: Math.round((r.clicks / totalClicks) * 1000) / 10,
    }));

    res.json({
      success: true,
      data: {
        path,
        totalClicks,
        elements,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate heatmap" });
  }
}

export async function sessionReplay(req, res) {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "sessionId query parameter is required" });
  }

  try {
    const session = await Session.findOne({ sessionId }).lean().exec();
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    const events = await Event.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean()
      .exec();

    const redactedEvents = events.map((e) => {
      const { ipHash, userAgent, ...rest } = e;
      let redacted = { ...rest };
      if (redacted.element) redacted.element = redactElement(redacted.element);
      if (redacted.customData) redacted.customData = redactPii(redacted.customData);
      if (redacted.url) redacted.url = redactUrl(redacted.url);
      if (redacted.referrer) redacted.referrer = redactUrl(redacted.referrer);
      return redacted;
    });

    res.json({
      success: true,
      data: {
        session: {
          sessionId: session.sessionId,
          visitorId: session.visitorId,
          domain: session.domain,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          duration: session.duration,
          isActive: session.isActive,
          entryPage: session.entryPage,
          exitPage: session.exitPage,
          referrer: session.referrer,
          referrerDomain: session.referrerDomain,
          utmSource: session.utmSource,
          utmMedium: session.utmMedium,
          utmCampaign: session.utmCampaign,
          deviceType: session.deviceType,
          browser: session.browser,
          os: session.os,
          country: session.country,
          pageCount: session.pageCount,
          eventCount: session.eventCount,
        },
        events: redactedEvents,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate session replay" });
  }
}

export async function returningVisitors(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);

  try {
    const results = await Session.aggregate([
      {
        $match: {
          ...dm,
          startedAt: { $gte: start, $lte: end },
        },
      },
      {
        $sort: { startedAt: 1 },
      },
      {
        $group: {
          _id: "$visitorId",
          visitCount: { $sum: 1 },
          firstVisit: { $min: "$startedAt" },
          lastVisit: { $max: "$startedAt" },
          lastSession: { $last: "$$ROOT" },
        },
      },
      {
        $match: {
          visitCount: { $gte: 2 },
        },
      },
      {
        $sort: { lastVisit: -1 },
      },
      { $limit: 200 },
    ]).exec();

    const data = results.map((r) => ({
      visitorId: r._id,
      visitCount: r.visitCount,
      firstVisit: r.firstVisit,
      lastVisit: r.lastVisit,
      deviceType: r.lastSession.deviceType || null,
      browser: r.lastSession.browser || null,
      os: r.lastSession.os || null,
      country: r.lastSession.country || null,
      referrerDomain: r.lastSession.referrerDomain || null,
      utmSource: r.lastSession.utmSource || null,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate returning visitors report" });
  }
}

export async function recentVisitors(req, res) {
  const { start, end } = getDateRange(req);
  const dm = domainMatch(req.query.domain);
  const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 50));

  try {
    const results = await Session.aggregate([
      {
        $match: {
          ...dm,
          startedAt: { $gte: start, $lte: end },
        },
      },
      {
        $sort: { startedAt: -1 },
      },
      {
        $group: {
          _id: "$visitorId",
          visitCount: { $sum: 1 },
          firstVisit: { $min: "$startedAt" },
          lastVisit: { $max: "$startedAt" },
          lastSession: { $last: "$$ROOT" },
        },
      },
      {
        $sort: { lastVisit: -1 },
      },
      { $limit: limit },
    ]).exec();

    const data = results.map((r) => ({
      visitorId: r._id,
      visitCount: r.visitCount,
      firstVisit: r.firstVisit,
      lastVisit: r.lastVisit,
      deviceType: r.lastSession.deviceType || null,
      browser: r.lastSession.browser || null,
      os: r.lastSession.os || null,
      country: r.lastSession.country || null,
      referrerDomain: r.lastSession.referrerDomain || null,
      utmSource: r.lastSession.utmSource || null,
      referrer: r.lastSession.referrer || null,
      utmMedium: r.lastSession.utmMedium || null,
      utmCampaign: r.lastSession.utmCampaign || null,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate recent visitors report" });
  }
}

function formatCohort(date, granularity) {
  const d = new Date(date);
  if (granularity === "week") {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return `${monday.getFullYear()}-W${getWeekNumber(monday)}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getDay();
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(date.valueOf());
  firstThursday.setUTCMonth(0, 3);
  const firstWeekDays = (date.getUTCDay() + 1) % 7;
  const weekNo = Math.round(((date - firstThursday) / 86400000 - 3 + firstWeekDays) / 7) + 1;
  return String(weekNo).padStart(2, "0");
}

function periodDiff(start, end, granularity) {
  const s = new Date(start);
  const e = new Date(end);
  const ms = e - s;
  if (ms < 0) return -1;
  if (granularity === "week") {
    return Math.floor(ms / (7 * 24 * 60 * 60 * 1000));
  }
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function redactElement(el) {
  if (!el) return el;
  const redacted = { ...el };
  const piiKeys = ["value", "password", "token", "secret"];
  for (const key of Object.keys(redacted)) {
    if (piiKeys.some((p) => key.toLowerCase().includes(p))) {
      redacted[key] = "[REDACTED]";
    }
  }
  return redacted;
}

function redactPii(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const redacted = {};
  const piiKeys = ["password", "token", "secret", "key", "auth", "email", "phone", "address", "ssn", "credit", "card", "cvv"];
  for (const [key, value] of Object.entries(obj)) {
    if (piiKeys.some((p) => key.toLowerCase().includes(p))) {
      redacted[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      redacted[key] = redactPii(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

function redactUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    const params = ["token", "password", "email", "auth", "session", "key", "secret", "api_key", "access_token", "refresh_token", "code", "state"];
    params.forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return null;
  }
}
