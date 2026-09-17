"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "./db";
import {
  audit,
  canOpenPath,
  clearDeviceAccounts,
  createSession,
  destroySession,
  forgetDeviceAccount,
  getDeviceAccounts,
  getDeviceEntry,
  getSession,
  homePathFor,
  normalizePhone,
} from "./auth";
import type { AccountArea, DeviceAccount } from "./account-types";
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

/** Sign out of the current account (it is also forgotten on this device). */
export async function logoutAction(redirectTo = "/") {
  const s = await getSession();
  if (s) {
    await audit(s.uid, "auth.logout", "User", s.uid);
    await forgetDeviceAccount(s.uid);
  }
  await destroySession();
  redirect(redirectTo);
}

// ─────────────────────────── Account switching ───────────────────────────

/** Accounts signed in on this device, current first (loaded when a switcher opens). */
export async function getDeviceAccountsAction(): Promise<DeviceAccount[]> {
  return getDeviceAccounts();
}

/**
 * Make another account signed in on this device the active one — no OTP or password needed,
 * because it already signed in here. Returns where to go (`to` when that account may open it).
 */
export async function switchAccountAction(uid: string, to?: string): Promise<ActionResult<{ href: string }>> {
  const [session, entry] = await Promise.all([getSession(), getDeviceEntry(uid)]);
  const isCurrent = session?.uid === uid;
  if (!entry && !isCurrent) return { ok: false, error: "accountUnavailable" };

  const user = await db.user.findUnique({ where: { id: uid }, include: { pandit: { select: { id: true } } } });
  if (!user || user.isBlocked) {
    await forgetDeviceAccount(uid);
    return { ok: false, error: "accountUnavailable" };
  }

  if (!isCurrent || session?.role !== user.role) {
    // Keep the original sign-in time so switching never extends a session.
    await createSession(user.id, user.role, { signedInAt: entry?.t ?? session?.sia });
    if (!isCurrent) await audit(user.id, "auth.switch_account", "User", user.id, { from: session?.uid ?? null });
  }
  const href = to && canOpenPath(user, to) ? to : homePathFor(user);
  return { ok: true, data: { href } };
}

/** Remove another account from this device (it will need to sign in again). */
export async function forgetAccountAction(uid: string): Promise<ActionResult> {
  const session = await getSession();
  if (session?.uid === uid) return { ok: false, error: "cannotRemoveCurrent" };
  await forgetDeviceAccount(uid);
  return { ok: true };
}

const LOGIN_PATH: Record<AccountArea, string> = { app: "/login", pandit: "/pandit/login", admin: "/admin/login" };
const SIGNED_OUT_PATH: Record<AccountArea, string> = { app: "/", pandit: "/pandit/login", admin: "/admin/login" };

/**
 * Sign out from a switcher. "current" signs out of the active account only; when other accounts
 * stay signed in on the device, it lands on the login page where they are offered one-tap.
 */
export async function signOutAction(scope: "current" | "all", area: AccountArea): Promise<ActionResult<{ href: string }>> {
  const session = await getSession();
  if (session) await audit(session.uid, scope === "all" ? "auth.logout_all" : "auth.logout", "User", session.uid);
  if (scope === "all") {
    await clearDeviceAccounts();
    await destroySession();
    return { ok: true, data: { href: SIGNED_OUT_PATH[area] } };
  }
  const remaining = session ? await forgetDeviceAccount(session.uid) : 0;
  await destroySession();
  return { ok: true, data: { href: remaining > 0 ? LOGIN_PATH[area] : SIGNED_OUT_PATH[area] } };
}
