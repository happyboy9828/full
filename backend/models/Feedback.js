import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100, trim: true },
    email: { type: String, required: true, maxlength: 255, trim: true, lowercase: true },
    message: { type: String, required: true, maxlength: 5000, trim: true },
    ipHash: { type: String },
    userAgent: { type: String, maxlength: 500 },
    status: { type: String, enum: ["new", "read", "archived"], default: "new", index: true },
  },
  { timestamps: true }
);

feedbackSchema.index({ email: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Feedback", feedbackSchema);