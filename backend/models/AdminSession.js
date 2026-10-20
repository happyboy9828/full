import mongoose from "mongoose";

/**
 * Server-side admin session.
 *
 * The cookie value is an opaque 32-byte random token (not a JWT) — the
 * server is the only source of truth, so sessions can be revoked instantly
 * and roles can be changed without waiting for a token to expire.
 *
 * `expiresAt` is refreshed on activity (idle timeout) but never beyond
 * `absoluteExpiresAt` (hard session lifetime).
 */
const adminSessionSchema = new mongoose.Schema({
  sessionToken: { type: String, required: true, unique: true },
  userId: { type: String, default: "admin", index: true },
  email: { type: String, default: null },
  name: { type: String, default: null },
  role: { type: String, default: null },
  ipHash: { type: String, default: null },
  userAgentHash: { type: String, default: null },
  userAgent: { type: String, default: null },
  expiresAt: { type: Date, required: true },
  absoluteExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  revokedAt: { type: Date, default: null },
});

adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
adminSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("AdminSession", adminSessionSchema);
