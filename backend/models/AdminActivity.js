import mongoose from "mongoose";

/**
 * Audit trail for administrative actions.
 *
 * Every mutating admin action (and every authentication attempt) appends one
 * record here. Records are immutable — no update path is exposed by the API.
 *
 * PII is minimised: the caller's IP and user agent are stored as SHA-256
 * hashes, never in clear text.
 */
const adminActivitySchema = new mongoose.Schema({
  actorId: { type: String, default: null, index: true },
  actorEmail: { type: String, default: null, index: true },
  actorName: { type: String, default: null },
  actorRole: { type: String, default: null },
  action: { type: String, required: true, index: true },
  targetType: { type: String, default: null },
  target: { type: String, default: null },
  status: { type: String, enum: ["success", "failure"], default: "success", index: true },
  message: { type: String, default: null },
  meta: { type: mongoose.Schema.Types.Mixed, default: null },
  ipHash: { type: String, default: null },
  userAgentHash: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
});

adminActivitySchema.index({ createdAt: -1 });
adminActivitySchema.index({ actorEmail: 1, createdAt: -1 });
adminActivitySchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("AdminActivity", adminActivitySchema);
