import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import { db } from "./db";
import { formatPhone, type DeviceAccount } from "./account-types";

export const SESSION_COOKIE = "dd_session";
/** Signed list of accounts signed in on this device (one-tap account switching). */
export const ACCOUNTS_COOKIE = "dd_accounts";
const SESSION_DAYS = 30;
const DAY_SECONDS = 24 * 60 * 60;
const MAX_DEVICE_ACCOUNTS = 5;

/**
 * `sia` = when the person actually signed in (epoch seconds). Switching accounts re-issues the
 * session but keeps `sia`, so a session still ends 30 days after the real sign-in.
 */
export type SessionPayload = { uid: string; role: Role; sia?: number };

const nowSeconds = () => Math.floor(Date.now() / 1000);
const cookieBase = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
});

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret");
}

export async function signSession(payload: SessionPayload) {
  const sia = payload.sia ?? nowSeconds();
  return new SignJWT({ uid: payload.uid, role: payload.role, sia })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(sia + SESSION_DAYS * DAY_SECONDS)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.uid !== "string") return null;
    const sia = typeof payload.sia === "number" ? payload.sia : typeof payload.iat === "number" ? payload.iat : nowSeconds();
    return { uid: payload.uid, role: (payload.role as Role) ?? "USER", sia };
  } catch {
    return null;
  }
}

/**
 * Sign `uid` in on this device. Server actions / route handlers only (sets cookies).
 * The account — and whoever was signed in just before — is remembered on the device, so the
 * person can switch back without signing in again.
 */
