import { Router } from "express";
import {
  login,
  logout,
  me,
  changePassword,
  updateProfile,
  listSessions,
  revokeSession,
} from "../controllers/authController.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { requireAdmin, optionalAdmin } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  message: "Too many login attempts. Please try again later.",
  key: "auth-login",
  // Only failed sign-ins consume the budget — a legitimate administrator is
  // never locked out by repeated successful logins.
  countOnlyFailures: true,
});

router.post("/login", loginLimiter, login);
router.post("/logout", optionalAdmin, logout);
router.get("/me", me);
router.post("/password", requireAdmin, changePassword);
router.patch("/profile", requireAdmin, updateProfile);
router.get("/sessions", requireAdmin, listSessions);
router.delete("/sessions/:id", requireAdmin, revokeSession);

export default router;
