import { Event, Session } from "../models/index.js";
import config from "../config/env.js";
import logger from "../utils/logger.js";

function eventMatch({ start, end, domain }) {
  const match = { timestamp: { $gte: start, $lte: end } };
  if (domain) match.domain = domain;
  return match;
}

function sessionMatch({ start, end, domain }) {
  const match = { startedAt: { $gte: start, $lte: end } };
  if (domain) match.domain = domain;
  return match;
}

function round(value, decimals = 0) {
  if (value == null || Number.isNaN(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function withPercentage(rows, total, labelKey) {
  const count = rows.reduce((sum, row) => sum + row.count, 0);
  return rows.map((row) => ({
    [labelKey]: row._id,
    count: row.count,
    percentage: count > 0 ? round((row.count / count) * 100, 1) : 0,
  }));
}

export async function overview(req, res) {
  try {
    const { start, end, domain } = req.range;
    const ev = eventMatch({ start, end, domain });
    const se = sessionMatch({ start, end, domain });

    const [pageViews, totalEvents, sessions] = await Promise.all([
      Event.countDocuments({ ...ev, eventType: "pageview" }),
      Event.countDocuments(ev),
      Session.find(se).select("visitorId pageCount duration").lean(),
    ]);

    const sessionCount = sessions.length;
    const visitorIds = [...new Set(sessions.map((s) => s.visitorId))];
    const uniqueVisitors = visitorIds.length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalPages = sessions.reduce((sum, s) => sum + (s.pageCount || 0), 0);
    const bounced = sessions.filter(
      (s) => (s.pageCount || 0) <= 1 && (s.duration || 0) < config.bounceThresholdSeconds
    ).length;

    let returningVisitors = 0;
    if (visitorIds.length > 0) {
      const returning = await Session.distinct("visitorId", {
        visitorId: { $in: visitorIds },
        startedAt: { $lt: start },
        ...(domain ? { domain } : {}),
      });
      returningVisitors = returning.length;
    }

    res.json({
      success: true,
      data: {
        pageViews,
        uniqueVisitors,
        sessions: sessionCount,
        bounceRate: round(sessionCount > 0 ? (bounced / sessionCount) * 100 : 0, 1),
        avgSessionDuration: round(sessionCount > 0 ? totalDuration / sessionCount : 0),
        avgPagesPerSession: round(sessionCount > 0 ? totalPages / sessionCount : 0, 2),
        returningVisitors,
        newVisitors: Math.max(0, uniqueVisitors - returningVisitors),
        totalEvents,
      },
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_overview_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build overview report" });
  }
}

export async function sources(req, res) {
  try {
    const { start, end, domain } = req.range;
    const se = sessionMatch({ start, end, domain });

    const rows = await Session.aggregate([
      { $match: se },
      {
        $project: {
          source: {
            $switch: {
              branches: [
                {
                  case: { $and: [{ $ne: ["$utmSource", null] }, { $ne: ["$utmSource", ""] }] },
                  then: "$utmSource",
                },
                {
                  case: {
                    $and: [{ $ne: ["$referrerDomain", null] }, { $ne: ["$referrerDomain", ""] }],
                  },
                  then: "$referrerDomain",
                },
              ],
              default: "direct",
            },
          },
        },
      },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    const total = rows.reduce((sum, row) => sum + row.count, 0);
    res.json({
      success: true,
      data: rows.map((row) => ({
        source: row._id,
        visits: row.count,
        percentage: total > 0 ? round((row.count / total) * 100, 1) : 0,
      })),
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_sources_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build sources report" });
  }
}

export async function pages(req, res) {
  try {
    const { start, end, domain } = req.range;
    const ev = eventMatch({ start, end, domain });

    const rows = await Event.aggregate([
      { $match: { ...ev, eventType: "pageview", path: { $ne: null } } },
      {
        $group: {
          _id: "$path",
          pageViews: { $sum: 1 },
          visitors: { $addToSet: "$visitorId" },
          avgTime: { $avg: "$duration" },
          title: { $first: "$title" },
        },
      },
      { $sort: { pageViews: -1 } },
      { $limit: 100 },
    ]);

    res.json({
      success: true,
      data: rows.map((row) => ({
        path: row._id,
        title: row.title || null,
        pageViews: row.pageViews,
        uniqueVisitors: row.visitors.length,
        avgTime: round(row.avgTime || 0),
      })),
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_pages_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build pages report" });
  }
}

export async function devices(req, res) {
  try {
    const { start, end, domain } = req.range;
    const se = sessionMatch({ start, end, domain });

    const [deviceTypes, browsers, operatingSystems] = await Promise.all([
      Session.aggregate([
        { $match: se },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Session.aggregate([
        { $match: { ...se, browser: { $ne: null } } },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      Session.aggregate([
        { $match: { ...se, os: { $ne: null } } },
        { $group: { _id: "$os", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        deviceTypes: withPercentage(deviceTypes, null, "type"),
        browsers: withPercentage(browsers, null, "browser"),
        operatingSystems: withPercentage(operatingSystems, null, "os"),
      },
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_devices_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build devices report" });
  }
}

export async function eventsReport(req, res) {
  try {
    const { start, end, domain } = req.range;
    const ev = eventMatch({ start, end, domain });

    const [byType, byCustom] = await Promise.all([
      Event.aggregate([
        { $match: ev },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Event.aggregate([
        { $match: { ...ev, eventType: "custom", customName: { $ne: null } } },
        { $group: { _id: "$customName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 100 },
      ]),
    ]);

    res.json({
      success: true,
      data: [
        ...byType.map((row) => ({ eventType: row._id, count: row.count })),
        ...byCustom.map((row) => ({ customName: row._id, count: row.count })),
      ],
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_events_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build events report" });
  }
}

export async function live(req, res) {
  try {
    const { domain } = req.range;
    const since = new Date(Date.now() - config.liveWindowMs);
    const activityMatch = { lastActivityAt: { $gte: since }, isActive: true };
    if (domain) activityMatch.domain = domain;
    const eventMatchLive = { timestamp: { $gte: since } };
    if (domain) eventMatchLive.domain = domain;

    const [activeSessions, recentEvents] = await Promise.all([
      Session.find(activityMatch).sort({ lastActivityAt: -1 }).limit(100).select("sessionId visitorId domain entryPage lastActivityAt pageCount -_id").lean(),
      Event.find(eventMatchLive).sort({ timestamp: -1 }).limit(25).select("eventType path title domain visitorId sessionId timestamp -_id").lean(),
    ]);

    const activeVisitors = new Set(activeSessions.map((s) => s.visitorId)).size;

    res.json({
      success: true,
      data: {
        activeVisitors,
        activeSessions: activeSessions.length,
        recentEvents,
      },
      windowMs: config.liveWindowMs,
    });
  } catch (error) {
    logger.error("report_live_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build live report" });
  }
}

export async function timeSeries(req, res) {
  try {
    const { start, end, domain, granularity } = req.range;
    const ev = eventMatch({ start, end, domain });

    const groupId =
      granularity === "hour"
        ? {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
            hour: { $hour: "$timestamp" },
          }
        : {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          };

    const sortId =
      granularity === "hour"
        ? { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 }
        : { "_id.year": 1, "_id.month": 1, "_id.day": 1 };

    const rows = await Event.aggregate([
      { $match: ev },
      {
        $group: {
          _id: groupId,
          pageViews: { $sum: { $cond: [{ $eq: ["$eventType", "pageview"] }, 1, 0] } },
          events: { $sum: 1 },
          sessions: { $addToSet: "$sessionId" },
          visitors: { $addToSet: "$visitorId" },
        },
      },
      { $sort: sortId },
    ]);

    const data = rows.map((row) => {
      const id = row._id;
      const date =
        granularity === "hour"
          ? new Date(Date.UTC(id.year, id.month - 1, id.day, id.hour))
          : new Date(Date.UTC(id.year, id.month - 1, id.day));
      return {
        date: date.toISOString(),
        pageViews: row.pageViews,
        sessions: row.sessions.length,
        visitors: row.visitors.length,
        events: row.events,
      };
    });

    res.json({
      success: true,
      data,
      granularity,
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_time_series_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build time-series report" });
  }
}

export async function recentVisitors(req, res) {
  try {
    const { start, end, domain, limit = 50 } = req.range;
    const se = sessionMatch({ start, end, domain });

    const rows = await Session.aggregate([
      { $match: se },
      {
        $sort: { startedAt: -1 },
      },
      {
        $group: {
          _id: "$visitorId",
          lastVisit: { $first: "$startedAt" },
          visitCount: { $sum: 1 },
          domain: { $first: "$domain" },
          deviceType: { $first: "$deviceType" },
          browser: { $first: "$browser" },
          os: { $first: "$os" },
          country: { $first: "$country" },
          referrerDomain: { $first: "$referrerDomain" },
          utmSource: { $first: "$utmSource" },
        },
      },
      { $sort: { lastVisit: -1 } },
      { $limit: Math.min(Number(limit), 200) },
    ]);

    res.json({
      success: true,
      data: rows.map((row) => ({
        visitorId: row._id,
        lastVisit: row.lastVisit,
        visitCount: row.visitCount,
        domain: row.domain,
        deviceType: row.deviceType,
        browser: row.browser,
        os: row.os,
        country: row.country,
        referrerDomain: row.referrerDomain,
        utmSource: row.utmSource,
      })),
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_recent_visitors_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build recent visitors report" });
  }
}

export async function funnel(req, res) {
  try {
    const { start, end, domain } = req.range;
    const stepPaths = (req.query.steps || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (stepPaths.length < 2 || stepPaths.length > 10) {
      return res.status(400).json({ success: false, error: "steps parameter required (2-10 comma-separated paths)" });
    }

    const ev = eventMatch({ start, end, domain });
    const se = sessionMatch({ start, end, domain });

    const sessionsWithPageviews = await Event.aggregate([
      { $match: { ...ev, eventType: "pageview", path: { $in: stepPaths } } },
      { $group: { _id: "$sessionId", paths: { $push: "$path" }, timestamps: { $push: "$timestamp" } } },
      { $project: { sessionId: "$_id", paths: 1, timestamps: 1, _id: 0 } },
    ]);

    const sessionPathSets = new Map();
    for (const s of sessionsWithPageviews) {
      const uniquePaths = [...new Set(s.paths)];
      sessionPathSets.set(s.sessionId, uniquePaths);
    }

    const funnelData = stepPaths.map((path, index) => {
      const visitors = new Set();
      for (const [sessionId, paths] of sessionPathSets.entries()) {
        const pathIndex = paths.indexOf(path);
        if (pathIndex !== -1) {
          let hasPrevious = true;
          for (let i = 0; i < index; i++) {
            if (!paths.includes(stepPaths[i])) {
              hasPrevious = false;
              break;
            }
          }
          if (hasPrevious) {
            visitors.add(sessionId);
          }
        }
      }
      return { step: index + 1, path, visitors: visitors.size };
    });

    const totalSessions = await Session.countDocuments(se);
    const conversionRate = funnelData[0]?.visitors > 0
      ? round((funnelData[funnelData.length - 1].visitors / funnelData[0].visitors) * 100, 1)
      : 0;

    res.json({
      success: true,
      data: {
        steps: funnelData,
        totalSessions,
        conversionRate,
      },
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_funnel_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build funnel report" });
  }
}

export async function retention(req, res) {
  try {
    const { start, end, domain, granularity = "day" } = req.range;
    const cohortSize = Number(req.query.cohortSize) || 7;
    const maxPeriods = Number(req.query.maxPeriods) || 12;

    const se = sessionMatch({ start, end, domain });
    const sessions = await Session.find(se).select("visitorId startedAt").lean();

    const visitorFirstVisit = new Map();
    for (const s of sessions) {
      const dateKey = s.startedAt.toISOString().split("T")[0];
      if (!visitorFirstVisit.has(s.visitorId) || new Date(dateKey) < new Date(visitorFirstVisit.get(s.visitorId))) {
        visitorFirstVisit.set(s.visitorId, dateKey);
      }
    }

    const cohorts = new Map();
    for (const [visitorId, firstDate] of visitorFirstVisit.entries()) {
      const cohortKey = firstDate;
      if (!cohorts.has(cohortKey)) cohorts.set(cohortKey, new Set());
      cohorts.get(cohortKey).add(visitorId);
    }

    const sessionByVisitor = new Map();
    for (const s of sessions) {
      if (!sessionByVisitor.has(s.visitorId)) sessionByVisitor.set(s.visitorId, []);
      sessionByVisitor.get(s.visitorId).push(s.startedAt);
    }

    const retentionData = [];
    const sortedCohorts = [...cohorts.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    for (const [cohortDate, visitors] of sortedCohorts) {
      const cohortStart = new Date(cohortDate);
      const row = { cohort: cohortDate, size: visitors.size, retention: [] };

      for (let period = 0; period < maxPeriods; period++) {
        let periodStart, periodEnd;
        if (granularity === "week") {
          periodStart = new Date(cohortStart.getTime() + period * 7 * 24 * 60 * 60 * 1000);
          periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else {
          periodStart = new Date(cohortStart.getTime() + period * 24 * 60 * 60 * 1000);
          periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
        }

        if (periodStart > end) {
          row.retention.push(null);
          continue;
        }

        let retained = 0;
        for (const visitorId of visitors) {
          const visits = sessionByVisitor.get(visitorId) || [];
          const hasVisit = visits.some((v) => v >= periodStart && v < periodEnd);
          if (hasVisit) retained++;
        }

        row.retention.push({
          period,
          retained,
          rate: visitors.size > 0 ? round((retained / visitors.size) * 100, 1) : 0,
        });
      }

      retentionData.push(row);
    }

    res.json({
      success: true,
      data: retentionData,
      granularity,
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_retention_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build retention report" });
  }
}

export async function heatmap(req, res) {
  try {
    const { start, end, domain } = req.range;
    const path = req.query.path;
    if (!path) {
      return res.status(400).json({ success: false, error: "path query parameter is required" });
    }

    const ev = eventMatch({ start, end, domain });
    const clickEvents = await Event.find({
      ...ev,
      eventType: "click",
      path: path,
      "element.tagName": { $in: ["a", "button", "input", "select", "textarea", "div", "span", "img"] },
    }).select("element timestamp scrollDepth -_id").lean();

    const clickMap = new Map();
    for (const e of clickEvents) {
      const el = e.element;
      if (!el) continue;
      const key = `${el.tagName}|${el.id || ""}|${el.className || ""}|${el.text || ""}`.substring(0, 200);
      const entry = clickMap.get(key) || { count: 0, tagName: el.tagName, id: el.id, className: el.className, text: el.text, href: el.href };
      entry.count++;
      clickMap.set(key, entry);
    }

    const totalClicks = clickEvents.length;
    const data = [...clickMap.entries()]
      .map(([key, val]) => ({
        element: { tagName: val.tagName, id: val.id, className: val.className, text: val.text, href: val.href },
        clicks: val.count,
        percentage: totalClicks > 0 ? round((val.count / totalClicks) * 100, 1) : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 100);

    res.json({
      success: true,
      data: { path, totalClicks, elements: data },
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_heatmap_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build heatmap report" });
  }
}

export async function sessionReplay(req, res) {
  try {
    const { start, end, domain } = req.range;
    const sessionId = req.query.sessionId;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: "sessionId query parameter is required" });
    }

    const session = await Session.findOne({ sessionId, ...(domain ? { domain } : {}) }).lean();
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    const ev = eventMatch({ start, end, domain });
    const events = await Event.find({ ...ev, sessionId }).sort({ timestamp: 1 }).select(
      "eventType path title element customName customData duration scrollDepth timestamp referrer -_id"
    ).lean();

    const sensitiveFields = ["password", "token", "secret", "api_key", "apikey", "auth", "session", "credit", "card", "ssn", "email", "phone", "address"];
    function sanitize(obj) {
      if (!obj || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) return obj.map(sanitize);
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some((f) => lowerKey.includes(f));
        if (isSensitive) {
          sanitized[key] = "[REDACTED]";
        } else if (value && typeof value === "object") {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }

    const sanitizedEvents = events.map((e) => ({
      ...e,
      url: undefined,
      element: e.element ? sanitize(e.element) : undefined,
      customData: e.customData ? sanitize(e.customData) : undefined,
    }));

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
          screenWidth: session.screenWidth,
          screenHeight: session.screenHeight,
          language: session.language,
          country: session.country,
        },
        events: sanitizedEvents,
      },
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_session_replay_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build session replay" });
  }
}

export async function returningVisitors(req, res) {
  try {
    const { start, end, domain, limit = 50 } = req.range;
    const se = sessionMatch({ start, end, domain });

    const visitorCounts = await Session.aggregate([
      { $match: se },
      { $group: { _id: "$visitorId", visitCount: { $sum: 1 }, lastVisit: { $max: "$startedAt" }, firstVisit: { $min: "$startedAt" } } },
      { $match: { visitCount: { $gt: 1 } } },
      { $sort: { visitCount: -1, lastVisit: -1 } },
      { $limit: Math.min(Number(limit), 200) },
    ]);

    const visitorIds = visitorCounts.map((v) => v._id);
    const sessionsDetail = await Session.find({ visitorId: { $in: visitorIds }, ...(domain ? { domain } : {}) })
      .select("visitorId deviceType browser os country referrerDomain utmSource startedAt")
      .lean();

    const detailMap = new Map();
    for (const s of sessionsDetail) {
      if (!detailMap.has(s.visitorId)) detailMap.set(s.visitorId, s);
    }

    res.json({
      success: true,
      data: visitorCounts.map((v) => ({
        visitorId: v._id,
        visitCount: v.visitCount,
        firstVisit: v.firstVisit,
        lastVisit: v.lastVisit,
        deviceType: detailMap.get(v._id)?.deviceType,
        browser: detailMap.get(v._id)?.browser,
        os: detailMap.get(v._id)?.os,
        country: detailMap.get(v._id)?.country,
        referrerDomain: detailMap.get(v._id)?.referrerDomain,
        utmSource: detailMap.get(v._id)?.utmSource,
      })),
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("report_returning_visitors_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to build returning visitors report" });
  }
}
