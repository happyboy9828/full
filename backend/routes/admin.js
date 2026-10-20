import { Router } from "express";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/adminUsersController.js";
import { listActivity } from "../controllers/activityController.js";
import { getSystemStats } from "../controllers/systemController.js";
import { requireAdmin } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { PERMISSIONS } from "../config/roles.js";

/**
 * Administrative API (`/api/admin`).
 *
 * Every route requires a valid admin session (`requireAdmin`) and a specific
 * permission (`requirePermission`). The session check alone is not enough —
 * a viewer account must not be able to reach the user-management routes even
 * though it can reach the dashboard.
 */

const router = Router({ mergeParams: true });

const writeLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  message: "Too many administrative requests. Please slow down.",
  key: "admin-write",
});

router.use(requireAdmin);

/* Application users */
router.get("/users", requirePermission(PERMISSIONS.USERS_VIEW), listUsers);
router.post("/users", writeLimiter, requirePermission(PERMISSIONS.USERS_MANAGE), createUser);
router.patch("/users/:id", writeLimiter, requirePermission(PERMISSIONS.USERS_MANAGE), updateUser);
router.delete("/users/:id", writeLimiter, requirePermission(PERMISSIONS.USERS_MANAGE), deleteUser);

/* Administrator accounts */
router.get("/admins", requirePermission(PERMISSIONS.ADMINS_MANAGE), listAdmins);
router.post("/admins", writeLimiter, requirePermission(PERMISSIONS.ADMINS_MANAGE), createAdmin);
router.patch("/admins/:id", writeLimiter, requirePermission(PERMISSIONS.ADMINS_MANAGE), updateAdmin);
router.delete("/admins/:id", writeLimiter, requirePermission(PERMISSIONS.ADMINS_MANAGE), deleteAdmin);

/* Audit trail */
router.get("/activity", requirePermission(PERMISSIONS.ACTIVITY_VIEW), listActivity);

/* System statistics */
router.get("/system", requirePermission(PERMISSIONS.SYSTEM_VIEW), getSystemStats);

export default router;
