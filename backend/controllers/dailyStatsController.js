import { Event, Session, DailyStats } from "../models/index.js";

export async function compute(req, res) {
  const date = req.body?.date ? new Date(req.body.date) : new Date(Date.now() - 24 * 60 * 60 * 1000);
  const domain = req.body?.domain || req.query.domain;

  date.setUTCHours(0, 0, 0, 0);
  const nextDay = new Date(date);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  const match = domain
    ? { domain, timestamp: { $gte: date, $lt: nextDay } }
    : { timestamp: { $gte: date, $lt: nextDay } };

  const sessionMatch = domain
    ? { domain, startedAt: { $gte: date, $lt: nextDay } }
    : { startedAt: { $gte: date, $lt: nextDay } };

  try {
    const [pageViews, visitorsAgg, sessionsAgg, topPages, referrers, devices, countries] = await Promise.all([
      Event.countDocuments(match).exec(),

      Event.aggregate([
        { $match: { ...match, eventType: "pageview" } },
        { $group: { _id: null, unique: { $addToSet: "$visitorId" } } },
      ]).exec(),

      Session.find(sessionMatch).exec(),

      Event.aggregate([
        { $match: { ...match, eventType: "pageview" } },
        {
          $group: {
            _id: "$path",
            title: { $first: "$title" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).exec(),

      Event.aggregate([
        { $match: { ...match, eventType: "pageview" } },
        {
          $group: {
            _id: "$referrerDomain",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).exec(),

      Session.aggregate([
        { $match: sessionMatch },
        {
          $group: {
            _id: "$deviceType",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]).exec(),

      Session.aggregate([
        { $match: sessionMatch },
        {
          $group: {
            _id: "$country",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).exec(),
    ]);

    const uniqueVisitors = visitorsAgg[0]?.unique?.length || 0;
    const totalSessions = sessionsAgg.length;

    let bounceSessions = 0;
    let totalDuration = 0;
    for (const s of sessionsAgg) {
      if ((s.pageCount || 0) <= 1 && (s.duration || 0) < 30) bounceSessions += 1;
      totalDuration += s.duration || 0;
    }

    const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 1000) / 10 : 0;
    const avgSessionDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    const stats = {
      date,
      domain: domain || "unknown",
      pageViews,
      uniqueVisitors,
      sessions: totalSessions,
      bounceRate,
      avgSessionDuration,
      topPages: topPages.map((t) => ({ path: t._id, title: t.title || t._id, count: t.count })),
      referrers: referrers.map((r) => ({ domain: r._id || "(direct)", count: r.count })),
      devices: devices.map((d) => ({ type: d._id, count: d.count })),
      countries: countries.map((c) => ({ country: c._id || "unknown", count: c.count })),
    };

    await DailyStats.findOneAndUpdate(
      { date, domain: domain || "unknown" },
      stats,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to compute daily stats" });
  }
}

export async function getDailyStats(req, res) {
  const { startDate, endDate } = req.dateRange || {};
  const domain = req.query.domain;
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate || new Date();

  try {
    const match = {
      date: { $gte: start, $lte: end },
    };
    if (domain) match.domain = domain;

    const data = await DailyStats.find(match).sort({ date: -1 }).lean().exec();

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve daily stats" });
  }
}
