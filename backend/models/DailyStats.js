import mongoose from "mongoose";

const dailyStatsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    domain: { type: String, required: true },
    pageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 },
    topPages: [{ path: String, title: String, count: Number }],
    referrers: [{ domain: String, count: Number }],
    devices: [{ type: String, count: Number }],
    countries: [{ country: String, count: Number }],
  },
  { timestamps: true }
);

dailyStatsSchema.index({ domain: 1, date: 1 }, { unique: true });
dailyStatsSchema.index({ date: -1 });

export default mongoose.model("DailyStats", dailyStatsSchema);
