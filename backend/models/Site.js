import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  trackOutboundLinks: { type: Boolean, default: true },
  trackClicks: { type: Boolean, default: true },
  trackEngagement: { type: Boolean, default: true },
  respectDNT: { type: Boolean, default: true },
}, { _id: false });

const siteSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  name: { type: String },
  trackingEnabled: { type: Boolean, default: true },
  settings: { type: settingsSchema, default: () => ({}) },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

export const Site = mongoose.model("Site", siteSchema);
export default Site;