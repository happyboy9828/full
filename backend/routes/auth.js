import { Router } from "express";
import { login, logout, me } from "../controllers/authController.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  message: "Too many login attempts. Please try again later.",
  key: "auth-login",
});

router.post("/login", loginLimiter, login);
router.post("/logout", requireAdmin, logout);
router.get("/me", me);

export default router;
