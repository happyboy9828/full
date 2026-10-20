/**
 * Permission constants — mirrors `backend/config/roles.js`.
 *
 * The server is the authority: every one of these is re-checked on the
 * backend before the request is served. The client uses them to decide which
 * navigation entries and actions to render.
 */

export const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: "dashboard.view",
  ANALYTICS_VIEW: "analytics.view",
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",
  ACTIVITY_VIEW: "activity.view",
  SYSTEM_VIEW: "system.view",
  SETTINGS_VIEW: "settings.view",
  SETTINGS_MANAGE: "settings.manage",
  ADMINS_MANAGE: "admins.manage",
  SESSIONS_MANAGE: "sessions.manage",
});

export const ROLES = Object.freeze({
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  ANALYST: "analyst",
  VIEWER: "viewer",
});

export const ROLE_LABELS = Object.freeze({
  superadmin: "Super Admin",
  admin: "Administrator",
  analyst: "Analyst",
  viewer: "Viewer",
});
