const BASE = "http://localhost:5000";

let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name}  ${detail || ""}`);
  }
}

async function req(method, path, { body, headers = {}, cookie } = {}) {
  const h = { ...headers };
  if (body !== undefined) h["Content-Type"] = "application/json";
  if (cookie) h.Cookie = cookie;
  const res = await fetch(BASE + path, {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  const text = await res.text();
  try { json = JSON.parse(text); } catch { /* keep null */ }
  return { status: res.status, headers: res.headers, json };
}

function uuid() {
  return crypto.randomUUID();
}

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function cleanDatabase() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const name of ["sessions", "events", "sites", "adminSessions"]) {
    await mongoose.connection.dropCollection(name).catch(() => {});
  }
  await mongoose.disconnect();
  console.log("Database cleaned");
}

async function main() {
  await cleanDatabase();

  console.log("=== Health ===");
  let r = await req("GET", "/health");
  check("GET /health", r.status === 200 && r.json.status === "ok", JSON.stringify(r.json));
  r = await req("GET", "/status");
  check("GET /status db=connected", r.status === 200 && r.json.database === "connected", JSON.stringify(r.json));
  r = await req("GET", "/api/analytics/health");
  check("GET /api/analytics/health", r.status === 200 && r.json.service === "analytics", JSON.stringify(r.json));

  console.log("=== Ingestion ===");
  const sid = uuid();
  const vid = uuid();
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

  r = await req("POST", "/api/analytics/sessions/start", {
    body: {
      sessionId: sid, visitorId: vid, path: "/",
      url: "https://docfix.example.com/?utm_source=google&utm_medium=cpc&token=secret123",
      referrer: "https://google.com/search?q=docfix",
      utmSource: "google", utmMedium: "cpc",
      screenWidth: 1920, screenHeight: 1080,
    },
    headers: { "User-Agent": ua, "Accept-Language": "en-US,en;q=0.9" },
  });
  check("sessions/start", r.status === 200 && r.json.success === true && r.json.sessionId === sid, JSON.stringify(r.json));

  r = await req("POST", "/api/analytics/pageview", {
    body: { sessionId: sid, visitorId: vid, path: "/tools", url: "https://docfix.example.com/tools?email=a@b.com", title: "Tools", referrer: "https://docfix.example.com/" },
    headers: { "User-Agent": ua },
  });
  check("pageview", r.status === 200 && r.json.success === true && r.json.eventId, JSON.stringify(r.json));

  r = await req("POST", "/api/analytics/track", {
    body: { eventType: "click", sessionId: sid, visitorId: vid, path: "/tools", element: { tagName: "button", id: "convert-pdf", text: "Convert" } },
    headers: { "User-Agent": ua },
  });
  check("track click", r.status === 200 && r.json.success === true, JSON.stringify(r.json));

  r = await req("POST", "/api/analytics/track", {
    body: { eventType: "custom", sessionId: sid, visitorId: vid, customName: "signup_clicked", customData: { plan: "free", email: "user@example.com" } },
    headers: { "User-Agent": ua },
  });
  check("track custom", r.status === 200 && r.json.success === true, JSON.stringify(r.json));

  r = await req("POST", "/api/analytics/track", {
    body: { eventType: "outbound", sessionId: sid, visitorId: vid, path: "/tools", element: { tagName: "a", href: "https://external.example.com/away", text: "External" } },
    headers: { "User-Agent": ua },
  });
  check("track outbound", r.status === 200, JSON.stringify(r.json));

  r = await req("POST", "/api/analytics/sessions/heartbeat", {
    body: { sessionId: sid, duration: 12, scrollDepth: 60 },
  });
  check("heartbeat", r.status === 200 && r.json.success === true, JSON.stringify(r.json));

  r = await req("POST", "/api/analytics/sessions/end", {
    body: { sessionId: sid, exitPage: "/tools" },
  });
  check("sessions/end", r.status === 200 && r.json.success === true, JSON.stringify(r.json));

  console.log("=== Validation ===");
  r = await req("POST", "/api/analytics/track", { body: { eventType: "bogus", sessionId: "nope", visitorId: "nope" } });
  check("track invalid -> 400", r.status === 400 && Array.isArray(r.json.errors), JSON.stringify(r.json));
  r = await req("POST", "/api/analytics/track", { body: { eventType: "custom", sessionId: uuid(), visitorId: uuid() } });
  check("custom without customName -> 400", r.status === 400, JSON.stringify(r.json));
  r = await req("POST", "/api/analytics/track", { body: { eventType: "click", sessionId: uuid(), visitorId: uuid(), scrollDepth: 150 } });
  check("scrollDepth out of range -> 400", r.status === 400, JSON.stringify(r.json));
  r = await req("POST", "/api/analytics/sessions/heartbeat", { body: { sessionId: uuid(), duration: 5 } });
  check("heartbeat unknown session -> 404", r.status === 404, JSON.stringify(r.json));
  r = await req("POST", "/api/analytics/track", { body: "not-an-object" });
  check("track non-object -> 400", r.status === 400, JSON.stringify(r.json));

  console.log("=== Auth ===");
  r = await req("GET", "/api/analytics/reports/overview");
  check("reports without cookie -> 401", r.status === 401, JSON.stringify(r.json));
  r = await req("GET", "/api/auth/me");
  check("me without cookie -> 401", r.status === 401, JSON.stringify(r.json));

  r = await req("POST", "/api/auth/login", { body: { password: "wrong-password" } });
  check("login wrong password -> 401", r.status === 401, JSON.stringify(r.json));

  r = await req("POST", "/api/auth/login", { body: { password: "admin123" } });
  check("login correct -> 200", r.status === 200 && r.json.success === true, JSON.stringify(r.json));
  const setCookie = r.headers.get("set-cookie") || "";
  check("login sets HttpOnly cookie", /admin_session=/.test(setCookie) && /HttpOnly/.test(setCookie) && /SameSite=Lax/.test(setCookie), setCookie);
  const cookie = setCookie.split(";")[0];

  r = await req("GET", "/api/auth/me", { cookie });
  check("me with cookie -> authenticated", r.status === 200 && r.json.authenticated === true, JSON.stringify(r.json));

  console.log("=== Reports ===");
  r = await req("GET", "/api/analytics/reports/overview", { cookie });
  check("overview", r.status === 200 && r.json.data.pageViews === 1 && r.json.data.sessions === 1 && r.json.data.uniqueVisitors === 1 && r.json.data.totalEvents === 4, JSON.stringify(r.json));

  r = await req("GET", "/api/analytics/reports/sources", { cookie });
  check("sources google", r.status === 200 && r.json.data.some((s) => s.source === "google" && s.visits === 1), JSON.stringify(r.json));

  r = await req("GET", "/api/analytics/reports/pages", { cookie });
  check("pages /tools", r.status === 200 && r.json.data.some((p) => p.path === "/tools" && p.pageViews === 1), JSON.stringify(r.json));

  r = await req("GET", "/api/analytics/reports/devices", { cookie });
  check("devices desktop/Chrome/Windows", r.status === 200 && r.json.data.deviceTypes.some((d) => d.type === "desktop" && d.count === 1) && r.json.data.browsers.some((b) => b.browser === "Chrome") && r.json.data.operatingSystems.some((o) => o.os === "Windows"), JSON.stringify(r.json));

  r = await req("GET", "/api/analytics/reports/events", { cookie });
  check("events counts", r.status === 200 && r.json.data.some((e) => e.eventType === "pageview" && e.count === 1) && r.json.data.some((e) => e.customName === "signup_clicked" && e.count === 1), JSON.stringify(r.json));

  r = await req("GET", "/api/analytics/reports/live", { cookie });
  check("live report shape", r.status === 200 && typeof r.json.data.activeSessions === "number" && Array.isArray(r.json.data.recentEvents), JSON.stringify(r.json));

  r = await req("GET", "/api/analytics/reports/time-series", { cookie });
  check("time-series day", r.status === 200 && Array.isArray(r.json.data) && r.json.data.length >= 1 && r.json.data[0].date && typeof r.json.data[0].pageViews === "number", JSON.stringify(r.json));

  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();
  r = await req("GET", `/api/analytics/reports/time-series?granularity=hour&startDate=${encodeURIComponent(sixDaysAgo)}`, { cookie });
  check("time-series hour", r.status === 200 && Array.isArray(r.json.data), JSON.stringify(r.json));

  r = await req("GET", "/api/analytics/reports/overview?startDate=not-a-date", { cookie });
  check("bad startDate -> 400", r.status === 400, JSON.stringify(r.json));
  r = await req("GET", "/api/analytics/reports/overview?startDate=2026-10-01T00:00:00Z&endDate=2026-09-01T00:00:00Z", { cookie });
  check("start>end -> 400", r.status === 400, JSON.stringify(r.json));
  r = await req("GET", "/api/analytics/reports/overview?domain=docfix.example.com", { cookie });
  check("domain filter ok", r.status === 200 && r.json.data.sessions === 1, JSON.stringify(r.json));
  r = await req("GET", "/api/analytics/reports/overview?domain=other.example.com", { cookie });
  check("domain filter excludes", r.status === 200 && r.json.data.sessions === 0, JSON.stringify(r.json));

  console.log("=== Logout ===");
  r = await req("POST", "/api/auth/logout", { cookie });
  check("logout -> 200", r.status === 200 && r.json.success === true, JSON.stringify(r.json));
  r = await req("GET", "/api/analytics/reports/overview", { cookie });
  check("reports after logout -> 401", r.status === 401, JSON.stringify(r.json));

  console.log("=== Rate limit (auth, 20 per 15 min) ===");
  let rateLimited = false;
  for (let i = 0; i < 25; i++) {
    r = await req("POST", "/api/auth/login", { body: { password: "wrong" } });
    if (r.status === 429) { rateLimited = true; break; }
  }
  check("login rate limit triggers 429", rateLimited, "no 429 after 25 attempts");

  console.log("=== 404 ===");
  r = await req("GET", "/api/does-not-exist");
  check("unknown route -> 404", r.status === 404 && r.json.success === false, JSON.stringify(r.json));

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("TEST RUNNER ERROR:", err);
  process.exit(1);
});
