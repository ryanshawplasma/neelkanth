"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "./db";
import { audit, createSession, destroySession, getSession, normalizePhone } from "./auth";
import { OtpDeliveryError, requestOtp, verifyOtp } from "./otp";
import { LOCALE_COOKIE, isLocale } from "@/i18n/config";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/** Step 1: send OTP to a phone (devotee & pandit login share this). */
export async function requestOtpAction(phoneInput: string): Promise<ActionResult<{ target: string; devHint?: string }>> {
  const phone = normalizePhone(phoneInput);
  if (!phone) return { ok: false, error: "invalidPhone" };
  const blocked = await db.user.findUnique({ where: { phone }, select: { isBlocked: true } });
  if (blocked?.isBlocked) return { ok: false, error: "blocked" };
  try {
    const r = await requestOtp(phone);
    return { ok: true, data: { target: phone, devHint: r.devHint } };
  } catch (e) {
    if (e instanceof OtpDeliveryError) return { ok: false, error: "smsFailed" };
    throw e;
  }
}

/**
 * Step 2: verify OTP. Creates the user on first login.
 * `intent` = "pandit" creates the account with role PANDIT (profile is completed at /pandit/register).
 */
export async function verifyOtpAction(
  phoneInput: string,
  code: string,
  intent: "user" | "pandit" = "user",
): Promise<ActionResult<{ isNew: boolean; onboarded: boolean; role: string; hasPanditProfile: boolean }>> {
  const phone = normalizePhone(phoneInput);
  if (!phone) return { ok: false, error: "invalidPhone" };
  const v = await verifyOtp(phone, code);
  if (!v.ok) return { ok: false, error: v.reason === "expired" ? "otpExpired" : "invalidOtp" };

  const jar = await cookies();
  const cookieLocale = jar.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : "en";

  let user = await db.user.findUnique({ where: { phone }, include: { pandit: true } });
  let isNew = false;
  if (!user) {
    user = await db.user.create({
      data: { phone, role: intent === "pandit" ? "PANDIT" : "USER", locale },
      include: { pandit: true },
    });
    isNew = true;
  } else if (intent === "pandit" && user.role === "USER") {
    // Existing devotee wants to become a pandit: upgrade role; profile created at registration.
    user = await db.user.update({ where: { id: user.id }, data: { role: "PANDIT" }, include: { pandit: true } });
  }
  await db.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
  await createSession(user.id, user.role);
  await audit(user.id, isNew ? "auth.signup" : "auth.login", "User", user.id, { intent });
  return { ok: true, data: { isNew, onboarded: user.onboarded, role: user.role, hasPanditProfile: !!user.pandit } };
}

/** Admin email + password login. */
export async function adminLoginAction(email: string, password: string): Promise<ActionResult> {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || user.role !== "ADMIN" || !user.passwordHash) return { ok: false, error: "invalidCredentials" };
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { ok: false, error: "invalidCredentials" };
  await createSession(user.id, user.role);
  await audit(user.id, "auth.admin_login", "User", user.id);
  return { ok: true };
}

export async function logoutAction(redirectTo = "/") {
  const s = await getSession();
  if (s) await audit(s.uid, "auth.logout", "User", s.uid);
  await destroySession();
  redirect(redirectTo);
}
