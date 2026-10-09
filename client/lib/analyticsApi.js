"use client";

const API_BASE =
  process.env.NEXT_PUBLIC_TRACKING_API || "/api";

// Debug: Log the API_BASE being used
if (typeof window !== "undefined") {
  console.log("[analyticsApi] API_BASE:", API_BASE);
}

const REPORT_BASE = `${API_BASE}/analytics/reports`;

async function request(url, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON response */
  }
  return { status: res.status, json };
}

export function apiAuth(path, opts = {}) {
  return request(`${API_BASE}/auth${path}`, opts);
}

export function authHeaders() {
  return {};
}

export function buildReportParams({ startDate, endDate, domain }) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (domain) params.set("domain", domain);
  return params;
}

export async function fetchReport(reportName, { startDate, endDate, domain, granularity } = {}) {
  const params = buildReportParams({ startDate, endDate, domain });
  if (granularity) params.set("granularity", granularity);
  const url = `${REPORT_BASE}/${reportName}?${params.toString()}`;
  return request(url);
}

export async function checkAuth() {
  const r = await apiAuth("/me");
  const authenticated = r.json?.authenticated === true;
  return { authenticated, status: r.status };
}

export async function login(password) {
  return apiAuth("/login", { method: "POST", body: { password } });
}

export async function logout() {
  return apiAuth("/logout", { method: "POST" });
}
