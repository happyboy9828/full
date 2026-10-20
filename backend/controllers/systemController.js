import mongoose from "mongoose";
import os from "os";
import { dbState } from "../db/db.js";
import config from "../config/env.js";
import {
  Admin,
  AdminActivity,
  AdminSession,
  AppUser,
  Event,
  Session,
  Feedback,
  DailyStats,
} from "../models/index.js";

/**
 * System statistics endpoint — health, resource usage and collection counts.
 *
 * Every count is best-effort: a failing counter must not break the whole
 * payload, so each is resolved independently and reported as `null` on error.
 */

function safeCount(model, filter = {}) {
  try {
    return model.countDocuments(filter);
  } catch {
    return null;
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return null;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export async function getSystemStats(req, res) {
  const memory = process.memoryUsage();
  const now = new Date();

  const [
    adminCount,
    activeAdminCount,
    appUserCount,
    activeAppUserCount,
    activityCount,
    activeSessions,
    totalSessions,
    eventCount,
    feedbackCount,
    dailyStatsCount,
    recentFailures,
    topActions,
  ] = await Promise.all([
    safeCount(Admin),
    safeCount(Admin, { isActive: true }),
    safeCount(AppUser),
    safeCount(AppUser, { status: "active" }),
    safeCount(AdminActivity),
    safeCount(AdminSession, { revokedAt: null, expiresAt: { $gt: now } }),
    safeCount(Session),
    safeCount(Event),
    safeCount(Feedback),
    safeCount(DailyStats),
    safeCount(AdminActivity, { status: "failure", createdAt: { $gte: new Date(now.getTime() - 24 * 3600 * 1000) } }),
    AdminActivity.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]).catch(() => []),
  ]);

  let storage = null;
  try {
    const stats = await mongoose.connection.db?.admin().command({ listDatabases: 1 });
    const entry = stats?.databases?.find((db) => db.name === config.dbName);
    if (entry) {
      storage = { sizeOnDisk: entry.sizeOnDisk, size: formatBytes(entry.sizeOnDisk) };
    }
  } catch {
    /* storage stats are not available on every deployment */
  }

  return res.json({
    success: true,
    data: {
      generatedAt: now.toISOString(),
      server: {
        nodeVersion: process.version,
        platform: `${os.type()} ${os.release()}`,
        hostname: os.hostname(),
        environment: config.nodeEnv,
        uptimeSeconds: Math.floor(process.uptime()),
        uptime: formatDuration(process.uptime()),
        pid: process.pid,
      },
      memory: {
        rss: memory.rss,
        rssFormatted: formatBytes(memory.rss),
        heapUsed: memory.heapUsed,
        heapUsedFormatted: formatBytes(memory.heapUsed),
        heapTotal: memory.heapTotal,
        heapTotalFormatted: formatBytes(memory.heapTotal),
        systemTotal: os.totalmem(),
        systemFree: os.freemem(),
        systemTotalFormatted: formatBytes(os.totalmem()),
        cpuLoad: os.loadavg()[0]?.toFixed(2) ?? null,
        cpus: os.cpus().length,
      },
      database: {
        state: dbState(),
        name: config.dbName,
        host: mongoose.connection.host || null,
        storage,
      },
      counts: {
        administrators: adminCount,
        activeAdministrators: activeAdminCount,
        appUsers: appUserCount,
        activeAppUsers: activeAppUserCount,
        activityEntries: activityCount,
        activeAdminSessions: activeSessions,
        visitorSessions: totalSessions,
        events: eventCount,
        feedback: feedbackCount,
        dailyStats: dailyStatsCount,
        failuresLast24h: recentFailures,
      },
      topActions: topActions.map((entry) => ({ action: entry._id, count: entry.count })),
    },
  });
}

function formatDuration(seconds) {
  const total = Math.floor(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}
