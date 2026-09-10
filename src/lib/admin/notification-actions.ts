"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";
import { runAllReminders } from "@/lib/reminders";
import { REMINDERS_LAST_RUN_KEY } from "./util";

export type Result = { ok: boolean; error?: string; id?: string; count?: number; summary?: string };

const campaignSchema = z.object({
  titleEn: z.string().min(2).max(120),
  titleHi: z.string().min(1).max(120),
  bodyEn: z.string().max(500).optional().default(""),
  bodyHi: z.string().max(500).optional().default(""),
  href: z.string().max(300).optional().default(""),
  imageUrl: z.string().max(400).optional().default(""),
  audience: z.string().min(1).max(60).default("ALL"),
  scheduledAt: z.string().max(40).optional().default(""),
  mode: z.enum(["now", "schedule", "draft"]).default("now"),
});

function audienceWhere(audience: string): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { isBlocked: false };
  if (audience === "USERS") where.role = "USER";
  else if (audience === "PANDITS") where.role = "PANDIT";
  else if (audience === "ONBOARDED") where.onboarded = true;
  else if (audience.startsWith("CITY:")) where.city = audience.slice(5);
  return where;
}

/** Composer: send immediately, schedule for later, or keep as a draft. */
export async function createCampaignAction(input: z.input<typeof campaignSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "admin.errTitleRequired" };
  const d = parsed.data;

  if (d.audience.startsWith("CITY:") && d.audience.length <= 5) return { ok: false, error: "admin.errCityRequired" };
  const when = d.scheduledAt ? new Date(d.scheduledAt) : null;
  if (d.mode === "schedule" && (!when || Number.isNaN(when.getTime()))) return { ok: false, error: "admin.errScheduleRequired" };

  const campaign = await db.campaign.create({
    data: {
      titleEn: d.titleEn,
      titleHi: d.titleHi,
      bodyEn: d.bodyEn || null,
      bodyHi: d.bodyHi || null,
      href: d.href || null,
      imageUrl: d.imageUrl || null,
      audience: d.audience,
      scheduledAt: d.mode === "schedule" ? when : null,
      status: d.mode === "now" ? "DRAFT" : d.mode === "schedule" ? "SCHEDULED" : "DRAFT",
    },
  });

  let count = 0;
  if (d.mode === "now") {
    count = await deliverCampaign(campaign.id);
  }
  await audit(admin.id, `campaign.${d.mode}`, "Campaign", campaign.id, { audience: d.audience, count });
  revalidatePath("/admin/notifications");
  return { ok: true, id: campaign.id, count };
}

/** Shared delivery path used by "send now" and by re-sending a draft. */
async function deliverCampaign(campaignId: string) {
  const c = await db.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  const users = await db.user.findMany({ where: audienceWhere(c.audience), select: { id: true } });
  let count = 0;
  for (const u of users) {
    const r = await notifyUser({
      userId: u.id,
      type: "PROMO",
      titleEn: c.titleEn,
      titleHi: c.titleHi,
      bodyEn: c.bodyEn ?? undefined,
      bodyHi: c.bodyHi ?? undefined,
      href: c.href ?? undefined,
      imageUrl: c.imageUrl ?? undefined,
      dedupeKey: `campaign:${c.id}`,
    });
    if (r.created) count++;
  }
  await db.campaign.update({ where: { id: campaignId }, data: { status: "SENT", sentAt: new Date(), sentCount: count } });
  return count;
}

export async function sendCampaignNowAction(campaignId: string): Promise<Result> {
  const admin = await requireAdmin();
  const c = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!c) return { ok: false, error: "admin.errNotFound" };
  if (c.status === "SENT") return { ok: false, error: "admin.errAlreadySent" };
  const count = await deliverCampaign(campaignId);
  await audit(admin.id, "campaign.send", "Campaign", campaignId, { count });
  revalidatePath("/admin/notifications");
  return { ok: true, count };
}

export async function deleteCampaignAction(campaignId: string): Promise<Result> {
  const admin = await requireAdmin();
  await db.campaign.delete({ where: { id: campaignId } }).catch(() => null);
  await audit(admin.id, "campaign.delete", "Campaign", campaignId);
  revalidatePath("/admin/notifications");
  return { ok: true };
}

/** Runs festival + booking reminders and scheduled campaigns right now. */
export async function runRemindersAction(): Promise<Result> {
  const admin = await requireAdmin();
  const res = await runAllReminders();
  const summary = `festival ${res.festival.sent}/${res.festival.festivals} · bookings ${res.booking.sent}/${res.booking.bookings} · campaigns ${res.campaigns.sent}/${res.campaigns.campaigns}`;
  await db.setting.upsert({
    where: { key: REMINDERS_LAST_RUN_KEY },
    create: { key: REMINDERS_LAST_RUN_KEY, value: `${res.ranAt} — ${summary}` },
    update: { value: `${res.ranAt} — ${summary}` },
  });
  await audit(admin.id, "reminders.run", "Setting", REMINDERS_LAST_RUN_KEY, res);
  revalidatePath("/admin/notifications");
  revalidatePath("/admin");
  return { ok: true, summary, count: res.festival.sent + res.booking.sent + res.campaigns.sent };
}

/** Sends a sample notification to the signed-in admin (push + in-app). */
export async function sendTestNotificationAction(): Promise<Result> {
  const admin = await requireAdmin();
  await notifyUser({
    userId: admin.id,
    type: "SYSTEM",
    titleEn: "Test notification 🔔",
    titleHi: "परीक्षण सूचना 🔔",
    bodyEn: "If you can see this, in-app notifications are working.",
    bodyHi: "यदि यह दिख रहा है, तो सूचनाएँ ठीक काम कर रही हैं।",
    href: "/notifications",
    dedupeKey: `test:${Date.now()}`,
  });
  await audit(admin.id, "notification.test", "User", admin.id);
  revalidatePath("/admin/notifications");
  return { ok: true };
}
