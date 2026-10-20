import mongoose from "mongoose";

export const APP_USER_ROLES = Object.freeze(["owner", "admin", "member", "viewer"]);
export const APP_USER_STATUSES = Object.freeze(["active", "invited", "suspended"]);
export const APP_USER_PLANS = Object.freeze(["free", "pro", "team", "enterprise"]);

/**
 * Application user — the people who use the product (as opposed to the
 * administrators who operate the dashboard).
 *
 * This is the record rendered by the "Users" table module. It is deliberately
 * separate from `Admin`: admins authenticate into the dashboard, app users
 * are the managed population.
 */
const appUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    company: { type: String, default: "", trim: true, maxlength: 120 },
    role: { type: String, enum: APP_USER_ROLES, default: "member", index: true },
    status: { type: String, enum: APP_USER_STATUSES, default: "invited", index: true },
    plan: { type: String, enum: APP_USER_PLANS, default: "free", index: true },
    phone: { type: String, default: "" },
    notes: { type: String, default: "", maxlength: 500 },
    lastSeenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

appUserSchema.index({ status: 1, createdAt: -1 });
appUserSchema.index({ role: 1, status: 1 });

export default mongoose.model("AppUser", appUserSchema);
