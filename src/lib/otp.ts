import "server-only";
import { db } from "./db";

const OTP_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;
const OTP_LENGTH = 6;

/**
 * OTP delivery providers (env SMS_PROVIDER):
 *   console  — no gateway. OTP is fixed to OTP_DEV_CODE outside production and printed to the
 *              server console; the login screens show it as a dev hint.
 *   renflair — Renflair SMS OTP gateway (https://renflair.in). Set RENFLAIR_API_KEY.
 *              RENFLAIR_CHANNEL = "sms" (V1, text message) | "voice" (V2, voice call).
 *              A random OTP is generated and never returned to the client.
 */
type Provider = "console" | "renflair";

function provider(): Provider {
  return process.env.SMS_PROVIDER === "renflair" && process.env.RENFLAIR_API_KEY ? "renflair" : "console";
}

function randomOtp() {
  const min = 10 ** (OTP_LENGTH - 1);
  return String(min + Math.floor(Math.random() * (9 * min)));
}

export class OtpDeliveryError extends Error {}

/** Renflair expects the 10-digit Indian number without the country code. */
function renflairPhone(target: string) {
  const digits = target.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

async function sendViaRenflair(target: string, code: string) {
  const key = process.env.RENFLAIR_API_KEY!;
  const voice = process.env.RENFLAIR_CHANNEL === "voice";
  const url = new URL(`https://sms.renflair.in/${voice ? "V2" : "V1"}.php`);
  url.searchParams.set("API", key);
  url.searchParams.set("PHONE", renflairPhone(target));
  url.searchParams.set("OTP", code);

  const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(10_000) }).catch((e: unknown) => {
    throw new OtpDeliveryError(`Renflair request failed: ${e instanceof Error ? e.message : String(e)}`);
  });
  const body = await res.text();
  // Renflair answers with JSON like {"return":true,...} or a status string; treat HTTP errors and
  // explicit failure markers as delivery failures so the user can retry.
  const failed = !res.ok || /"return"\s*:\s*false|error|invalid|fail/i.test(body);
  if (failed) {
    console.error("[OTP] Renflair rejected the request:", res.status, body.slice(0, 300));
    throw new OtpDeliveryError("Renflair rejected the request");
  }
  console.log(`[OTP] Renflair ${voice ? "voice" : "sms"} sent to ${renflairPhone(target)}`);
}

async function deliver(target: string, code: string) {
  if (provider() === "renflair") return sendViaRenflair(target, code);
  console.log(`\n[OTP] ${target} → ${code}\n`);
}

export async function requestOtp(target: string) {
  const useDevCode = provider() === "console" && process.env.OTP_DEV_CODE && process.env.NODE_ENV !== "production";
  const code = useDevCode ? process.env.OTP_DEV_CODE! : randomOtp();

  // Deliver first so a gateway failure doesn't leave a dangling code.
  await deliver(target, code);

  await db.otpCode.updateMany({ where: { target, consumed: false }, data: { consumed: true } });
  await db.otpCode.create({
    data: { target, code, expiresAt: new Date(Date.now() + OTP_TTL_MIN * 60_000) },
  });
  return { ttlMinutes: OTP_TTL_MIN, devHint: useDevCode ? code : undefined, provider: provider() };
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
