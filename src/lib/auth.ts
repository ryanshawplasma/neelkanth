import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import { db } from "./db";

export const SESSION_COOKIE = "dd_session";
const SESSION_DAYS = 30;

export type SessionPayload = { uid: string; role: Role };

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret");
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.uid !== "string") return null;
    return { uid: payload.uid, role: (payload.role as Role) ?? "USER" };
  } catch {
    return null;
  }
}

export async function createSession(uid: string, role: Role) {
  const token = await signSession({ uid, role });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
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
