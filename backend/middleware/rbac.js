import { PERMISSIONS, ROLES, hasPermission, permissionsForRole, roleAtLeast } from "../config/roles.js";

/**
 * RBAC middleware.
 *
 * Usage:
 *   router.get("/users", requirePermission(PERMISSIONS.USERS_VIEW), handler)
 *   router.post("/admins", requireRole(ROLES.SUPERADMIN), handler)
 *
 * `requireAdmin` must run first — it populates `req.admin`.
 */

export function requirePermission(permission) {
  return function permissionGuard(req, res, next) {
    if (!req.admin) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }
    if (!hasPermission(req.admin.role, permission)) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to perform this action",
        required: permission,
      });
    }
    return next();
  };
}

export function requireRole(...roles) {
  const allowed = roles.flat();
  return function roleGuard(req, res, next) {
    if (!req.admin) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }
    if (!allowed.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        error: "Your role does not have access to this resource",
        required: allowed,
      });
    }
    return next();
  };
}

/**
 * Guard for actions that affect an account whose role is at least as
 * privileged as the actor. Superadmins may act on anyone except themselves
 * (self-management is handled separately to avoid lock-out).
 */
export function requireTargetBelowActor(actorRole) {
  return function targetGuard(req, res, next) {
    const targetRole = req.params?.role || req.body?.role || req.targetRole;
    if (!targetRole) return next();
    if (!roleAtLeast(actorRole, ROLES.SUPERADMIN)) {
      // Non-superadmins may never touch superadmin accounts.
      if (targetRole === ROLES.SUPERADMIN) {
        return res.status(403).json({
          success: false,
          error: "Only a super admin can modify super admin accounts",
        });
      }
    }
    return next();
  };
}

export { PERMISSIONS, ROLES, permissionsForRole };
