import crypto from "crypto";
import config from "../config/env.js";
import { logger } from "./logger.js";

function twilioApiUrl(accountSid) {
  return `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
}

export async function sendSms(to, body) {
  const { provider, twilio } = config.sms;

  if (provider === "mock") {
    // Development mode: never hit a real carrier. The OTP is written to server
    // logs so it can be retrieved during local testing without SMS credentials.
    logger.info("sms.mock", {
      to,
      body,
      note: "SMS_PROVIDER=mock — OTP written to logs instead of sending",
    });
    return { success: true, provider: "mock", messageId: `mock-${crypto.randomUUID()}` };
  }

  if (provider === "twilio") {
    if (!twilio.accountSid || !twilio.authToken || !twilio.fromNumber) {
      throw new Error("Twilio credentials not configured");
    }

    const auth = Buffer.from(`${twilio.accountSid}:${twilio.authToken}`).toString("base64");
    const form = new URLSearchParams();
    form.set("From", twilio.fromNumber);
    form.set("To", to);
    form.set("Body", body);

    const res = await fetch(twilioApiUrl(twilio.accountSid), {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      logger.error("sms.twilio", { status: res.status, error: data });
      throw new Error(data.message || "SMS send failed");
    }

    return { success: true, provider: "twilio", messageId: data.sid };
  }

  throw new Error(`Unsupported SMS provider: ${provider}`);
}
