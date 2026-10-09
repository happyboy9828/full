import express from "express";
import { login, logout, me } from "../controllers/authController.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import config from "../config/env.js";

const router = express.Router();

const authLimiter = createRateLimiter({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  message: "Too many authentication attempts, please try again later",
});

router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", me);

export default router;
