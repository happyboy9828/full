import mongoose from "mongoose";

const adminOtpSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    phone: { type: String, required: true },
    otpHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["password_recovery"],
      default: "password_recovery",
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    verifiedAt: { type: Date, default: null },
    consumedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

adminOtpSchema.index({ admin: 1, createdAt: -1 });

export default mongoose.model("AdminOtp", adminOtpSchema);
