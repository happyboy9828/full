import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  visitorId: { type: String, required: true },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site", index: true },
  domain: { type: String, index: true },
  startedAt: { type: Date, required: true, default: Date.now },
  endedAt: { type: Date, default: null },
  lastActivityAt: { type: Date, required: true, default: Date.now },
  duration: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  entryPage: { type: String },
  exitPage: { type: String, default: null },
  referrer: { type: String, default: null },
  referrerDomain: { type: String, default: null },
  utmSource: { type: String, default: null },
  utmMedium: { type: String, default: null },
  utmCampaign: { type: String, default: null },
  utmTerm: { type: String, default: null },
  utmContent: { type: String, default: null },
  country: { type: String, default: null },
  region: { type: String, default: null },
  city: { type: String, default: null },
  deviceType: { type: String, enum: ["desktop", "tablet", "mobile", "unknown"], default: "unknown" },
  browser: { type: String, default: null },
  browserVersion: { type: String, default: null },
  os: { type: String, default: null },
  osVersion: { type: String, default: null },
  language: { type: String, default: null },
  screenWidth: { type: Number, default: null },
  screenHeight: { type: Number, default: null },
  viewportWidth: { type: Number, default: null },
  viewportHeight: { type: Number, default: null },
  ipHash: { type: String, default: null },
  userAgent: { type: String, default: null },
  pageCount: { type: Number, default: 0 },
  eventCount: { type: Number, default: 0 },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

sessionSchema.index({ visitorId: 1 });
sessionSchema.index({ startedAt: -1 });
sessionSchema.index({ lastActivityAt: -1 });
sessionSchema.index({ domain: 1, startedAt: -1 });
sessionSchema.index({ isActive: 1 });
sessionSchema.index({ domain: 1, visitorId: 1 });
sessionSchema.index({ domain: 1, lastActivityAt: -1 });
sessionSchema.index({ visitorId: 1, startedAt: -1 });

export const Session = mongoose.model("Session", sessionSchema);
export default Session;