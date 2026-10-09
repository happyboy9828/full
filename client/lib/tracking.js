"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const TRACKING_API = process.env.NEXT_PUBLIC_TRACKING_API || "http://localhost:5000/api/analytics";
const HEARTBEAT_INTERVAL_MS = 30000;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const STORAGE_KEYS = {
  visitorId: "docfix_visitor_id",
  sessionId: "docfix_session_id",
  sessionStart: "docfix_session_start",
  lastActivity: "docfix_last_activity",
  consent: "docfix_consent",
  pendingEvents: "docfix_pending_events",
};

const EVENT_TYPES = {
  PAGEVIEW: "pageview",
  CLICK: "click",
  NAVIGATION: "navigation",
  HEARTBEAT: "heartbeat",
  OUTBOUND: "outbound",
  CUSTOM: "custom",
};

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getStorage(key) {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
  }
}

function removeStorage(key) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
  }
}

function getVisitorId() {
  let visitorId = getStorage(STORAGE_KEYS.visitorId);
  if (!visitorId) {
    visitorId = generateUUID();
    setStorage(STORAGE_KEYS.visitorId, visitorId);
  }
  return visitorId;
}

function getSessionId() {
  const now = Date.now();
  const sessionStart = parseInt(getStorage(STORAGE_KEYS.sessionStart) || "0", 10);
  const lastActivity = parseInt(getStorage(STORAGE_KEYS.lastActivity) || "0", 10);
  let sessionId = getStorage(STORAGE_KEYS.sessionId);

  if (!sessionId || now - sessionStart > SESSION_TIMEOUT_MS || now - lastActivity > SESSION_TIMEOUT_MS) {
    sessionId = generateUUID();
    setStorage(STORAGE_KEYS.sessionId, sessionId);
    setStorage(STORAGE_KEYS.sessionStart, now.toString());
  }

  setStorage(STORAGE_KEYS.lastActivity, now.toString());
  return sessionId;
}

function getConsent() {
  const consent = getStorage(STORAGE_KEYS.consent);
  if (consent === null) return null;
  return consent === "true";
}

function setConsent(value) {
  setStorage(STORAGE_KEYS.consent, value.toString());
}

function getUTMParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || null,
    utmMedium: params.get("utm_medium") || null,
    utmCampaign: params.get("utm_campaign") || null,
    utmTerm: params.get("utm_term") || null,
    utmContent: params.get("utm_content") || null,
  };
}

function getScreenInfo() {
  if (typeof window === "undefined") return {};
  return {
    screenWidth: window.screen?.width || null,
    screenHeight: window.screen?.height || null,
    viewportWidth: window.innerWidth || null,
    viewportHeight: window.innerHeight || null,
  };
}

function sanitizeUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const sensitiveParams = ["token", "password", "email", "auth", "session", "key", "secret", "api_key", "access_token"];
    sensitiveParams.forEach((param) => u.searchParams.delete(param));
    return u.toString();
  } catch {
    return null;
  }
}

