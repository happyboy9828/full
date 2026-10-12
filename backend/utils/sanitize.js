import crypto from "crypto";

const SENSITIVE_PARAMS = [
  "token", "password", "email", "auth", "session", "key",
  "secret", "api_key", "access_token", "refresh_token", "code", "state",
];

export function sanitizeUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    SENSITIVE_PARAMS.forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return null;
  }
}

export function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export function hashUserAgent(ua) {
  if (!ua) return null;
  return crypto.createHash("sha256").update(ua).digest("hex");
}

const PII_KEYS = [
  "password", "token", "secret", "key", "auth", "email",
  "phone", "address", "ssn", "credit", "card", "cvv",
  "refresh_token", "access_token",
];

export function sanitizeCustomData(data) {
  if (!data || typeof data !== "object") return null;
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (PII_KEYS.some((s) => lowerKey.includes(s))) continue;
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

const ELEMENT_ALLOWED = ["tagName", "id", "className", "text", "href", "type", "name", "role"];
const ELEMENT_PII = ["password", "value", "token", "secret"];

export function sanitizeElement(el) {
  if (!el || typeof el !== "object") return null;
  const sanitized = {};
  for (const key of ELEMENT_ALLOWED) {
    if (el[key] != null) {
      sanitized[key] = String(el[key]).slice(0, 200);
    }
  }
  for (const key of Object.keys(el)) {
    const lower = key.toLowerCase();
    if (ELEMENT_PII.some((s) => lower.includes(s))) continue;
    if (!ELEMENT_ALLOWED.includes(key) && el[key] != null) {
      sanitized[key] = String(el[key]).slice(0, 200);
    }
  }
  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

export function redactPii(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const redacted = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (PII_KEYS.some((s) => lowerKey.includes(s))) {
      redacted[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      redacted[key] = redactPii(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export function parseUserAgent(ua) {
  if (!ua || typeof ua !== "string") return {};
  const uaStr = ua;

  let deviceType = "unknown";
  const mobileRegex = /Mobile|Android|iP(hone|od)|IEMobile/i;
  const tabletRegex = /Tablet|iPad|PlayBook|Kindle/i;
  if (tabletRegex.test(uaStr)) deviceType = "tablet";
  else if (mobileRegex.test(uaStr)) deviceType = "mobile";
  else if (/Mozilla/.test(uaStr)) deviceType = "desktop";

  let browser = "unknown";
  let browserVersion = null;
  const edgeMatch = uaStr.match(/(?:Edg|Edge|Edge\/iOS)\/?\s*(\d+)/i);
  const chromeMatch = uaStr.match(/(?:Chrome|CriOS)\/?\s*(\d+)/i);
  const firefoxMatch = uaStr.match(/Firefox\/(\d+)/i);
  const safariMatch = uaStr.match(/Version\/(\d+).*Safari/i);
  const ieMatch = uaStr.match(/(?:MSIE |Trident\/.*;\s*rv:)(\d+)/i);

  if (edgeMatch) {
    browser = "Edge";
    browserVersion = edgeMatch[1];
  } else if (ieMatch) {
    browser = "Internet Explorer";
    browserVersion = ieMatch[1];
  } else if (firefoxMatch) {
    browser = "Firefox";
    browserVersion = firefoxMatch[1];
  } else if (safariMatch) {
    browser = "Safari";
    browserVersion = safariMatch[1];
  } else if (chromeMatch) {
    browser = "Chrome";
    browserVersion = chromeMatch[1];
  }

  let os = "unknown";
  let osVersion = null;
  if (/Windows NT 10/i.test(uaStr)) {
    os = "Windows";
    osVersion = "10+";
  } else if (/Windows NT 6\.1/i.test(uaStr)) {
    os = "Windows";
    osVersion = "7";
  } else if (/Mac OS X (\d+[_\.]\d+[_\.]?\d*)/i.test(uaStr)) {
    os = "macOS";
    const m = uaStr.match(/Mac OS X (\d+[_\.]\d+[_\.]?\d*)/i);
    osVersion = m ? m[1].replace("_", ".") : null;
  } else if (/iPhone OS (\d+[_\.]\d+[_\.]?\d*)/i.test(uaStr)) {
    os = "iOS";
    const m = uaStr.match(/iPhone OS (\d+[_\.]\d+[_\.]?\d*)/i);
    osVersion = m ? m[1].replace("_", ".") : null;
  } else if (/Android (\d+[_\.]\d+[_\.]?\d*)/i.test(uaStr)) {
    os = "Android";
    const m = uaStr.match(/Android (\d+[_\.]\d+[_\.]?\d*)/i);
    osVersion = m ? m[1].replace("_", ".") : null;
  }

  return { deviceType, browser, browserVersion, os, osVersion };
}
