import "server-only";
import { getCurrentUser } from "@/lib/auth";

/** Uniform result shape for every pandit-portal server action. */
export type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export const fail = (error: string): Result<never> => ({ ok: false, error });
export const done = <T>(data?: T): Result<T> => ({ ok: true, data });

/** Logged-in user with the PANDIT (or ADMIN) role — no profile required yet. */
export async function currentPanditUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "PANDIT" && user.role !== "ADMIN") return null;
  return user;
}

/** Logged-in pandit **with** a completed PanditProfile. */
export async function currentPandit() {
  const user = await currentPanditUser();
  if (!user?.pandit) return null;
  return { user, pandit: user.pandit };
}

export const ERR = {
  auth: "pandit.errNotAuthorized",
  notFound: "pandit.errNotFound",
  generic: "pandit.errGeneric",
  required: "pandit.errRequired",
  exists: "pandit.errProfileExists",
} as const;
