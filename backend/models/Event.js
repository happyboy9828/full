import mongoose from "mongoose";

const elementSchema = new mongoose.Schema({
  tagName: { type: String },
  id: { type: String },
  className: { type: String },
  text: { type: String },
  href: { type: String, default: null },
}, { _id: false });

const eventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true, enum: ["pageview", "click", "navigation", "heartbeat", "outbound", "custom"], index: true },
  sessionId: { type: String, required: true, index: true },
  visitorId: { type: String, required: true, index: true },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site", index: true },
  domain: { type: String, index: true },
  path: { type: String, default: null, index: true },
  url: { type: String, default: null },
  title: { type: String, default: null },
  referrer: { type: String, default: null },
  referrerDomain: { type: String, default: null },
  previousPath: { type: String, default: null },
  element: { type: elementSchema, default: null },
  customName: { type: String, default: null },
  customData: { type: mongoose.Schema.Types.Mixed, default: null },
  duration: { type: Number, default: null },
  scrollDepth: { type: Number, default: null, min: 0, max: 100 },
  timestamp: { type: Date, required: true, default: Date.now, index: true },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

eventSchema.index({ sessionId: 1, timestamp: -1 });
eventSchema.index({ visitorId: 1, timestamp: -1 });
eventSchema.index({ eventType: 1, timestamp: -1 });
eventSchema.index({ domain: 1, timestamp: -1 });

export const Event = mongoose.model("Event", eventSchema);
export default Event;