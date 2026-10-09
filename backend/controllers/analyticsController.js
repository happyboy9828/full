import { Event, Session, Site } from "../models/index.js";
import {
  randomUUID,
  sanitizeUrl,
  sanitizeText,
  sanitizeElement,
  sanitizeCustomData,
  extractDomain,
  parseUserAgent,
  hashValue,
} from "../utils/sanitize.js";
import logger from "../utils/logger.js";
import {
  validateTrackPayload,
  validatePageviewPayload,
  validateSessionStartPayload,
  validateHeartbeatPayload,
  validateEndSessionPayload,
} from "../middleware/validate.js";

const siteCache = new Map();

async function resolveSite(domain) {
  if (!domain) return null;
  if (siteCache.has(domain)) return siteCache.get(domain);
  let site = await Site.findOne({ domain }).lean();
  if (!site) {
    const created = await Site.create({ domain, name: domain });
    site = created.toObject();
    logger.info("site_registered", { domain });
  }
  siteCache.set(domain, site);
  return site;
}

export async function trackEvent(req, res) {
  try {
    const errors = validateTrackPayload(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const body = req.body;
    const domain = sanitizeText(body.domain, 255) || extractDomain(body.url);
    const site = await resolveSite(domain);
    const now = new Date();

    const event = await Event.create({
      eventId: randomUUID(),
      eventType: body.eventType,
      sessionId: body.sessionId,
      visitorId: body.visitorId,
      siteId: site ? site._id : null,
      domain: domain || null,
      path: sanitizeText(body.path, 500),
      url: sanitizeUrl(body.url),
      title: sanitizeText(body.title, 300),
      referrer: sanitizeUrl(body.referrer),
      referrerDomain: extractDomain(body.referrer),
      previousPath: sanitizeText(body.previousPath, 500),
      element: sanitizeElement(body.element),
      customName: body.eventType === "custom" ? sanitizeText(body.customName, 100) : null,
      customData: body.eventType === "custom" ? sanitizeCustomData(body.customData) : null,
      duration: typeof body.duration === "number" && Number.isFinite(body.duration) ? body.duration : null,
      scrollDepth: typeof body.scrollDepth === "number" && Number.isFinite(body.scrollDepth) ? body.scrollDepth : null,
      timestamp: now,
    });

    Session.updateOne(
      { sessionId: body.sessionId },
      { $inc: { eventCount: 1 }, $set: { lastActivityAt: now, isActive: true } }
    ).catch(() => {});

    logger.info("event_ingested", { eventType: event.eventType, domain: domain || "unknown" });
    res.json({ success: true, eventId: event.eventId });
  } catch (error) {
    logger.error("event_ingest_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to store event" });
  }
}

export async function trackPageview(req, res) {
  try {
    const errors = validatePageviewPayload(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const body = req.body;
    const domain = sanitizeText(body.domain, 255) || extractDomain(body.url);
    const site = await resolveSite(domain);
    const now = new Date();

    const event = await Event.create({
      eventId: randomUUID(),
      eventType: "pageview",
      sessionId: body.sessionId,
      visitorId: body.visitorId,
      siteId: site ? site._id : null,
      domain: domain || null,
      path: sanitizeText(body.path, 500),
      url: sanitizeUrl(body.url),
      title: sanitizeText(body.title, 300),
      referrer: sanitizeUrl(body.referrer),
      referrerDomain: extractDomain(body.referrer),
      previousPath: sanitizeText(body.previousPath, 500),
      timestamp: now,
    });

    Session.updateOne(
      { sessionId: body.sessionId },
      {
        $inc: { eventCount: 1, pageCount: 1 },
        $set: { lastActivityAt: now, isActive: true },
      }
    ).catch(() => {});

    logger.info("pageview_ingested", { path: event.path, domain: domain || "unknown" });
    res.json({ success: true, eventId: event.eventId });
  } catch (error) {
    logger.error("pageview_ingest_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to store pageview" });
  }
}

export async function startSession(req, res) {
  try {
    const errors = validateSessionStartPayload(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const body = req.body;
    const domain = sanitizeText(body.domain, 255) || extractDomain(body.url);
    const site = await resolveSite(domain);
    const ua = parseUserAgent(req.headers["user-agent"]);
    const now = new Date();

    const existing = await Session.findOne({ sessionId: body.sessionId });
    if (existing) {
      existing.lastActivityAt = now;
      existing.isActive = true;
      if (!existing.endedAt) existing.markModified("endedAt");
      await existing.save();
      return res.json({ success: true, sessionId: existing.sessionId });
    }

    const session = await Session.create({
      sessionId: body.sessionId,
      visitorId: body.visitorId,
      siteId: site ? site._id : null,
      domain: domain || null,
      startedAt: now,
      lastActivityAt: now,
      entryPage: sanitizeText(body.path, 500),
      referrer: sanitizeUrl(body.referrer),
      referrerDomain: extractDomain(body.referrer),
      utmSource: sanitizeText(body.utmSource, 255),
      utmMedium: sanitizeText(body.utmMedium, 255),
      utmCampaign: sanitizeText(body.utmCampaign, 255),
      utmTerm: sanitizeText(body.utmTerm, 255),
      utmContent: sanitizeText(body.utmContent, 255),
      country: sanitizeText(body.country, 100),
      deviceType: ua.deviceType,
      browser: ua.browser,
      browserVersion: ua.browserVersion,
      os: ua.os,
      osVersion: ua.osVersion,
      language: req.headers["accept-language"]
        ? sanitizeText(req.headers["accept-language"].split(",")[0], 50)
        : null,
      screenWidth: typeof body.screenWidth === "number" ? body.screenWidth : null,
      screenHeight: typeof body.screenHeight === "number" ? body.screenHeight : null,
      viewportWidth: typeof body.viewportWidth === "number" ? body.viewportWidth : null,
      viewportHeight: typeof body.viewportHeight === "number" ? body.viewportHeight : null,
      ipHash: hashValue(req.ip),
      userAgent: sanitizeText(req.headers["user-agent"], 500),
    });

    logger.info("session_started", { sessionId: session.sessionId, domain: domain || "unknown" });
    res.json({ success: true, sessionId: session.sessionId });
  } catch (error) {
    logger.error("session_start_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to start session" });
  }
}

export async function heartbeat(req, res) {
  try {
    const errors = validateHeartbeatPayload(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const body = req.body;
    const now = new Date();
    const update = {
      $set: { lastActivityAt: now, isActive: true },
      $inc: { duration: typeof body.duration === "number" ? body.duration : 0 },
    };
    if (typeof body.scrollDepth === "number") {
      update.$max = { scrollDepth: body.scrollDepth };
    }

    const result = await Session.updateOne({ sessionId: body.sessionId }, update);
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }
    res.json({ success: true });
  } catch (error) {
    logger.error("heartbeat_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to record heartbeat" });
  }
}

export async function endSession(req, res) {
  try {
    const errors = validateEndSessionPayload(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const body = req.body;
    const session = await Session.findOne({ sessionId: body.sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    session.endedAt = new Date();
    session.isActive = false;
    if (body.exitPage) session.exitPage = sanitizeText(body.exitPage, 500);
    if (!session.duration) {
      const elapsed = (session.endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000;
      session.duration = Math.max(0, Math.round(elapsed));
    }
    await session.save();

    logger.info("session_ended", { sessionId: session.sessionId, duration: session.duration });
    res.json({ success: true });
  } catch (error) {
    logger.error("session_end_failed", { error: error.message });
    res.status(500).json({ success: false, error: "Failed to end session" });
  }
}
