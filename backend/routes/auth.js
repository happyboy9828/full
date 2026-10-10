import express from "express";
import { login, logout, me } from "../controllers/authController.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import config from "../config/env.js";
import logger from "../utils/logger.js";

const router = express.Router();

const authLimiter = createRateLimiter({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  message: "Too many authentication attempts, please try again later",
});

// Debug logging for auth routes
router.use((req, res, next) => {
  logger.debug("auth_route_request", {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
  });
  next();
});

router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", me);

export default router;
