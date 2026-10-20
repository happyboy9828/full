import crypto from "crypto";
import { AdminSession, Admin } from "../models/index.js";
import { setSessionCookie, clearSessionCookie } from "../utils/cookies.js";
import config from "../config/env.js";
import {
  hashPassword,
  verifyPassword,
  dummyVerify,
  passwordPolicyError,
} from "../utils/password.js";
import { logActivity } from "../utils/audit.js";
import {
  clientIp,
  requestUserAgent,
  hashIp,
  hashUserAgent,
  LEGACY_ADMIN_ID,
  legacyAdmin,
} from "../middleware/auth.js";
import { ROLES, permissionsForRole, roleLabel, publicAdmin } from "../config/roles.js";

/**
 * Authentication controller.
 *
 * Two login modes are supported:
 *
 *  1. **Account login** — `{ email, password }`. The email is looked up in the
 *     `admins` collection, the password is verified against the stored scrypt
 *     hash and the resulting session carries the account's RBAC role.
 *
 *  2. **Legacy operator login** — `{ password }` only. Used when no email is
 *     supplied; the password is checked against `ADMIN_PASSWORD_HASH` /
 *     `ADMIN_PASSWORD` from the environment and the session gets the
 *     superadmin role. This keeps single-operator deployments working.
 */

const GENERIC_LOGIN_ERROR = "Invalid email or password";

let cachedLegacyHash = null;

export function legacyHash() {
  if (!cachedLegacyHash) {
    cachedLegacyHash = config.adminPasswordHash || hashPassword(config.adminPassword);
  }
  return cachedLegacyHash;
}

// Backwards-compatible exports (previously defined in this module).
export { hashPassword, verifyPassword };

function normaliseEmail(email) {
  return String(email).trim().toLowerCase();
}

function sessionPayload(session) {
  return {
    id: String(session._id),
    userId: session.userId,
    email: session.email || null,
    role: session.role || null,
    createdAt: session.createdAt,
    lastActivityAt: session.lastActivityAt,
    expiresAt: session.expiresAt,
    current: false,
  };
}

function userPayload(admin, extra = {}) {
  const role = admin.role || ROLES.SUPERADMIN;
  return {
    id: String(admin._id || admin.id),
    email: admin.email,
    name: admin.name || admin.email,
    role,
    roleLabel: roleLabel(role),
    permissions: permissionsForRole(role),
    isActive: admin.isActive !== false,
    lastLoginAt: admin.lastLoginAt || null,
    ...extra,
  };
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  const { email, password } = req.body || {};

  if (typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ success: false, error: "Password is required" });
  }

  const wantsAccountLogin = typeof email === "string" && email.trim().length > 0;

  try {
    if (!wantsAccountLogin) {
      return await legacyLogin(req, res, password);
    }
    return await accountLogin(req, res, normaliseEmail(email), password);
  } catch (err) {
    console.error("[auth] login failed:", err);
    return res.status(500).json({ success: false, error: "Login failed. Please try again." });
  }
}

async function legacyLogin(req, res, password) {
  const valid = verifyPassword(password, legacyHash());

  if (!valid) {
    await logActivity({
      req,
      actor: { id: LEGACY_ADMIN_ID, email: legacyAdmin().email, role: ROLES.SUPERADMIN },
      action: "auth.login",
      status: "failure",
      message: "Invalid password for legacy operator account",
    });
    return res.status(401).json({ success: false, error: GENERIC_LOGIN_ERROR });
  }

  const admin = legacyAdmin();
  const session = await createSession(req, {
    userId: LEGACY_ADMIN_ID,
    email: admin.email,
    name: admin.name,
    role: ROLES.SUPERADMIN,
  });

  setSessionCookie(res, session.sessionToken);
  await logActivity({
    req,
    actor: { id: LEGACY_ADMIN_ID, email: admin.email, name: admin.name, role: ROLES.SUPERADMIN },
    action: "auth.login",
    message: "Signed in via operator password",
  });

  return res.json({
    success: true,
    user: userPayload({ ...admin, _id: LEGACY_ADMIN_ID }),
    expiresAt: session.expiresAt,
  });
}

