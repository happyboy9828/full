import nodemailer from "nodemailer";
import { Feedback } from "../models/index.js";
import config from "../config/env.js";
import { hashIp } from "../utils/sanitize.js";

let transporter = null;

function getTransporter() {
  if (!transporter && config.email.host && config.email.user && config.email.pass) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }
  return transporter;
}

async function sendFeedbackEmail(feedback) {
  const transport = getTransporter();
  if (!transport) {
    console.warn("Email not configured, skipping feedback email");
    return false;
  }

  try {
    await transport.sendMail({
      from: config.email.from,
      to: config.email.to,
      subject: `New Feedback from ${feedback.name}`,
      text: `
Name: ${feedback.name}
Email: ${feedback.email}
Message:
${feedback.message}

---
Submitted at: ${new Date().toISOString()}
IP Hash: ${feedback.ipHash || "N/A"}
      `.trim(),
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">New Feedback Received</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px; font-weight: bold; color: #555;">Name:</td>
      <td style="padding: 8px;">${feedback.name}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold; color: #555;">Email:</td>
      <td style="padding: 8px;"><a href="mailto:${feedback.email}">${feedback.email}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold; color: #555; vertical-align: top;">Message:</td>
      <td style="padding: 8px; white-space: pre-wrap;">${feedback.message}</td>
    </tr>
  </table>
  <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
  <p style="color: #888; font-size: 12px;">
    Submitted at: ${new Date().toISOString()}<br>
    IP Hash: ${feedback.ipHash || "N/A"}
  </p>
</div>
      `.trim(),
    });
    return true;
  } catch (error) {
    console.error("Failed to send feedback email:", error.message);
    return false;
  }
}

export async function submitFeedback(req, res) {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and message are required",
    });
  }

  if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
    return res.status(400).json({
      success: false,
      error: "Name must be between 1 and 100 characters",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email) || email.length > 255) {
    return res.status(400).json({
      success: false,
      error: "Invalid email address",
    });
  }

  if (typeof message !== "string" || message.trim().length === 0 || message.length > 5000) {
    return res.status(400).json({
      success: false,
      error: "Message must be between 1 and 5000 characters",
    });
  }

  const ipHash = hashIp(req.ip || req.connection?.remoteAddress);
  const userAgent = req.get("user-agent") || "";

  try {
    const feedback = await Feedback.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      ipHash,
      userAgent: userAgent ? userAgent.slice(0, 500) : null,
    });

    await sendFeedbackEmail(feedback);

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedbackId: feedback._id,
    });
  } catch (err) {
    console.error("Failed to save feedback:", err);
    res.status(500).json({
      success: false,
      error: "Failed to submit feedback",
    });
  }
}

export async function getFeedback(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()
      .exec();

    const total = await Feedback.countDocuments(query).exec();

    res.json({
      success: true,
      feedback,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Failed to fetch feedback:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch feedback",
    });
  }
}

export async function updateFeedbackStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!["new", "read", "archived"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Invalid status",
    });
  }

  try {
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean().exec();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: "Feedback not found",
      });
    }

    res.json({ success: true, feedback });
  } catch (err) {
    console.error("Failed to update feedback status:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update feedback",
    });
  }
}