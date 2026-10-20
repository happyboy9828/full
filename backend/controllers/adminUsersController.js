import { Admin, AppUser, AdminSession } from "../models/index.js";
import { hashPassword, passwordPolicyError } from "../utils/password.js";
import { logActivity } from "../utils/audit.js";
import { ROLES, isValidRole, publicAdmin, roleAtLeast } from "../config/roles.js";
import { APP_USER_ROLES, APP_USER_STATUSES, APP_USER_PLANS } from "../models/AppUser.js";

/**
 * Administrative data-management endpoints.
 *
 * Two populations are managed here:
 *  - **Application users** (`AppUser`) — the people who use the product.
 *  - **Administrator accounts** (`Admin`) — the people who operate the dashboard.
 *
 * Every mutation writes an audit record.
 */

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

function clampLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function clampPage(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return parsed;
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ------------------------------------------------------------------------- */
/* Application users                                                         */
/* ------------------------------------------------------------------------- */

export async function listUsers(req, res) {
  const { search = "", status = "", role = "", page, limit } = req.query;

  const filter = {};
  if (status && APP_USER_STATUSES.includes(status)) filter.status = status;
  if (role && APP_USER_ROLES.includes(role)) filter.role = role;
  if (search && String(search).trim()) {
    const rx = new RegExp(escapeRegExp(String(search).trim()), "i");
    filter.$or = [{ name: rx }, { email: rx }, { company: rx }];
  }

  const currentPage = clampPage(page);
  const perPage = clampLimit(limit);

  try {
    const [users, total] = await Promise.all([
      AppUser.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .lean(),
      AppUser.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: users,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
      },
    });
  } catch (err) {
    console.error("[admin] listUsers failed:", err);
    return res.status(500).json({ success: false, error: "Could not load users" });
  }
}

export async function createUser(req, res) {
  const { name, email, company = "", role = "member", status = "invited", plan = "free", phone = "", notes = "" } =
    req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, error: "Name is required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, error: "A valid email is required" });
  }
  if (!APP_USER_ROLES.includes(role)) {
    return res.status(400).json({ success: false, error: "Invalid role" });
  }
  if (!APP_USER_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status" });
  }
  if (!APP_USER_PLANS.includes(plan)) {
    return res.status(400).json({ success: false, error: "Invalid plan" });
  }

  try {
    const existing = await AppUser.findOne({ email: String(email).trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: "A user with that email already exists" });
    }

    const user = await AppUser.create({
      name: String(name).trim().slice(0, 80),
      email: String(email).trim().toLowerCase(),
      company: String(company).slice(0, 120),
      role,
      status,
      plan,
      phone: String(phone).slice(0, 32),
      notes: String(notes).slice(0, 500),
    });

    await logActivity({
      req,
      actor: req.admin,
      action: "user.create",
      targetType: "app_user",
      target: user.email,
      message: `Created user ${user.email}`,
      meta: { role: user.role, status: user.status, plan: user.plan },
    });

    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    console.error("[admin] createUser failed:", err);
    return res.status(500).json({ success: false, error: "Could not create user" });
  }
}

export async function updateUser(req, res) {
  const { name, company, role, status, plan, phone, notes } = req.body || {};

  if (role !== undefined && !APP_USER_ROLES.includes(role)) {
    return res.status(400).json({ success: false, error: "Invalid role" });
  }
  if (status !== undefined && !APP_USER_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status" });
  }
  if (plan !== undefined && !APP_USER_PLANS.includes(plan)) {
    return res.status(400).json({ success: false, error: "Invalid plan" });
  }

  try {
    const user = await AppUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (typeof name === "string" && name.trim()) user.name = name.trim().slice(0, 80);
    if (typeof company === "string") user.company = company.slice(0, 120);
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (plan !== undefined) user.plan = plan;
    if (typeof phone === "string") user.phone = phone.slice(0, 32);
    if (typeof notes === "string") user.notes = notes.slice(0, 500);

    await user.save();

    await logActivity({
      req,
      actor: req.admin,
      action: "user.update",
      targetType: "app_user",
      target: user.email,
      message: `Updated user ${user.email}`,
      meta: { role: user.role, status: user.status, plan: user.plan },
    });

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error("[admin] updateUser failed:", err);
    return res.status(500).json({ success: false, error: "Could not update user" });
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await AppUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await user.deleteOne();

    await logActivity({
      req,
      actor: req.admin,
      action: "user.delete",
      targetType: "app_user",
      target: user.email,
      message: `Deleted user ${user.email}`,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("[admin] deleteUser failed:", err);
    return res.status(500).json({ success: false, error: "Could not delete user" });
  }
}

/* ------------------------------------------------------------------------- */
/* Administrator accounts                                                     */
/* ------------------------------------------------------------------------- */

export async function listAdmins(req, res) {
  try {
    const admins = await Admin.find().sort({ createdAt: 1 }).lean();
    return res.json({
      success: true,
      data: admins.map((admin) => ({
        ...publicAdmin(admin),
        locked: Boolean(admin.lockedUntil && new Date(admin.lockedUntil).getTime() > Date.now()),
        lockedUntil: admin.lockedUntil || null,
      })),
    });
  } catch (err) {
    console.error("[admin] listAdmins failed:", err);
    return res.status(500).json({ success: false, error: "Could not load administrators" });
  }
}

export async function createAdmin(req, res) {
  const { email, name, password, role = ROLES.VIEWER, recoveryPhone = "" } = req.body || {};

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, error: "A valid email is required" });
  }
  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, error: "Name is required" });
  }
  if (!isValidRole(role)) {
    return res.status(400).json({ success: false, error: "Invalid role" });
  }
  const policyError = passwordPolicyError(password);
  if (policyError) {
    return res.status(400).json({ success: false, error: policyError });
  }

  try {
    const normalised = String(email).trim().toLowerCase();
    const existing = await Admin.findOne({ email: normalised });
    if (existing) {
      return res.status(409).json({ success: false, error: "An account with that email already exists" });
    }

    const admin = await Admin.create({
      email: normalised,
      name: String(name).trim().slice(0, 80),
      passwordHash: hashPassword(password),
      role,
      recoveryPhone: String(recoveryPhone).trim() || null,
      passwordUpdatedAt: new Date(),
    });

    await logActivity({
      req,
      actor: req.admin,
      action: "admin.create",
      targetType: "admin",
      target: admin.email,
      message: `Created administrator ${admin.email}`,
      meta: { role: admin.role },
    });

    return res.status(201).json({ success: true, data: publicAdmin(admin) });
  } catch (err) {
    console.error("[admin] createAdmin failed:", err);
    return res.status(500).json({ success: false, error: "Could not create administrator" });
  }
}

