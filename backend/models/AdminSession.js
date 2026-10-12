import mongoose from "mongoose";

const adminSessionSchema = new mongoose.Schema({
    sessionToken: { type: String, required: true, unique: true },
  userId: { type: String, default: "admin", index: true },
  ipHash: { type: String, default: null },
  userAgentHash: { type: String, default: null },
    expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  revokedAt: { type: Date, default: null },
});

adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AdminSession", adminSessionSchema);
