"use client";

/**
 * Admin API client.
 *
 * Every request is sent with `credentials: "include"` so the `admin_session`
 * cookie travels with it. The server is the only authority on permissions —
 * the client-side permission list is a UX affordance, never a security
 * boundary.
 *
 * `ApiError` carries the HTTP status so callers can distinguish
 * "not signed in" (401) from "not allowed" (403) from "server error" (500).
 */

const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API || "/api";

export class ApiError extends Error {
  constructor(message, status = 0, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }

  get isUnauthenticated() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isRateLimited() {
    return this.status === 429;
  }
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request(path, { method = "GET", body, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("Network error — check your connection and try again.", 0, null);
  }

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON response */
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.error || `Request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  return payload;
}

/* ----------------------------------------------------------------------- */
/* Authentication                                                            */
/* ----------------------------------------------------------------------- */

export const authApi = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  logout: () => request("/auth/logout", { method: "POST" }),

  me: () => request("/auth/me"),

  changePassword: (currentPassword, newPassword) =>
    request("/auth/password", { method: "POST", body: { currentPassword, newPassword } }),

  updateProfile: (payload) => request("/auth/profile", { method: "PATCH", body: payload }),

  listSessions: () => request("/auth/sessions"),

  revokeSession: (id) => request(`/auth/sessions/${id}`, { method: "DELETE" }),
};

/* ----------------------------------------------------------------------- */
/* Administration                                                            */
/* ----------------------------------------------------------------------- */

export const adminApi = {
  listUsers: (params) => request(`/admin/users${buildQuery(params)}`),

  createUser: (payload) => request("/admin/users", { method: "POST", body: payload }),

  updateUser: (id, payload) => request(`/admin/users/${id}`, { method: "PATCH", body: payload }),

  deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),

  listAdmins: () => request("/admin/admins"),

  createAdmin: (payload) => request("/admin/admins", { method: "POST", body: payload }),

  updateAdmin: (id, payload) => request(`/admin/admins/${id}`, { method: "PATCH", body: payload }),

  deleteAdmin: (id) => request(`/admin/admins/${id}`, { method: "DELETE" }),

  listActivity: (params) => request(`/admin/activity${buildQuery(params)}`),

  systemStats: () => request("/admin/system"),
};

/* ----------------------------------------------------------------------- */
/* Analytics reports                                                        */
/* ----------------------------------------------------------------------- */

/**
 * The analytics report endpoints live under `/api/analytics/reports` and are
 * protected by the same session cookie as the rest of the admin API.
 *
 * Each call resolves to the raw payload (`{ success, data }`); the modules
 * read `payload.data` themselves.
 */
export const reportsApi = {
  overview: (params) => request(`/analytics/reports/overview${buildQuery(params)}`),

  pages: (params) => request(`/analytics/reports/pages${buildQuery(params)}`),

  sources: (params) => request(`/analytics/reports/sources${buildQuery(params)}`),

  devices: (params) => request(`/analytics/reports/devices${buildQuery(params)}`),

  live: (params) => request(`/analytics/reports/live${buildQuery(params)}`),

  events: (params) => request(`/analytics/reports/events${buildQuery(params)}`),

  timeSeries: (params) => request(`/analytics/reports/time-series${buildQuery(params)}`),

  recentVisitors: (params) => request(`/analytics/reports/recent-visitors${buildQuery(params)}`),

  returningVisitors: (params) => request(`/analytics/reports/returning-visitors${buildQuery(params)}`),
};

export { API_BASE };