export async function updateAdmin(req, res) {
  const { name, role, isActive, recoveryPhone, password } = req.body || {};
  const targetId = req.params.id;

  if (role !== undefined && !isValidRole(role)) {
    return res.status(400).json({ success: false, error: "Invalid role" });
  }
  if (password !== undefined) {
    const policyError = passwordPolicyError(password);
    if (policyError) {
      return res.status(400).json({ success: false, error: policyError });
    }
  }

  try {
    const admin = await Admin.findById(targetId);
    if (!admin) {
      return res.status(404).json({ success: false, error: "Administrator not found" });
    }

    const isSelf = req.admin && String(req.admin.id) === String(admin._id);
    const actorIsSuper = req.admin?.role === ROLES.SUPERADMIN;

    if (!actorIsSuper) {
      return res.status(403).json({
        success: false,
        error: "Only a super admin can modify administrator accounts",
      });
    }

    // Guard against removing the last super admin.
    if (
      (role !== undefined && role !== ROLES.SUPERADMIN && admin.role === ROLES.SUPERADMIN) ||
      (isActive === false && admin.role === ROLES.SUPERADMIN)
    ) {
      const remaining = await Admin.countDocuments({
        role: ROLES.SUPERADMIN,
        isActive: true,
        _id: { $ne: admin._id },
      });
      if (remaining === 0) {
        return res.status(400).json({
          success: false,
          error: "At least one active super admin must remain",
        });
      }
    }

    if (typeof name === "string" && name.trim()) admin.name = name.trim().slice(0, 80);
    if (role !== undefined) admin.role = role;
    if (isActive !== undefined) admin.isActive = Boolean(isActive);
    if (typeof recoveryPhone === "string") admin.recoveryPhone = recoveryPhone.trim() || null;

    if (password !== undefined) {
      admin.passwordHash = hashPassword(password);
      admin.passwordUpdatedAt = new Date();
      admin.failedLoginAttempts = 0;
      admin.lockedUntil = null;
      // Force re-authentication everywhere after a credential reset.
      await AdminSession.updateMany(
        { userId: String(admin._id), revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }

    if (isActive === false) {
      await AdminSession.updateMany(
        { userId: String(admin._id), revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }

    await admin.save();

    await logActivity({
      req,
      actor: req.admin,
      action: "admin.update",
      targetType: "admin",
      target: admin.email,
      message: `Updated administrator ${admin.email}`,
      meta: { role: admin.role, isActive: admin.isActive, passwordReset: password !== undefined },
    });

    return res.json({ success: true, data: publicAdmin(admin) });
  } catch (err) {
    console.error("[admin] updateAdmin failed:", err);
    return res.status(500).json({ success: false, error: "Could not update administrator" });
  }
}

export async function deleteAdmin(req, res) {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, error: "Administrator not found" });
    }

    if (req.admin && String(req.admin.id) === String(admin._id)) {
      return res.status(400).json({ success: false, error: "You cannot delete your own account" });
    }

    if (admin.role === ROLES.SUPERADMIN) {
      const remaining = await Admin.countDocuments({
        role: ROLES.SUPERADMIN,
        isActive: true,
        _id: { $ne: admin._id },
      });
      if (remaining === 0) {
        return res.status(400).json({
          success: false,
          error: "At least one active super admin must remain",
        });
      }
    }

    await AdminSession.updateMany(
      { userId: String(admin._id), revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
    await admin.deleteOne();

    await logActivity({
      req,
      actor: req.admin,
      action: "admin.delete",
      targetType: "admin",
      target: admin.email,
      message: `Deleted administrator ${admin.email}`,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("[admin] deleteAdmin failed:", err);
    return res.status(500).json({ success: false, error: "Could not delete administrator" });
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { escapeRegExp, roleAtLeast };
