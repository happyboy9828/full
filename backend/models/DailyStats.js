import mongoose from "mongoose";

const topPageSchema = new mongoose.Schema({
  path: { type: String },
  title: { type: String },
  count: { type: Number },
}, { _id: false });

const referrerSchema = new mongoose.Schema({
  domain: { type: String },
  count: { type: Number },
}, { _id: false });

const deviceSchema = new mongoose.Schema({
  type: { type: String },
  count: { type: Number },
}, { _id: false });

const countrySchema = new mongoose.Schema({
  country: { type: String },
  count: { type: Number },
}, { _id: false });

const dailyStatsSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  domain: { type: String, required: true, index: true },
  pageViews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  sessions: { type: Number, default: 0 },
  bounceRate: { type: Number, default: 0 },
  avgSessionDuration: { type: Number, default: 0 },
  topPages: { type: [topPageSchema], default: [] },
  referrers: { type: [referrerSchema], default: [] },
  devices: { type: [deviceSchema], default: [] },
  countries: { type: [countrySchema], default: [] },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

dailyStatsSchema.index({ domain: 1, date: -1 }, { unique: true });

export const DailyStats = mongoose.model("DailyStats", dailyStatsSchema);
export default DailyStats;