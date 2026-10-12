import crypto from "crypto";
import { AdminSession } from "../models/index.js";
import { clearSessionCookie } from "../utils/cookies.js";

export async function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_session;
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }

  try {
    const session = await AdminSession.findOne({ sessionToken: token });
    if (!session) {
      clearSessionCookie(res);
      return res.status(401).json({ success: false, error: "Invalid session" });
    }

    if (session.revokedAt) {
      clearSessionCookie(res);
      return res.status(401).json({ success: false, error: "Session revoked" });
    }

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      clearSessionCookie(res);
      return res.status(401).json({ success: false, error: "Session expired" });
    }

    req.adminSession = session;
    req.admin = { userId: session.userId };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Authentication failed" });
  }
}
