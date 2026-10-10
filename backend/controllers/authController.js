import crypto from "node:crypto";
import { AdminSession } from "../models/index.js";
import config from "../config/env.js";
import { getAdminSessionToken, cookieOptions } from "../utils/cookies.js";
import { hashValue } from "../utils/sanitize.js";
import logger from "../utils/logger.js";
import { validateLoginPayload } from "../middleware/validate.js";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

function deriveKey(password, salt) {
  return crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
}

let cachedHash = null;

function getAdminHash() {
  if (cachedHash) return cachedHash;
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (stored) {
    const parts = stored.split("$");
    if (parts.length === 3 && parts[0] === "scrypt") {
      cachedHash = {
        salt: Buffer.from(parts[1], "base64"),
        hash: Buffer.from(parts[2], "base64"),
      };
      return cachedHash;
    }
    logger.warn("admin_password_hash_invalid_format");
  }
  const salt = crypto.randomBytes(16);
  const hash = deriveKey(config.adminPassword, salt);
  cachedHash = { salt, hash };
  return cachedHash;
}

function verifyPassword(password) {
  try {
    const { salt, hash } = getAdminHash();
    const candidate = deriveKey(password, salt);
    return candidate.length === hash.length && crypto.timingSafeEqual(candidate, hash);
  } catch {
    return false;
  }
}

export async function login(req, res) {
  try {
    const errors = validateLoginPayload(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    if (!verifyPassword(req.body.password)) {
      logger.warn("admin_login_failed", { ip: req.ip });
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + config.adminSessionTtlDays * 24 * 60 * 60 * 1000);

    await AdminSession.create({
      sessionToken: token,
      userId: "admin",
      ipHash: hashValue(req.ip),
      userAgentHash: hashValue(req.headers["user-agent"]),
      expiresAt,
    });

    res.cookie(config.cookieName, token, cookieOptions(expiresAt));
    logger.info("admin_login", { ip: req.ip });
    res.json({ success: true });
  } catch (error) {
    logger.error("admin_login_error", { error: error.message });
    res.status(500).json({ success: false, error: "Login failed" });
  }
}

export async function logout(req, res) {
  try {
    const token = getAdminSessionToken(req);
    if (token) {
      await AdminSession.updateOne(
        { sessionToken: token },
        { $set: { revokedAt: new Date() } }
      ).catch(() => {});
    }
    res.clearCookie(config.cookieName, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      path: "/",
    });
    logger.info("admin_logout", { ip: req.ip });
    res.json({ success: true });
  } catch (error) {
    logger.error("admin_logout_error", { error: error.message });
    res.status(500).json({ success: false, error: "Logout failed" });
  }
}

export async function me(req, res) {
  try {
    const token = getAdminSessionToken(req);
    if (!token) return res.status(401).json({ authenticated: false });

    const session = await AdminSession.findOne({ sessionToken: token });
    const valid = session && !session.revokedAt && session.expiresAt >= new Date();
    if (!valid) return res.status(401).json({ authenticated: false });

    res.json({ authenticated: true, user: { id: session.userId } });
  } catch (error) {
    logger.error("admin_me_error", { error: error.message });
    res.status(500).json({ authenticated: false });
  }
}
