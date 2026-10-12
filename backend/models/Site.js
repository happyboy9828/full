import mongoose from "mongoose";

const siteSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, trim: true },
    trackingEnabled: { type: Boolean, default: true },
    settings: {
      trackOutboundLinks: { type: Boolean, default: true },
      trackClicks: { type: Boolean, default: true },
      trackEngagement: { type: Boolean, default: true },
      respectDNT: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Site", siteSchema);
