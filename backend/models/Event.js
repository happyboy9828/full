import mongoose from "mongoose";

const ELEMENT_SCHEMA = new mongoose.Schema(
  {
    tagName: { type: String, maxlength: 50 },
    id: { type: String, maxlength: 200 },
    className: { type: String, maxlength: 500 },
    text: { type: String, maxlength: 300 },
    href: { type: String, maxlength: 2048 },
    type: { type: String, maxlength: 50 },
    name: { type: String, maxlength: 200 },
    role: { type: String, maxlength: 100 },
  },
  { _id: false, strict: false }
);

const eventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: {
      type: String,
      required: true,
      enum: ["pageview", "click", "navigation", "heartbeat", "outbound", "custom"],
      index: true,
    },
    sessionId: { type: String, required: true, index: true },
    visitorId: { type: String, required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
    domain: { type: String, index: true },
    path: { type: String },
    url: { type: String, maxlength: 2048 },
    title: { type: String, maxlength: 300 },
    referrer: { type: String, maxlength: 2048 },
    referrerDomain: { type: String },
    previousPath: { type: String },
    element: { type: mongoose.Schema.Types.Mixed },
    customName: { type: String, maxlength: 200 },
    customData: { type: mongoose.Schema.Types.Mixed },
    duration: { type: Number },
    scrollDepth: { type: Number, min: 0, max: 100 },
    timestamp: { type: Date, default: Date.now, required: true, index: true },
  },
  { timestamps: true }
);

eventSchema.index({ sessionId: 1, timestamp: -1 });
eventSchema.index({ visitorId: 1, timestamp: -1 });
eventSchema.index({ domain: 1, eventType: 1, timestamp: -1 });
eventSchema.index({ path: 1 });

export default mongoose.model("Event", eventSchema);
