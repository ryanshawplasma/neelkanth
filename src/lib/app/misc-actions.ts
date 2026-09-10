"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ActionResult } from "@/lib/auth-actions";
import { CITIES, CITY_COOKIE } from "./cities";

/* ─────────────────────────── Favorites ─────────────────────────── */

export async function toggleFavoriteAction(serviceId: string): Promise<ActionResult<{ favorited: boolean }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const existing = await db.favorite.findUnique({ where: { userId_serviceId: { userId: user.id, serviceId } } });
  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/account");
    return { ok: true, data: { favorited: false } };
  }
  const service = await db.service.findUnique({ where: { id: serviceId }, select: { id: true } });
  if (!service) return { ok: false, error: "notFound" };
  await db.favorite.create({ data: { userId: user.id, serviceId } });
  revalidatePath("/account");
  return { ok: true, data: { favorited: true } };
}

/* ─────────────────────────── Notifications ─────────────────────────── */

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  await db.notification.updateMany({ where: { id, userId: user.id }, data: { read: true } });
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  await db.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ─────────────────────────── Library ─────────────────────────── */

export async function incrementContentViewAction(slug: string): Promise<void> {
  await db.contentItem.updateMany({ where: { slug }, data: { views: { increment: 1 } } });
}

/* ─────────────────────────── Panchang city ─────────────────────────── */

export async function setPanchangCityAction(slug: string): Promise<ActionResult> {
  if (!CITIES.some((c) => c.slug === slug)) return { ok: false, error: "invalidInput" };
  const jar = await cookies();
  jar.set(CITY_COOKIE, slug, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/panchang");
  revalidatePath("/");
  return { ok: true };
}

/* ─────────────────────────── Astrology consultation ─────────────────────────── */

const consultSchema = z.object({
  topic: z.string().trim().min(1).max(30),
  question: z.string().trim().max(800).optional(),
  mode: z.enum(["chat", "call", "video"]).default("chat"),
  panditId: z.string().optional(),
});

export type ConsultInput = z.input<typeof consultSchema>;

export async function requestConsultationAction(input: ConsultInput): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const parsed = consultSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalidInput" };
  let panditId: string | null = null;
  if (parsed.data.panditId) {
    const p = await db.panditProfile.findFirst({ where: { id: parsed.data.panditId, isActive: true, kycStatus: "APPROVED" }, select: { id: true } });
    panditId = p?.id ?? null;
  }
  const c = await db.consultation.create({
    data: { userId: user.id, topic: parsed.data.topic, question: parsed.data.question || null, mode: parsed.data.mode, panditId },
  });
  revalidatePath("/astrology");
  return { ok: true, data: { id: c.id } };
}
