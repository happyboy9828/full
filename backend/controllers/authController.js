import crypto from "crypto";
import { AdminSession } from "../models/index.js";
import { setSessionCookie, clearSessionCookie } from "../utils/cookies.js";
import config from "../config/env.js";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

let cachedHash = null;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `${salt}:${key.toString("hex")}`;
}

function getStoredHash() {
  if (cachedHash) return cachedHash;
  cachedHash = config.adminPasswordHash || hashPassword(config.adminPassword);
  return cachedHash;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, keyHex] = stored.split(":");
  const key = crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return crypto.timingSafeEqual(
    Buffer.from(keyHex, "hex"),
    Buffer.from(key.toString("hex"), "hex")
  );
}

export async function login(req, res) {
  const { password } = req.body || {};

  if (!password || typeof password !== "string") {
    return res.status(400).json({ success: false, error: "Password is required" });
  }

  const valid = await verifyPassword(password, getStoredHash());
  if (!valid) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const ua = req.get("user-agent") || "";
  const ipHash = crypto
    .createHash("sha256")
    .update(req.ip || req.connection?.remoteAddress)
    .digest("hex");

  const session = new AdminSession({
    sessionToken: token,
    userId: "admin",
    ipHash,
    userAgentHash: ua ? crypto.createHash("sha256").update(ua).digest("hex") : null,
    expiresAt: new Date(Date.now() + config.adminSessionTtlMs),
    lastActivityAt: new Date(),
  });

  await session.save();
  setSessionCookie(res, token);

  res.json({ success: true });
}

export async function logout(req, res) {
  const token = req.cookies?.admin_session;

  if (token) {
    try {
      await AdminSession.updateOne(
        { sessionToken: token },
        { $set: { revokedAt: new Date() } }
      ).exec();
    } catch {
      /* ignore DB error on logout */
    }
  }

  clearSessionCookie(res);
  res.json({ success: true });
}

export async function me(req, res) {
  const token = req.cookies?.admin_session;
  if (!token) {
    return res.status(401).json({
      success: false,
      authenticated: false,
    });
  }

  try {
    const session = await AdminSession.findOne({ sessionToken: token }).exec();
    if (!session) {
      return res.status(401).json({
        success: false,
        authenticated: false,
      });
    }

    if (session.revokedAt) {
      return res.status(401).json({
        success: false,
        authenticated: false,
      });
    }

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      return res.status(401).json({
        success: false,
        authenticated: false,
      });
    }

    res.json({
      success: true,
      authenticated: true,
      userId: session.userId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      authenticated: false,
      details: err.message,
    });
  }
}
