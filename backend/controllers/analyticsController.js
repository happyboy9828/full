import crypto from "crypto";
import mongoose from "mongoose";
import { Site, Session, Event } from "../models/index.js";
import { sanitizeUrl, hashIp, parseUserAgent, sanitizeCustomData, sanitizeElement } from "../utils/sanitize.js";
import { dbState } from "../db/db.js";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function truncate(str, max = 500) {
  if (!str || typeof str !== "string") return null;
  return str.length > max ? str.slice(0, max) : str;
}

async function findOrCreateSite(domain) {
  if (!domain) return null;
  try {
    return await Site.findOneAndUpdate(
      { domain },
      { $setOnInsert: { domain, name: domain } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch {
    return null;
  }
}

export async function health(req, res) {
  res.json({
    success: true,
    status: "ok",
    database: dbState(),
    service: "analytics",
  });
}

export async function track(req, res) {
  const body = req.body || {};
  const ipHash = hashIp(req.ip || req.connection?.remoteAddress);

  const ua = req.get("user-agent") || "";
  const uaInfo = parseUserAgent(ua);

  const payload = {
    eventId: crypto.randomUUID(),
    eventType: body.eventType || "custom",
    sessionId: body.sessionId,
    visitorId: body.visitorId,
    domain: body.domain,
    path: body.path,
    url: sanitizeUrl(body.url),
    title: body.title ? truncate(body.title, 300) : null,
    referrer: sanitizeUrl(body.referrer),
    referrerDomain: body.referrerDomain || null,
    previousPath: body.previousPath || null,
    element: sanitizeElement(body.element),
    customName: body.customName ? truncate(body.customName, 200) : null,
    customData: sanitizeCustomData(body.customData),
    duration: body.duration != null ? Number(body.duration) : null,
    scrollDepth: body.scrollDepth != null ? Number(body.scrollDepth) : null,
    timestamp: new Date(body.timestamp || Date.now()),
    ipHash,
    userAgent: ua ? truncate(ua, 500) : null,
  };

  try {
    await Event.create(payload);

    if (body.sessionId && body.domain) {
      const update = {
        $inc: { eventCount: 1 },
        $set: {
          lastActivityAt: new Date(),
          browser: body.browser || uaInfo.browser,
          browserVersion: body.browserVersion || uaInfo.browserVersion,
          os: body.os || uaInfo.os,
          osVersion: body.osVersion || uaInfo.osVersion,
          deviceType: body.deviceType || uaInfo.deviceType,
          screenWidth: body.screenWidth || null,
          screenHeight: body.screenHeight || null,
          viewportWidth: body.viewportWidth || null,
          viewportHeight: body.viewportHeight || null,
          language: body.language || null,
        },
      };
      await Session.updateOne({ sessionId: body.sessionId, domain: body.domain }, update).exec();
    }

    res.json({ success: true, eventId: payload.eventId });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to record event" });
  }
}

export async function pageview(req, res) {
  const body = req.body || {};
  body.eventType = "pageview";

  if (body.domain) {
    await findOrCreateSite(body.domain);
  }

  const ipHash = hashIp(req.ip || req.connection?.remoteAddress);
  const ua = req.get("user-agent") || "";
  const uaInfo = parseUserAgent(ua);

  const payload = {
    eventId: crypto.randomUUID(),
    eventType: "pageview",
    sessionId: body.sessionId,
    visitorId: body.visitorId,
    domain: body.domain,
    path: body.path,
    url: sanitizeUrl(body.url),
    title: body.title ? truncate(body.title, 300) : null,
    referrer: sanitizeUrl(body.referrer),
    referrerDomain: body.referrerDomain || null,
    previousPath: body.previousPath || null,
    duration: body.duration != null ? Number(body.duration) : null,
    scrollDepth: body.scrollDepth != null ? Number(body.scrollDepth) : null,
    timestamp: new Date(body.timestamp || Date.now()),
    ipHash,
    userAgent: ua ? truncate(ua, 500) : null,
  };

  try {
    await Event.create(payload);

    if (body.sessionId && body.domain) {
      const update = {
        $inc: { pageCount: 1, eventCount: 1 },
        $set: {
          lastActivityAt: new Date(),
          browser: uaInfo.browser,
          browserVersion: uaInfo.browserVersion,
          os: uaInfo.os,
          osVersion: uaInfo.osVersion,
          deviceType: uaInfo.deviceType,
          screenWidth: body.screenWidth || null,
          screenHeight: body.screenHeight || null,
          viewportWidth: body.viewportWidth || null,
          viewportHeight: body.viewportHeight || null,
          language: body.language || null,
          referrer: sanitizeUrl(body.referrer),
          referrerDomain: body.referrerDomain || null,
        },
      };
      await Session.updateOne({ sessionId: body.sessionId, domain: body.domain }, update).exec();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to record pageview" });
  }
}

export async function startSession(req, res) {
  const body = req.body || {};
  const ipHash = hashIp(req.ip || req.connection?.remoteAddress);
  const ua = req.get("user-agent") || "";
  const uaInfo = parseUserAgent(ua);

  if (body.domain) {
    await findOrCreateSite(body.domain);
  }

  const sessionData = {
    sessionId: body.sessionId,
    visitorId: body.visitorId,
    domain: body.domain,
    entryPage: body.path || body.url || null,
    referrer: sanitizeUrl(body.referrer),
    referrerDomain: body.referrerDomain || null,
    utmSource: body.utmSource || null,
    utmMedium: body.utmMedium || null,
    utmCampaign: body.utmCampaign || null,
    utmTerm: body.utmTerm || null,
    utmContent: body.utmContent || null,
    deviceType: uaInfo.deviceType,
    browser: uaInfo.browser,
    browserVersion: uaInfo.browserVersion,
    os: uaInfo.os,
    osVersion: uaInfo.osVersion,
    language: body.language || null,
    screenWidth: body.screenWidth || null,
    screenHeight: body.screenHeight || null,
    viewportWidth: body.viewportWidth || null,
    viewportHeight: body.viewportHeight || null,
    ipHash,
    userAgent: ua ? truncate(ua, 500) : null,
    startedAt: new Date(body.startedAt || Date.now()),
    lastActivityAt: new Date(),
    isActive: true,
    pageCount: 0,
    eventCount: 0,
    duration: 0,
  };

  try {
    await Session.findOneAndUpdate(
      { sessionId: body.sessionId },
      sessionData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    res.json({ success: true, sessionId: body.sessionId });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to start session" });
  }
}

export async function heartbeat(req, res) {
  const body = req.body || {};

  try {
    const update = {
      $inc: { duration: body.duration || 0 },
      $set: {
        lastActivityAt: new Date(),
        isActive: true,
      },
    };

    await Session.updateOne(
      { sessionId: body.sessionId },
      update
    ).exec();

    const session = await Session.findOne({ sessionId: body.sessionId }).lean().exec();
    const duration = body.duration || 0;
    const scrollDepth = body.scrollDepth != null ? Number(body.scrollDepth) : 0;
    const ipHash = hashIp(req.ip || req.connection?.remoteAddress);
    const ua = req.get("user-agent") || "";
    const uaInfo = parseUserAgent(ua);

    const eventPayload = {
      eventId: crypto.randomUUID(),
      eventType: "heartbeat",
      sessionId: body.sessionId,
      visitorId: body.visitorId || session?.visitorId,
      domain: body.domain || session?.domain,
      duration,
      scrollDepth,
      timestamp: new Date(),
      ipHash,
      userAgent: ua ? truncate(ua, 500) : null,
      browser: uaInfo.browser,
      os: uaInfo.os,
      deviceType: uaInfo.deviceType,
    };

    await Event.create(eventPayload);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to record heartbeat" });
  }
}

export async function endSession(req, res) {
  const body = req.body || {};

  try {
    const session = await Session.findOne({ sessionId: body.sessionId }).lean().exec();

    await Session.updateOne(
      { sessionId: body.sessionId },
      {
        $set: {
          isActive: false,
          endedAt: new Date(),
          exitPage: body.exitPage || null,
          lastActivityAt: new Date(),
        },
      }
    ).exec();

    const ipHash = hashIp(req.ip || req.connection?.remoteAddress);
    const eventPayload = {
      eventId: crypto.randomUUID(),
      eventType: "navigation",
      sessionId: body.sessionId,
      visitorId: body.visitorId || session?.visitorId,
      domain: body.domain || session?.domain,
      path: body.exitPage || null,
      timestamp: new Date(),
      ipHash,
    };

    await Event.create(eventPayload);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to end session", details: err.message });
  }
}

export async function markStaleInactive(req, res) {
  const timeoutMs = (req.body && req.body.timeoutMs) || SESSION_TIMEOUT_MS;
  const threshold = new Date(Date.now() - timeoutMs);

  try {
    const result = await Session.updateMany(
      { isActive: true, lastActivityAt: { $lt: threshold } },
      {
        $set: {
          isActive: false,
          endedAt: new Date(),
        },
      }
    ).exec();

    res.json({
      success: true,
      updated: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to mark stale sessions" });
  }
}