async function accountLogin(req, res, email, password) {
  const admin = await Admin.findOne({ email });

  if (!admin) {
    // Spend equivalent CPU so timing does not reveal whether the email exists.
    dummyVerify();
    await logActivity({
      req,
      actor: { email },
      action: "auth.login",
      status: "failure",
      message: "Login attempt for unknown account",
    });
    return res.status(401).json({ success: false, error: GENERIC_LOGIN_ERROR });
  }

  if (admin.lockedUntil && new Date(admin.lockedUntil).getTime() > Date.now()) {
    const retryAfter = Math.ceil((new Date(admin.lockedUntil).getTime() - Date.now()) / 1000);
    await logActivity({
      req,
      actor: { id: admin._id, email: admin.email, role: admin.role },
      action: "auth.login",
      status: "failure",
      message: "Login attempt on locked account",
    });
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({
      success: false,
      error: "Account is temporarily locked. Try again later.",
      retryAfter,
    });
  }

  const valid = verifyPassword(password, admin.passwordHash);

  if (!valid) {
    admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
    let locked = false;
    if (admin.failedLoginAttempts >= config.adminMaxLoginAttempts) {
      admin.lockedUntil = new Date(Date.now() + config.adminLockoutMs);
      admin.failedLoginAttempts = 0;
      locked = true;
    }
    await admin.save();

    await logActivity({
      req,
      actor: { id: admin._id, email: admin.email, role: admin.role },
      action: "auth.login",
      status: "failure",
      message: locked ? "Account locked after repeated failed attempts" : "Invalid password",
      meta: { failedLoginAttempts: admin.failedLoginAttempts },
    });

    if (locked) {
      return res.status(429).json({
        success: false,
        error: "Too many failed attempts. The account has been temporarily locked.",
      });
    }
    return res.status(401).json({ success: false, error: GENERIC_LOGIN_ERROR });
  }

  if (admin.isActive === false) {
    await logActivity({
      req,
      actor: { id: admin._id, email: admin.email, role: admin.role },
      action: "auth.login",
      status: "failure",
      message: "Login attempt on deactivated account",
    });
    return res.status(403).json({
      success: false,
      error: "This account has been deactivated. Contact a super admin.",
    });
  }

  admin.failedLoginAttempts = 0;
  admin.lockedUntil = null;
  admin.lastLoginAt = new Date();
  admin.lastLoginIpHash = hashIp(clientIp(req));
  await admin.save();

  const session = await createSession(req, {
    userId: String(admin._id),
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  setSessionCookie(res, session.sessionToken);
  await logActivity({
    req,
    actor: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
    action: "auth.login",
    message: "Signed in",
  });

  return res.json({
    success: true,
    user: userPayload(admin),
    expiresAt: session.expiresAt,
  });
}

/**
 * Create and persist a server-side session.
 */
async function createSession(req, { userId, email, name, role }) {
  const now = Date.now();
  const token = crypto.randomBytes(32).toString("hex");
  const ua = requestUserAgent(req);

  const session = new AdminSession({
    sessionToken: token,
    userId,
    email: email || null,
    name: name || null,
    role: role || null,
    ipHash: hashIp(clientIp(req)),
    userAgentHash: hashUserAgent(ua),
    userAgent: ua,
    expiresAt: new Date(now + config.adminSessionIdleMs),
    absoluteExpiresAt: new Date(now + config.adminSessionTtlMs),
    lastActivityAt: new Date(now),
  });

  await session.save();
  return session;
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  const token = req.cookies?.admin_session;

  if (token) {
    try {
      await AdminSession.updateOne(
        { sessionToken: token },
        { $set: { revokedAt: new Date() } }
      ).exec();
    } catch {
      /* ignore DB error on logout */
    }
  }

  if (req.admin) {
    await logActivity({
      req,
      actor: req.admin,
      action: "auth.logout",
      message: "Signed out",
    });
  }

  clearSessionCookie(res);
  res.json({ success: true });
}

/**
 * GET /api/auth/me
 *
 * Returns the signed-in identity plus the effective permission set so the
 * client can render role-aware navigation without a second round trip.
 */
export async function me(req, res) {
  const token = req.cookies?.admin_session;
  if (!token) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      user: null,
    });
  }

  try {
    const session = await AdminSession.findOne({ sessionToken: token }).exec();
    if (!session || session.revokedAt) {
      return res.status(401).json({ success: false, authenticated: false, user: null });
    }

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      return res.status(401).json({ success: false, authenticated: false, user: null });
    }

    let admin = null;
    if (session.userId && session.userId !== LEGACY_ADMIN_ID) {
      admin = await Admin.findById(session.userId);
      if (!admin || admin.isActive === false) {
        return res.status(401).json({ success: false, authenticated: false, user: null });
      }
    } else {
      admin = legacyAdmin();
    }

    const role = session.role || admin.role || ROLES.SUPERADMIN;

    return res.json({
      success: true,
      authenticated: true,
      user: userPayload({
        ...(admin.toObject ? admin.toObject() : admin),
        role,
      }),
      session: {
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      authenticated: false,
      error: err.message,
    });
  }
}

