import crypto from "crypto";
import { Admin, AdminOtp, AdminSession } from "../models/index.js";
import { sendSms } from "../utils/sms.js";
import { hashPassword } from "../utils/password.js";
import config from "../config/env.js";

const OTP_LENGTH = config.otp.codeLength;
const OTP_TTL_MS = config.otp.ttlMs;
const DEFAULT_MAX_ATTEMPTS = config.otp.maxAttempts;

function generateOtp() {
  let code = "";
  for (let i = 0; i < OTP_LENGTH; i += 1) {
    code += String(Math.floor(Math.random() * 10));
  }
  return code;
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function recoveryMessage(otp, ttlMinutes) {
  return `Your DocFix admin password recovery code is ${otp}. It expires in ${ttlMinutes} minutes. Do not share this code with anyone.`;
}

const genericSuccess = {
  success: true,
  message:
    "If an active account with a registered recovery phone exists, an OTP has been sent to that number.",
};

export async function requestPasswordRecovery(req, res) {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    // Look up the admin and their registered recovery phone number. Respond
    // generically either way to avoid user enumeration via this endpoint.
    const admin = await Admin.findOne({
      email: email.toLowerCase(),
      isActive: true,
    }).lean();

    if (!admin) {
      return res.json(genericSuccess);
    }

    // Invalidate any unredeemed OTPs for this admin so only the latest is valid.
    await AdminOtp.updateMany(
      {
        admin: admin._id,
        purpose: "password_recovery",
        $or: [{ consumedAt: null }, { verifiedAt: null }],
      },
      { $set: { consumedAt: new Date() } }
    );

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await AdminOtp.create({
      admin: admin._id,
      phone: admin.recoveryPhone,
      otpHash,
      expiresAt,
      maxAttempts: DEFAULT_MAX_ATTEMPTS,
    });

    await sendSms(admin.recoveryPhone, recoveryMessage(otp, Math.round(OTP_TTL_MS / 60000)));

    return res.json(genericSuccess);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Password recovery request failed" });
  }
}

export async function verifyOtpAndResetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: "Email, OTP, and new password are required" });
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 8 characters",
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
    if (!admin) {
      return res.status(400).json({ success: false, error: "Invalid email or OTP" });
    }

    const otpRecord = await AdminOtp.findOne({
      admin: admin._id,
      phone: admin.recoveryPhone,
      purpose: "password_recovery",
      consumedAt: null,
      verifiedAt: null,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }

    if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
      await AdminOtp.updateOne({ _id: otpRecord._id }, { $set: { consumedAt: new Date() } });
      return res.status(400).json({ success: false, error: "OTP has expired" });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await AdminOtp.updateOne({ _id: otpRecord._id }, { $set: { consumedAt: new Date() } });
      return res.status(400).json({
        success: false,
        error: "Too many attempts. Request a new OTP",
      });
    }

    const valid = crypto.timingSafeEqual(
      Buffer.from(hashOtp(otp), "hex"),
      Buffer.from(otpRecord.otpHash, "hex")
    );

    otpRecord.attempts += 1;
    if (!valid) {
      await otpRecord.save();
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    // Mark the OTP verified and consumed so it cannot be reused.
    otpRecord.verifiedAt = new Date();
    otpRecord.consumedAt = new Date();
    await otpRecord.save();

    // Rotate the password and revoke all existing admin sessions so the user
    // must log in again with the new password.
    admin.passwordHash = hashPassword(newPassword);
    await admin.save();

    await AdminSession.updateMany(
      { $or: [{ userId: "admin" }, { userId: admin._id.toString() }] },
      { $set: { revokedAt: new Date() } }
    );

    return res.json({
      success: true,
      message: "Password updated successfully. Please log in again.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Password reset failed" });
  }
}
