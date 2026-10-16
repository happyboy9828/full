import { Router } from "express";
import {
  requestPasswordRecovery,
  verifyOtpAndResetPassword,
} from "../controllers/otpController.js";
import { rateLimit } from "../middleware/rateLimit.js";
import config from "../config/env.js";

const router = Router();

const recoveryLimiter = rateLimit({
  windowMs: config.recoveryRateWindowMs,
  max: config.recoveryRateLimit,
  message: "Too many recovery attempts. Please try again later.",
  key: "auth-recovery",
});

router.post("/password-recovery/request", recoveryLimiter, requestPasswordRecovery);
router.post(
  "/password-recovery/verify",
  recoveryLimiter,
  verifyOtpAndResetPassword
);

export default router;
