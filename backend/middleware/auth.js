import { AdminSession } from "../models/index.js";
import config from "../config/env.js";
import { getAdminSessionToken } from "../utils/cookies.js";
import logger from "../utils/logger.js";

export async function requireAdmin(req, res, next) {
  const token = getAdminSessionToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  try {
    const session = await AdminSession.findOne({ sessionToken: token });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      logger.warn("admin_auth_rejected", { reason: !session ? "unknown_token" : "expired_or_revoked" });
      return res.status(401).json({ success: false, error: "Invalid or expired session" });
    }
    session.lastActivityAt = new Date();
    session.save().catch(() => {});
    req.admin = { userId: session.userId, sessionId: session._id };
    next();
  } catch (error) {
    logger.error("admin_auth_check_failed", { error: error.message });
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
