import { Event, Session, DailyStats } from "../models/index.js";
import config from "../config/env.js";
import logger from "../utils/logger.js";

function round(value, decimals = 0) {
  if (value == null || Number.isNaN(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getDayStart(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getDayEnd(date) {
  const dayStart = getDayStart(date);
  return new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export async function computeDailyStats(req, res) {
  try {
    const { date, domain } = req.body || {};
    const targetDate = date ? new Date(date) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dayStart = getDayStart(targetDate);
    const dayEnd = getDayEnd(targetDate);

    const domainMatch = domain ? { domain } : {};

    const [pageViewsAgg, sessionsAgg, eventsAgg] = await Promise.all([
      Event.aggregate([
        { $match: { timestamp: { $gte: dayStart, $lte: dayEnd }, eventType: "pageview", ...domainMatch } },
        {
          $group: {
            _id: "$path",
            count: { $sum: 1 },
            title: { $first: "$title" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 100 },
      ]),
      Session.aggregate([
        { $match: { startedAt: { $gte: dayStart, $lte: dayEnd }, ...domainMatch } },
        {
          $group: {
            _id: null,
            uniqueVisitors: { $addToSet: "$visitorId" },
            sessions: { $sum: 1 },
            totalDuration: { $sum: "$duration" },
            totalPages: { $sum: "$pageCount" },
            bounceCount: {
              $sum: {
                $cond: [
                  { $and: [{ $lte: ["$pageCount", 1] }, { $lt: ["$duration", config.bounceThresholdSeconds] }] },
                  1,
                  0,
                ],
              },
            },
            referrers: {
              $push: {
                domain: "$referrerDomain",
              },
            },
            devices: { $push: "$deviceType" },
            countries: { $push: "$country" },
          },
        },
      ]),
      Event.aggregate([
        { $match: { timestamp: { $gte: dayStart, $lte: dayEnd }, ...domainMatch } },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
      ]),
    ]);

    const sessionStats = sessionsAgg[0] || {
      uniqueVisitors: [],
      sessions: 0,
      totalDuration: 0,
      totalPages: 0,
      bounceCount: 0,
      referrers: [],
      devices: [],
      countries: [],
    };

    const uniqueVisitors = sessionStats.uniqueVisitors.length;
    const sessionCount = sessionStats.sessions;
    const bounceRate = sessionCount > 0 ? round((sessionStats.bounceCount / sessionCount) * 100, 1) : 0;
    const avgSessionDuration = sessionCount > 0 ? round(sessionStats.totalDuration / sessionCount) : 0;

    const referrerCounts = {};
    for (const r of sessionStats.referrers) {
      if (r.domain) {
        referrerCounts[r.domain] = (referrerCounts[r.domain] || 0) + 1;
      }
    }
    const referrers = Object.entries(referrerCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const deviceCounts = {};
    for (const d of sessionStats.devices) {
      if (d) {
        deviceCounts[d] = (deviceCounts[d] || 0) + 1;
      }
    }
    const devices = Object.entries(deviceCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const countryCounts = {};
    for (const c of sessionStats.countries) {
      if (c) {
        countryCounts[c] = (countryCounts[c] || 0) + 1;
      }
    }
    const countries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const topPages = pageViewsAgg.map((p) => ({
      path: p._id,
      title: p.title,
      count: p.count,
    }));

    const domainList = domain ? [domain] : await Session.distinct("domain", { startedAt: { $gte: dayStart, $lte: dayEnd } });

    const results = [];
    for (const d of domainList) {
      const dailyStats = await DailyStats.findOneAndUpdate(
        { date: dayStart, domain: d },
        {
          $set: {
            pageViews: pageViewsAgg.filter((p) => true).reduce((sum, p) => sum + p.count, 0),
            uniqueVisitors: uniqueVisitors,
            sessions: sessionCount,
            bounceRate,
            avgSessionDuration,
            topPages,
            referrers,
            devices,
            countries,
          },
        },
        { upsert: true, new: true }
      );
      results.push(dailyStats);
    }

    logger.info("daily_stats_computed", { date: dayStart.toISOString().split("T")[0], domains: domainList.length, records: results.length });

    res.json({
      success: true,
      data: results,
      period: { date: dayStart.toISOString() },
    });
  } catch (error) {
    logger.error("daily_stats_compute_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to compute daily stats" });
  }
}

export async function getDailyStats(req, res) {
  try {
    const { startDate, endDate, domain } = req.query;
    const end = endDate ? getDayEnd(new Date(endDate)) : getDayEnd(new Date());
    const start = startDate ? getDayStart(new Date(startDate)) : getDayStart(new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000));

    const match = { date: { $gte: start, $lte: end } };
    if (domain) match.domain = domain;

    const stats = await DailyStats.find(match).sort({ date: -1 }).lean();

    res.json({
      success: true,
      data: stats,
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  } catch (error) {
    logger.error("daily_stats_get_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to get daily stats" });
  }
}