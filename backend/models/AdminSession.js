import mongoose from "mongoose";

const adminSessionSchema = new mongoose.Schema({
  sessionToken: { type: String, required: true, unique: true },
  userId: { type: String, default: "admin", index: true },
  ipHash: { type: String, default: null },
  userAgentHash: { type: String, default: null },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  lastActivityAt: { type: Date, default: Date.now },
  revokedAt: { type: Date, default: null },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

export const AdminSession = mongoose.model("AdminSession", adminSessionSchema);
export default AdminSession;