export async function createSession(uid: string, role: Role, opts: { signedInAt?: number } = {}) {
  const jar = await cookies();
  const sia = opts.signedInAt ?? nowSeconds();

  const previousToken = jar.get(SESSION_COOKIE)?.value;
  const previous = previousToken ? await verifySessionToken(previousToken) : null;
  const remembered: DeviceEntry[] = [{ u: uid, t: sia }];
  if (previous && previous.uid !== uid) remembered.push({ u: previous.uid, t: previous.sia ?? sia });
  for (const e of await readDeviceEntries()) if (!remembered.some((r) => r.u === e.u)) remembered.push(e);
  await writeDeviceEntries(remembered);

  const token = await signSession({ uid, role, sia });
  jar.set(SESSION_COOKIE, token, { ...cookieBase(), maxAge: Math.max(60, sia + SESSION_DAYS * DAY_SECONDS - nowSeconds()) });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Full user row for the current session (null if logged out). */
export async function getCurrentUser() {
  const s = await getSession();
  if (!s) return null;
  const user = await db.user.findUnique({ where: { id: s.uid }, include: { pandit: true } });
  if (!user || user.isBlocked) return null;
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Redirects to login when not authenticated / not authorised. */
export async function requireUser(roles?: Role[], next?: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  if (roles && !roles.includes(user.role)) redirect("/");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function requirePandit() {
  const user = await getCurrentUser();
  if (!user) redirect("/pandit/login");
  if (user.role !== "PANDIT" && user.role !== "ADMIN") redirect("/pandit/register");
  if (!user.pandit) redirect("/pandit/register");
  return { user, pandit: user.pandit };
}

// ─────────────────────────── Accounts on this device ───────────────────────────

/** u = user id, t = when that account signed in (epoch seconds). Most recently used first. */
type DeviceEntry = { u: string; t: number };

async function readDeviceEntries(): Promise<DeviceEntry[]> {
  const jar = await cookies();
  const token = jar.get(ACCOUNTS_COOKIE)?.value;
  if (!token) return [];
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.typ !== "accounts" || !Array.isArray(payload.a)) return [];
    const cutoff = nowSeconds() - SESSION_DAYS * DAY_SECONDS;
    const seen = new Set<string>();
    const out: DeviceEntry[] = [];
    for (const raw of payload.a as unknown[]) {
      const e = raw as Partial<DeviceEntry> | null;
      if (!e || typeof e.u !== "string" || typeof e.t !== "number" || e.t <= cutoff || seen.has(e.u)) continue;
      seen.add(e.u);
      out.push({ u: e.u, t: e.t });
    }
    return out.slice(0, MAX_DEVICE_ACCOUNTS);
  } catch {
    return [];
  }
}

async function writeDeviceEntries(entries: DeviceEntry[]) {
  const jar = await cookies();
  const list = entries.slice(0, MAX_DEVICE_ACCOUNTS);
  if (!list.length) {
    jar.delete(ACCOUNTS_COOKIE);
    return;
  }
  const token = await new SignJWT({ typ: "accounts", a: list })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
  jar.set(ACCOUNTS_COOKIE, token, { ...cookieBase(), maxAge: SESSION_DAYS * DAY_SECONDS });
}

/** The remembered sign-in for `uid` on this device, if it is still valid. */
export async function getDeviceEntry(uid: string) {
  return (await readDeviceEntries()).find((e) => e.u === uid) ?? null;
}

/** Forget `uid` on this device; returns how many other accounts remain signed in here. */
export async function forgetDeviceAccount(uid: string) {
  const entries = await readDeviceEntries();
  const remaining = entries.filter((e) => e.u !== uid);
  if (remaining.length !== entries.length) await writeDeviceEntries(remaining);
  return remaining.length;
}

export async function clearDeviceAccounts() {
  const jar = await cookies();
  jar.delete(ACCOUNTS_COOKIE);
}

/** Accounts signed in on this device (current one first), for the account switcher. */
export async function getDeviceAccounts(): Promise<DeviceAccount[]> {
  const [session, entries] = await Promise.all([getSession(), readDeviceEntries()]);
  const ids = [...new Set([...(session ? [session.uid] : []), ...entries.map((e) => e.u)])];
  if (!ids.length) return [];
  const users = await db.user.findMany({
    where: { id: { in: ids }, isBlocked: false },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      avatarUrl: true,
      pandit: { select: { displayName: true, photoUrl: true } },
    },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  return ids.flatMap((id) => {
    const u = byId.get(id);
    if (!u) return [];
    const detail = formatPhone(u.phone) ?? u.email;
    return [
      {
        id: u.id,
        name: u.name || u.pandit?.displayName || detail || "—",
        detail: detail ?? null,
        role: u.role,
        avatarUrl: u.avatarUrl ?? u.pandit?.photoUrl ?? null,
        hasPanditProfile: !!u.pandit,
        current: u.id === session?.uid,
      },
    ];
  });
}

/** Where an account lands after signing in or switching to it. */
export function homePathFor(u: { role: Role; onboarded: boolean; pandit?: unknown }) {
  if (u.role === "ADMIN") return "/admin";
  if (u.role === "PANDIT") return u.pandit ? "/pandit/dashboard" : "/pandit/register";
  return u.onboarded ? "/" : "/onboarding";
}

/** Whether an account may be sent to an in-app path (guards `next`-style redirects). */
export function canOpenPath(u: { role: Role; pandit?: unknown }, path: string) {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return false;
  const inArea = (base: string) => path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}?`);
  if (inArea("/admin")) return u.role === "ADMIN";
  if (inArea("/pandit")) return (u.role === "PANDIT" || u.role === "ADMIN") && (!!u.pandit || path.startsWith("/pandit/register"));
  return true;
}

/** Normalize Indian phone: strips spaces/dashes, adds +91 when a 10-digit number is given. */
export function normalizePhone(input: string) {
  const digits = input.replace(/[^\d+]/g, "");
  if (/^\d{10}$/.test(digits)) return `+91${digits}`;
  if (/^91\d{10}$/.test(digits)) return `+${digits}`;
  if (/^\+91\d{10}$/.test(digits)) return digits;
  if (/^0\d{10}$/.test(digits)) return `+91${digits.slice(1)}`;
  return null;
}

export async function audit(actorId: string | null, action: string, entity?: string, entityId?: string, meta?: unknown) {
  try {
    await db.auditLog.create({
      data: { actorId, action, entity, entityId, meta: meta ? JSON.stringify(meta) : undefined },
    });
  } catch {
    // never block the main flow on audit failures
  }
}
