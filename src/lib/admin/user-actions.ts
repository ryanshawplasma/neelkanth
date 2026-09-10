"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";

export type Result = { ok: boolean; error?: string };

function touch(userId?: string) {
  revalidatePath("/admin/users");
  if (userId) revalidatePath(`/admin/users/${userId}`);
}

export async function toggleBlockUserAction(userId: string, blocked: boolean): Promise<Result> {
  const admin = await requireAdmin();
  if (userId === admin.id) return { ok: false, error: "admin.errCannotBlockSelf" };
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "admin.errNotFound" };

  await db.user.update({ where: { id: userId }, data: { isBlocked: blocked } });
  await audit(admin.id, blocked ? "user.block" : "user.unblock", "User", userId);
  touch(userId);
  revalidatePath("/admin/pandits");
  return { ok: true };
}

export async function setUserLocaleAction(userId: string, locale: string): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.enum(["en", "hi"]).safeParse(locale);
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  await db.user.update({ where: { id: userId }, data: { locale: parsed.data } });
  await audit(admin.id, "user.locale", "User", userId, { locale: parsed.data });
  touch(userId);
  return { ok: true };
}

/** Promote a devotee to ADMIN (guarded by a confirm dialog in the UI). */
export async function setUserRoleAction(userId: string, role: "USER" | "PANDIT" | "ADMIN"): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.enum(["USER", "PANDIT", "ADMIN"]).safeParse(role);
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  if (userId === admin.id) return { ok: false, error: "admin.errCannotChangeSelf" };

  const user = await db.user.findUnique({ where: { id: userId }, include: { pandit: true } });
  if (!user) return { ok: false, error: "admin.errNotFound" };
  if (parsed.data === "PANDIT" && !user.pandit) return { ok: false, error: "admin.errNoPanditProfile" };

  await db.user.update({ where: { id: userId }, data: { role: parsed.data } });
  await audit(admin.id, "user.role", "User", userId, { role: parsed.data, previous: user.role });
  touch(userId);
  return { ok: true };
}

const notifySchema = z.object({
  titleEn: z.string().min(2).max(120),
  titleHi: z.string().min(1).max(120),
  bodyEn: z.string().max(500).optional(),
  bodyHi: z.string().max(500).optional(),
  href: z.string().max(300).optional(),
});

/** One-off bilingual notification to a single user (in-app + web push). */
export async function sendUserNotificationAction(userId: string, input: z.input<typeof notifySchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = notifySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "admin.errTitleRequired" };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "admin.errNotFound" };

  await notifyUser({
    userId,
    type: "SYSTEM",
    titleEn: parsed.data.titleEn,
    titleHi: parsed.data.titleHi,
    bodyEn: parsed.data.bodyEn || undefined,
    bodyHi: parsed.data.bodyHi || undefined,
    href: parsed.data.href || undefined,
  });
  await audit(admin.id, "user.notify", "User", userId, { title: parsed.data.titleEn });
  touch(userId);
  return { ok: true };
}
