import crypto from "node:crypto";

const SENSITIVE_PARAM_PATTERNS = [
  "token",
  "password",
  "passwd",
  "pwd",
  "secret",
  "api_key",
  "apikey",
  "access_key",
  "private_key",
  "auth",
  "session",
  "credential",
  "email",
  "username",
  "user",
  "csrf",
  "signature",
  "code",
];

export function isSensitiveKey(key) {
  const normalized = String(key).toLowerCase();
  return SENSITIVE_PARAM_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function sanitizeUrl(rawUrl, maxLength = 2048) {
  if (rawUrl == null || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const bounded = trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
  try {
    const url = new URL(bounded);
    for (const key of [...url.searchParams.keys()]) {
      if (isSensitiveKey(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return bounded;
  }
}

export function extractDomain(rawUrl) {
  if (rawUrl == null || typeof rawUrl !== "string") return null;
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function sanitizeText(text, maxLength = 200) {
  if (text == null) return null;
  const str = String(text)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim();
  if (!str) return null;
  return str.length > maxLength ? str.slice(0, maxLength) : str;
}

export function sanitizeElement(element) {
  if (!element || typeof element !== "object" || Array.isArray(element)) return null;
  const out = {};
  if (element.tagName != null) out.tagName = sanitizeText(element.tagName, 50);
  if (element.id != null) out.id = sanitizeText(element.id, 100);
  if (element.className != null) out.className = sanitizeText(element.className, 200);
  if (element.text != null) out.text = sanitizeText(element.text, 200);
  if (element.href != null) out.href = sanitizeUrl(element.href);
  return Object.keys(out).length > 0 ? out : null;
}

export function sanitizeCustomData(value, depth = 0) {
  if (value == null || typeof value !== "object" || depth > 3) return null;
  if (Array.isArray(value)) {
    return value.slice(0, 20)
      .map((item) => sanitizeCustomData(item, depth + 1))
      .filter((item) => item !== null);
  }
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (isSensitiveKey(key)) continue;
    if (typeof val === "string") {
      const clean = sanitizeText(val, 500);
      if (clean !== null) out[key] = clean;
    } else if (typeof val === "number" && Number.isFinite(val)) {
      out[key] = val;
    } else if (typeof val === "boolean") {
      out[key] = val;
    } else if (typeof val === "object") {
      const nested = sanitizeCustomData(val, depth + 1);
      if (nested !== null) out[key] = nested;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

export function hashValue(value) {
  if (value == null) return null;
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

export function randomUUID() {
  return crypto.randomUUID();
}

export function parseUserAgent(ua) {
  const result = {
    deviceType: "unknown",
    browser: null,
    browserVersion: null,
    os: null,
    osVersion: null,
  };
  if (!ua || typeof ua !== "string") return result;

  let os = null;
  let osVersion = null;
  const windows = ua.match(/Windows NT (\d+(?:\.\d+)?)/);
  const mac = ua.match(/Mac OS X (\d+(?:[._]\d+)+)/);
  const ios = ua.match(/(?:iPhone OS|iPad.*OS) (\d+(?:[._]\d+)+)/);
  const android = ua.match(/Android (\d+(?:\.\d+)?)/);

  if (windows) {
    os = "Windows";
    osVersion = windows[1];
  } else if (ios) {
    os = "iOS";
    osVersion = ios[1].replace(/_/g, ".");
  } else if (mac) {
    os = "macOS";
    osVersion = mac[1].replace(/_/g, ".");
  } else if (android) {
    os = "Android";
    osVersion = android[1];
  } else if (/CrOS/i.test(ua)) {
    os = "Chrome OS";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  let browser = null;
  let browserVersion = null;
  const edge = ua.match(/Edg(?:e|A|iOS)?\/(\d+(?:\.\d+)?)/);
  const opera = ua.match(/OPR\/(\d+(?:\.\d+)?)/);
  const samsung = ua.match(/SamsungBrowser\/(\d+(?:\.\d+)?)/);
  const chrome = ua.match(/Chrome\/(\d+(?:\.\d+)?)/);
  const firefox = ua.match(/Firefox\/(\d+(?:\.\d+)?)/);
  const safari = ua.match(/Version\/(\d+(?:\.\d+)?)[^)]*Safari\//);

  if (edge) {
    browser = "Edge";
    browserVersion = edge[1];
  } else if (opera) {
    browser = "Opera";
    browserVersion = opera[1];
  } else if (samsung) {
    browser = "Samsung Internet";
    browserVersion = samsung[1];
  } else if (chrome) {
    browser = "Chrome";
    browserVersion = chrome[1];
  } else if (firefox) {
    browser = "Firefox";
    browserVersion = firefox[1];
  } else if (safari) {
    browser = "Safari";
    browserVersion = safari[1];
  }

  let deviceType = "desktop";
  if (/Mobi/i.test(ua)) {
    deviceType = "mobile";
  } else if (/Tablet/i.test(ua) || /iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    deviceType = "tablet";
  }

  return {
    deviceType,
    browser,
    browserVersion,
    os,
    osVersion,
  };
}
