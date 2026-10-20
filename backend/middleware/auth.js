import crypto from "crypto";
import { AdminSession, Admin } from "../models/index.js";
import { clearSessionCookie } from "../utils/cookies.js";
import config from "../config/env.js";
import { ROLES, permissionsForRole, publicAdmin } from "../config/roles.js";

/**
 * Session lookup shared by `requireAdmin` and the auth controller.
 *
 * Returns `{ session, admin, error }`:
 *  - `error` is a human-readable reason when the session is unusable.
 *  - `admin` is the resolved admin document for DB-backed accounts, or a
 *    synthetic superadmin for the legacy single-password (env) account.
 */

export const LEGACY_ADMIN_ID = "admin";

export function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(String(ip)).digest("hex");
}

export function hashUserAgent(userAgent) {
  if (!userAgent) return null;
  return crypto.createHash("sha256").update(String(userAgent)).digest("hex");
}

export function clientIp(req) {
  const forwarded = req?.headers?.["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return req?.ip || req?.connection?.remoteAddress || null;
}

export function requestUserAgent(req) {
  const ua = req?.get?.("user-agent") || req?.headers?.["user-agent"] || null;
  return ua ? String(ua).slice(0, 255) : null;
}

/**
 * The legacy account authenticates with `ADMIN_PASSWORD` / `ADMIN_PASSWORD_HASH`
 * from the environment rather than from the database. It is granted the
 * superadmin role so that a single-operator deployment keeps full access.
 */
export function legacyAdmin() {
  return {
    id: LEGACY_ADMIN_ID,
    email: process.env.ADMIN_EMAIL || "admin@docstools.app",
    name: "Administrator",
    role: ROLES.SUPERADMIN,
    isActive: true,
    isLegacy: true,
  };
}

export async function resolveSession(req) {
  const token = req.cookies?.admin_session;
  if (!token) {
    return { error: "Authentication required", status: 401 };
  }

  let session;
  try {
    session = await AdminSession.findOne({ sessionToken: token });
  } catch (err) {
    return { error: "Authentication failed", status: 401 };
  }

  if (!session) {
    return { error: "Invalid session", status: 401 };
  }
  if (session.revokedAt) {
    return { error: "Session revoked", status: 401 };
  }
  if (Date.now() > new Date(session.expiresAt).getTime()) {
    return { error: "Session expired", status: 401 };
  }

  let admin = null;
  if (session.userId && session.userId !== LEGACY_ADMIN_ID) {
    admin = await Admin.findById(session.userId);
    if (!admin) {
      return { error: "Account no longer exists", status: 401 };
    }
    if (admin.isActive === false) {
      return { error: "Account is deactivated", status: 403 };
    }
  } else {
    admin = legacyAdmin();
  }

  return { session, admin };
}

/**
 * Slide the session expiry forward while the user is active, but never past
 * the absolute session lifetime.
 */
export async function touchSession(session) {
  if (!session) return;
  const now = Date.now();
  const idleMs = config.adminSessionIdleMs || config.adminSessionTtlMs;
  const hardLimit = session.absoluteExpiresAt
    ? new Date(session.absoluteExpiresAt).getTime()
    : new Date(session.expiresAt).getTime();

  const nextExpiry = Math.min(now + idleMs, hardLimit);
  session.lastActivityAt = new Date(now);

  if (nextExpiry > new Date(session.expiresAt).getTime()) {
    session.expiresAt = new Date(nextExpiry);
    await session.save();
  } else {
    await session.updateOne({ _id: session._id }, { $set: { lastActivityAt: session.lastActivityAt } });
  }
}

/**
 * Express middleware: requires a valid admin session.
 *
 * Populates `req.adminSession` and `req.admin` where `req.admin` is
 * `{ id, email, name, role, permissions, isActive }`.
 */
export async function requireAdmin(req, res, next) {
  const { session, admin, error, status } = await resolveSession(req);

  if (error) {
    if (status === 401) clearSessionCookie(res);
    return res.status(status).json({ success: false, error });
  }

  await touchSession(session);

  req.adminSession = session;
  req.admin = {
    id: String(admin._id || admin.id),
    email: admin.email,
    name: admin.name || admin.email,
    role: admin.role || ROLES.SUPERADMIN,
    permissions: permissionsForRole(admin.role || ROLES.SUPERADMIN),
    isActive: admin.isActive !== false,
    isLegacy: Boolean(admin.isLegacy),
  };

  return next();
}

/**
 * Populates `req.admin` when a valid session exists, but never rejects.
 * Used by endpoints that enrich their response for signed-in admins.
 */
export async function optionalAdmin(req, res, next) {
  try {
    const { session, admin } = await resolveSession(req);
    if (session && admin) {
      req.adminSession = session;
      req.admin = {
        id: String(admin._id || admin.id),
        email: admin.email,
        name: admin.name || admin.email,
        role: admin.role || ROLES.SUPERADMIN,
        permissions: permissionsForRole(admin.role || ROLES.SUPERADMIN),
        isActive: admin.isActive !== false,
        isLegacy: Boolean(admin.isLegacy),
      };
    }
  } catch {
    /* ignore — optional auth */
  }
  return next();
}

export { publicAdmin };
