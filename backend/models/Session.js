import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    visitorId: { type: String, required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
    domain: { type: String, index: true },
    startedAt: { type: Date, default: Date.now, index: true },
    endedAt: { type: Date, index: true, default: null },
    lastActivityAt: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    entryPage: { type: String, default: null },
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
    deviceType: { type: String, default: "unknown" },
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
  },
  { timestamps: true }
);


sessionSchema.index({ visitorId: 1, startedAt: -1 });
sessionSchema.index({ domain: 1, lastActivityAt: -1 });
sessionSchema.index({ domain: 1, startedAt: -1 });
sessionSchema.index({ isActive: 1 });

export default mongoose.model("Session", sessionSchema);