function extractDomain(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function sanitizeElement(element) {
  if (!element || typeof element !== "object") return null;
  const allowed = ["tag", "id", "classes", "text", "href", "type", "name", "role"];
  const sanitized = {};
  for (const key of allowed) {
    if (element[key] != null) {
      sanitized[key] = String(element[key]).slice(0, 200);
    }
  }
  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

function sanitizeCustomData(data) {
  if (!data || typeof data !== "object") return null;
  const sensitiveKeys = ["password", "token", "secret", "key", "auth", "email", "phone", "address", "ssn", "credit", "card", "cvv"];
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((s) => lowerKey.includes(s))) continue;
    if (typeof value === "string") {
      sanitized[key] = value.slice(0, 500);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      sanitized[key] = value;
    } else if (typeof value === "boolean") {
      sanitized[key] = value;
    }
  }
  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

async function sendEvent(endpoint, payload, retries = 0) {
  const consent = getConsent();
  if (consent === false) return { success: false, reason: "consent_denied" };

  try {
    const response = await fetch(`${TRACKING_API}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "omit",
      keepalive: true,
    });

    if (!response.ok) {
      if (response.status === 429 && retries < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (retries + 1)));
        return sendEvent(endpoint, payload, retries + 1);
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (retries + 1)));
      return sendEvent(endpoint, payload, retries + 1);
    }
    queuePendingEvent(endpoint, payload);
    return { success: false, error: error.message };
  }
}

function queuePendingEvent(endpoint, payload) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(getStorage(STORAGE_KEYS.pendingEvents) || "[]");
    existing.push({ endpoint, payload, timestamp: Date.now() });
    const recent = existing.filter((e) => Date.now() - e.timestamp < 24 * 60 * 60 * 1000).slice(-50);
    setStorage(STORAGE_KEYS.pendingEvents, JSON.stringify(recent));
  } catch {
  }
}

async function flushPendingEvents() {
  if (typeof window === "undefined") return;
  try {
    const pending = JSON.parse(getStorage(STORAGE_KEYS.pendingEvents) || "[]");
    if (pending.length === 0) return;

    const consent = getConsent();
    if (consent === false) return;

    const remaining = [];
    for (const event of pending) {
      const result = await sendEvent(event.endpoint, event.payload);
      if (!result.success && result.reason !== "consent_denied") {
        remaining.push(event);
      }
    }
    setStorage(STORAGE_KEYS.pendingEvents, JSON.stringify(remaining));
  } catch {
  }
}

function buildBasePayload(overrides = {}) {
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const utm = getUTMParams();
  const screen = getScreenInfo();

  return {
    visitorId,
    sessionId,
    domain: extractDomain(window.location.href),
    url: sanitizeUrl(window.location.href),
    path: window.location.pathname,
    title: document.title,
    referrer: sanitizeUrl(document.referrer),
    referrerDomain: extractDomain(document.referrer),
    ...utm,
    ...screen,
    ...overrides,
  };
}

export function trackPageview(previousPath = null) {
  const payload = buildBasePayload({
    eventType: EVENT_TYPES.PAGEVIEW,
    previousPath,
  });
  return sendEvent("/pageview", payload);
}

export function trackEvent(eventType, options = {}) {
  const payload = buildBasePayload({
    eventType,
    element: sanitizeElement(options.element),
    customName: options.customName,
    customData: sanitizeCustomData(options.customData),
    duration: options.duration,
    scrollDepth: options.scrollDepth,
  });
  return sendEvent("/track", payload);
}

export function trackClick(element, options = {}) {
  return trackEvent(EVENT_TYPES.CLICK, { element, ...options });
}

export function trackOutbound(element, options = {}) {
  return trackEvent(EVENT_TYPES.OUTBOUND, { element, ...options });
}

export function trackCustom(customName, customData, options = {}) {
  return trackEvent(EVENT_TYPES.CUSTOM, { customName, customData, ...options });
}

export function startSession() {
  const payload = buildBasePayload({
    ...getUTMParams(),
    ...getScreenInfo(),
  });
  return sendEvent("/sessions/start", payload);
}

export function sendHeartbeat(duration, scrollDepth) {
  const payload = {
    sessionId: getSessionId(),
    duration,
    scrollDepth: Math.min(100, Math.max(0, scrollDepth || 0)),
  };
  return sendEvent("/sessions/heartbeat", payload);
}

export function endSession(exitPage = null) {
  const payload = {
    sessionId: getSessionId(),
    exitPage: exitPage || window.location.pathname,
  };
  const result = sendEvent("/sessions/end", payload);
  removeStorage(STORAGE_KEYS.sessionId);
  removeStorage(STORAGE_KEYS.sessionStart);
  removeStorage(STORAGE_KEYS.lastActivity);
  return result;
}

export function initTracking() {
  if (typeof window === "undefined") return;

  const consent = getConsent();
  if (consent === null) {
    return { visitorId: getVisitorId(), sessionId: getSessionId(), consentRequired: true };
  }

  if (consent === false) {
    return { visitorId: getVisitorId(), sessionId: null, consentRequired: false, consentDenied: true };
  }

  startSession();
  flushPendingEvents();

  let lastPath = window.location.pathname;
  let lastScrollDepth = 0;
  let lastHeartbeatTime = Date.now();
  let heartbeatInterval = null;

  const updateActivity = () => {
    setStorage(STORAGE_KEYS.lastActivity, Date.now().toString());
  };

  const calculateScrollDepth = () => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const docHeight = doc.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
  };

  const sendHeartbeatIfNeeded = () => {
    const now = Date.now();
    const duration = Math.round((now - lastHeartbeatTime) / 1000);
    const scrollDepth = calculateScrollDepth();

    if (duration >= 10 || scrollDepth > lastScrollDepth + 10) {
      sendHeartbeat(duration, scrollDepth);
      lastHeartbeatTime = now;
      lastScrollDepth = scrollDepth;
    }
  };

  const handleScroll = () => {
    updateActivity();
    sendHeartbeatIfNeeded();
  };

  const handleClick = (event) => {
    updateActivity();
    const target = event.target.closest("a, button, [role='button'], input, select, textarea");
    if (!target) return;

    const isOutbound = target.tagName === "A" && target.href && extractDomain(target.href) !== window.location.hostname;
    const element = {
      tag: target.tagName.toLowerCase(),
      id: target.id || null,
      classes: target.className || null,
      text: target.textContent?.slice(0, 100) || null,
      href: target.href || null,
      type: target.type || null,
      name: target.name || null,
      role: target.getAttribute("role") || null,
    };

    if (isOutbound) {
      trackOutbound(element, { previousPath: window.location.pathname });
    } else {
      trackClick(element, { previousPath: window.location.pathname });
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      const scrollDepth = calculateScrollDepth();
      const duration = Math.round((Date.now() - lastHeartbeatTime) / 1000);
      if (duration > 0 || scrollDepth > 0) {
        sendHeartbeat(duration, scrollDepth);
      }
      navigator.sendBeacon?.(
        `${TRACKING_API}/sessions/heartbeat`,
        JSON.stringify({
          sessionId: getSessionId(),
          duration,
          scrollDepth,
        })
      );
    } else {
      lastHeartbeatTime = Date.now();
      lastScrollDepth = calculateScrollDepth();
    }
  };

  const handleBeforeUnload = () => {
    const scrollDepth = calculateScrollDepth();
    const duration = Math.round((Date.now() - lastHeartbeatTime) / 1000);
    if (duration > 0 || scrollDepth > 0) {
      navigator.sendBeacon?.(
        `${TRACKING_API}/sessions/end`,
        JSON.stringify({
          sessionId: getSessionId(),
          exitPage: window.location.pathname,
        })
      );
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("click", handleClick, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("beforeunload", handleBeforeUnload);

  heartbeatInterval = setInterval(() => {
    updateActivity();
    sendHeartbeatIfNeeded();
  }, HEARTBEAT_INTERVAL_MS);

  return {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    consentRequired: false,
    destroy: () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    },
  };
}

export function useTracking() {
  const pathname = usePathname();
  let searchParams;
  try {
    searchParams = useSearchParams();
  } catch {
    searchParams = null;
  }
  const initialized = useRef(false);
  const previousPathRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const result = initTracking();
    if (result.destroy) {
      cleanupRef.current = result.destroy;
    }

    trackPageview(null);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      endSession();
    };
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    if (previousPathRef.current !== null && previousPathRef.current !== pathname) {
      trackPageview(previousPathRef.current);
      trackEvent(EVENT_TYPES.NAVIGATION, { previousPath: previousPathRef.current });
    }
    previousPathRef.current = pathname;
  }, [pathname, searchParams?.toString()]);

  return {
    trackPageview,
    trackEvent,
    trackClick,
    trackOutbound,
    trackCustom,
    setConsent,
    getConsent,
  };
}

export { EVENT_TYPES, STORAGE_KEYS, getConsent, setConsent };