/**
 * POST /api/auth/password — change the signed-in admin's password.
 */
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};

  if (typeof currentPassword !== "string" || !currentPassword) {
    return res.status(400).json({ success: false, error: "Current password is required" });
  }
  const policyError = passwordPolicyError(newPassword);
  if (policyError) {
    return res.status(400).json({ success: false, error: policyError });
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      error: "The new password must be different from the current password",
    });
  }

  try {
    if (req.admin?.isLegacy) {
      return res.status(400).json({
        success: false,
        error:
          "Operator accounts rotate their password through the ADMIN_PASSWORD_HASH environment variable.",
      });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    if (!verifyPassword(currentPassword, admin.passwordHash)) {
      await logActivity({
        req,
        actor: req.admin,
        action: "auth.password.change",
        status: "failure",
        message: "Current password did not match",
      });
      return res.status(401).json({ success: false, error: "Current password is incorrect" });
    }

    admin.passwordHash = hashPassword(newPassword);
    admin.passwordUpdatedAt = new Date();
    await admin.save();

    // Revoke every other session for this account.
    await AdminSession.updateMany(
      { userId: String(admin._id), revokedAt: null, sessionToken: { $ne: req.adminSession.sessionToken } },
      { $set: { revokedAt: new Date() } }
    );

    await logActivity({
      req,
      actor: req.admin,
      action: "auth.password.change",
      message: "Password changed; other sessions revoked",
    });

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("[auth] changePassword failed:", err);
    return res.status(500).json({ success: false, error: "Could not update password" });
  }
}

/**
 * PATCH /api/auth/profile — update the signed-in admin's own profile.
 */
export async function updateProfile(req, res) {
  const { name, recoveryPhone } = req.body || {};

  if (req.admin?.isLegacy) {
    return res.status(400).json({
      success: false,
      error: "Operator accounts cannot be edited from the dashboard.",
    });
  }

  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    if (typeof name === "string" && name.trim()) {
      admin.name = name.trim().slice(0, 80);
    }
    if (typeof recoveryPhone === "string") {
      admin.recoveryPhone = recoveryPhone.trim() || null;
    }
    await admin.save();

    await logActivity({
      req,
      actor: req.admin,
      action: "admin.profile.update",
      targetType: "admin",
      target: admin.email,
      message: "Updated own profile",
    });

    return res.json({ success: true, user: publicAdmin(admin) });
  } catch (err) {
    console.error("[auth] updateProfile failed:", err);
    return res.status(500).json({ success: false, error: "Could not update profile" });
  }
}

/**
 * GET /api/auth/sessions — active sessions for the signed-in account.
 */
export async function listSessions(req, res) {
  try {
    const filter = { revokedAt: null, expiresAt: { $gt: new Date() } };
    if (!req.admin?.isLegacy) {
      filter.userId = req.admin.id;
    }

    const sessions = await AdminSession.find(filter).sort({ lastActivityAt: -1 }).limit(50).lean();

    return res.json({
      success: true,
      data: sessions.map((session) => ({
        ...sessionPayload(session),
        current: session.sessionToken === req.cookies?.admin_session,
        userAgent: session.userAgent || null,
      })),
    });
  } catch (err) {
    console.error("[auth] listSessions failed:", err);
    return res.status(500).json({ success: false, error: "Could not list sessions" });
  }
}

/**
 * DELETE /api/auth/sessions/:id — revoke one of the signed-in account's sessions.
 */
export async function revokeSession(req, res) {
  try {
    const filter = { _id: req.params.id };
    if (!req.admin?.isLegacy) {
      filter.userId = req.admin.id;
    }

    const session = await AdminSession.findOne(filter);
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    session.revokedAt = new Date();
    await session.save();

    if (session.sessionToken === req.cookies?.admin_session) {
      clearSessionCookie(res);
    }

    await logActivity({
      req,
      actor: req.admin,
      action: "admin.session.revoke",
      targetType: "session",
      target: String(session._id),
      message: "Revoked a session",
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("[auth] revokeSession failed:", err);
    return res.status(500).json({ success: false, error: "Could not revoke session" });
  }
}
