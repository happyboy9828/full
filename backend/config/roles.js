/**
 * Role-Based Access Control (RBAC) definitions.
 *
 * Roles are hierarchical in terms of *privilege*, but permissions are the
 * unit of enforcement. A role maps to an explicit list of permission
 * strings; middleware checks a single permission at a time so that access
 * rules stay declarative and easy to audit.
 *
 * Enforcement is server-side only (`middleware/rbac.js`). The client also
 * mirrors this matrix purely for UX (hiding nav items the signed-in admin
 * cannot use) — it is never a security boundary.
 */

export const ROLES = Object.freeze({
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  ANALYST: "analyst",
  VIEWER: "viewer",
});

export const ROLE_LIST = Object.freeze(Object.values(ROLES));

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

export const PERMISSION_LIST = Object.freeze(Object.values(PERMISSIONS));

const VIEWER_PERMISSIONS = [PERMISSIONS.DASHBOARD_VIEW];

const ANALYST_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.ANALYTICS_VIEW,
  PERMISSIONS.ACTIVITY_VIEW,
];

const ADMIN_PERMISSIONS = [
  ...ANALYST_PERMISSIONS,
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.USERS_MANAGE,
  PERMISSIONS.SYSTEM_VIEW,
  PERMISSIONS.SETTINGS_VIEW,
];

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.SUPERADMIN]: [...PERMISSION_LIST],
  [ROLES.ADMIN]: [...ADMIN_PERMISSIONS],
  [ROLES.ANALYST]: [...ANALYST_PERMISSIONS],
  [ROLES.VIEWER]: [...VIEWER_PERMISSIONS],
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPERADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Administrator",
  [ROLES.ANALYST]: "Analyst",
  [ROLES.VIEWER]: "Viewer",
});

export const ROLE_DESCRIPTIONS = Object.freeze({
  [ROLES.SUPERADMIN]:
    "Full control: manages administrators, roles, users and system settings.",
  [ROLES.ADMIN]: "Manages application users, activity logs and system statistics.",
  [ROLES.ANALYST]: "Read-only access to analytics and the activity log.",
  [ROLES.VIEWER]: "Read-only access to the dashboard overview only.",
});

/**
 * Numeric privilege levels. Used for "at least this role" checks (e.g. an
 * actor may not modify an account whose role is equal to or above their own).
 */
export const ROLE_LEVELS = Object.freeze({
  [ROLES.SUPERADMIN]: 40,
  [ROLES.ADMIN]: 30,
  [ROLES.ANALYST]: 20,
  [ROLES.VIEWER]: 10,
});

export function isValidRole(role) {
  return typeof role === "string" && ROLE_LIST.includes(role);
}

export function permissionsForRole(role) {
  const perms = ROLE_PERMISSIONS[role];
  return perms ? [...perms] : [];
}

export function hasPermission(role, permission) {
  if (!permission) return false;
  return permissionsForRole(role).includes(permission);
}

export function roleAtLeast(role, minimumRole) {
  return (ROLE_LEVELS[role] || 0) >= (ROLE_LEVELS[minimumRole] || Infinity);
}

export function roleLabel(role) {
  return ROLE_LABELS[role] || "Unknown";
}

/**
 * Strip fields that must never leave the server (password hashes, lockout
 * counters) from an admin document before it is serialised to a client.
 */
export function publicAdmin(admin) {
  if (!admin) return null;
  const doc = typeof admin.toObject === "function" ? admin.toObject() : admin;
  return {
    id: String(doc._id),
    email: doc.email,
    name: doc.name || doc.email,
    role: doc.role || ROLES.VIEWER,
    roleLabel: roleLabel(doc.role || ROLES.VIEWER),
    isActive: doc.isActive !== false,
    recoveryPhone: doc.recoveryPhone || null,
    lastLoginAt: doc.lastLoginAt || null,
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
}
