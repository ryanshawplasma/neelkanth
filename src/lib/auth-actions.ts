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
  getCurrentUser,
  getDeviceAccounts,
  getDeviceEntry,
  getSession,
  homePathFor,
  normalizePhone,
  passwordFingerprint,
} from "./auth";
import type { AccountArea, DeviceAccount } from "./account-types";
import { PUBLISHED_ADMIN_PASSWORD, adminPasswordProblem } from "./admin-password";
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
  await createSession(user.id, user.role, { pwf: passwordFingerprint(user.passwordHash) });
  await audit(user.id, isNew ? "auth.signup" : "auth.login", "User", user.id, { intent });
  return { ok: true, data: { isNew, onboarded: user.onboarded, role: user.role, hasPanditProfile: !!user.pandit } };
}

/**
 * Admin email + password login. Signing in with the README's published password still works, so
 * the owner can get in to change it, but lands straight on the change-password form.
 */
export async function adminLoginAction(email: string, password: string): Promise<ActionResult<{ mustChangePassword: boolean }>> {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || user.role !== "ADMIN" || !user.passwordHash) return { ok: false, error: "invalidCredentials" };
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { ok: false, error: "invalidCredentials" };
  await createSession(user.id, user.role, { pwf: passwordFingerprint(user.passwordHash) });
  await audit(user.id, "auth.admin_login", "User", user.id);
  return { ok: true, data: { mustChangePassword: password === PUBLISHED_ADMIN_PASSWORD } };
}

/**
 * Change the signed-in admin's password. Every session and remembered sign-in made with the old
 * password ends at once (passwordFingerprint), on every device; this one continues with the new.
 */
export async function changeAdminPasswordAction(current: string, next: string): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN" || !me.passwordHash) return { ok: false, error: "admin.errPasswordNotAdmin" };
  if (!(await bcrypt.compare(current, me.passwordHash))) return { ok: false, error: "admin.errPasswordCurrent" };
  const problem = adminPasswordProblem(next, current);
  if (problem) return { ok: false, error: `admin.${problem}` };

  const passwordHash = await bcrypt.hash(next, 12);
  await db.user.update({ where: { id: me.id }, data: { passwordHash } });
  await createSession(me.id, me.role, { pwf: passwordFingerprint(passwordHash) });
  await audit(me.id, "auth.admin_password_changed", "User", me.id);
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
  // Switching asks for no password, so it may only carry the one the account signed in with here:
  // after a password change, a remembered sign-in has to sign in again.
  const carried = entry ? entry.f : session?.pwf;
  if (user.passwordHash && carried !== passwordFingerprint(user.passwordHash)) {
    await forgetDeviceAccount(uid);
    return { ok: false, error: "accountUnavailable" };
  }

  if (!isCurrent || session?.role !== user.role) {
    // Keep the original sign-in time so switching never extends a session.
    await createSession(user.id, user.role, { signedInAt: entry?.t ?? session?.sia, pwf: carried });
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
