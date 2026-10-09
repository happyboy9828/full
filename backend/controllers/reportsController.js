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
