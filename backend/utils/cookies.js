import config from "../config/env.js";

export function parseCookies(req) {
  const out = {};
  const header = req.headers && req.headers.cookie;
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    let value = part.slice(idx + 1).trim();
    try {
      value = decodeURIComponent(value);
    } catch {
      continue;
    }
    out[name] = value;
  }
  return out;
}

export function getAdminSessionToken(req) {
  return parseCookies(req)[config.cookieName] || null;
}

export function cookieOptions(expiresAt) {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  };
}
