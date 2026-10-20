import mongoose from "mongoose";
import { ROLES, ROLE_LIST } from "../config/roles.js";

/**
 * Administrator account.
 *
 * Authentication is email + password. The password is never stored in clear
 * text — only a scrypt hash in the form `salt:keyHex` (see utils/password.js).
 *
 * `recoveryPhone` is optional so that accounts can be provisioned without a
 * phone number; the SMS password-recovery flow simply skips accounts that
 * have no registered number.
 */
const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    name: { type: String, default: "", trim: true, maxlength: 80 },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ROLE_LIST,
      default: ROLES.VIEWER,
      index: true,
    },
    recoveryPhone: { type: String, default: null },
    isActive: { type: Boolean, default: true, index: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIpHash: { type: String, default: null },
    passwordUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

adminSchema.index({ role: 1, isActive: 1 });

// Legacy documents may predate the `name` field — fall back to the email so a
// password reset (which re-saves the document) can never fail validation.
adminSchema.pre("save", function ensureName() {
  if (!this.name) this.name = this.email;
});

export default mongoose.model("Admin", adminSchema);
