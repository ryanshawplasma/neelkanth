import "server-only";
import { db } from "./db";

const OTP_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

/**
 * OTP delivery is pluggable. In development the code is fixed (OTP_DEV_CODE) and
 * printed to the server console so the flow can be tested without an SMS gateway.
 * Wire MSG91 / Twilio / Gupshup inside `deliver()` for production.
 */
async function deliver(target: string, code: string) {
  if (process.env.SMS_PROVIDER === "msg91" && process.env.MSG91_AUTH_KEY) {
    // Example integration point:
    // await fetch("https://control.msg91.com/api/v5/otp?...", {...})
  }
  console.log(`\n[OTP] ${target} → ${code}\n`);
}

export async function requestOtp(target: string) {
  const code = process.env.OTP_DEV_CODE && process.env.NODE_ENV !== "production"
    ? process.env.OTP_DEV_CODE
    : String(Math.floor(100000 + Math.random() * 900000));

  await db.otpCode.updateMany({ where: { target, consumed: false }, data: { consumed: true } });
  await db.otpCode.create({
    data: { target, code, expiresAt: new Date(Date.now() + OTP_TTL_MIN * 60_000) },
  });
  await deliver(target, code);
  return { ttlMinutes: OTP_TTL_MIN, devHint: process.env.NODE_ENV !== "production" ? code : undefined };
}

export async function verifyOtp(target: string, code: string) {
  const rec = await db.otpCode.findFirst({
    where: { target, consumed: false },
    orderBy: { createdAt: "desc" },
  });
  if (!rec) return { ok: false as const, reason: "not_found" as const };
  if (rec.expiresAt < new Date()) return { ok: false as const, reason: "expired" as const };
  if (rec.attempts >= MAX_ATTEMPTS) return { ok: false as const, reason: "too_many" as const };
  if (rec.code !== code.trim()) {
    await db.otpCode.update({ where: { id: rec.id }, data: { attempts: { increment: 1 } } });
    return { ok: false as const, reason: "mismatch" as const };
  }
  await db.otpCode.update({ where: { id: rec.id }, data: { consumed: true } });
  return { ok: true as const };
}
