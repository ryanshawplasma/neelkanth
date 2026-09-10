"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";
import { formatDateTime } from "@/lib/utils";

export type Result = { ok: boolean; error?: string };

const consultSchema = z.object({
  panditId: z.string().optional().nullable(),
  mode: z.enum(["chat", "call", "video"]).optional(),
  scheduledAt: z.string().max(40).optional().default(""),
  meetingLink: z.string().max(400).optional().default(""),
  answer: z.string().max(6000).optional().default(""),
  status: z.enum(["REQUESTED", "SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
});

/**
 * Assign a jyotishi, set the mode/slot/meeting link, write the answer and move
 * the consultation forward. The devotee is notified on every status change.
 */
export async function updateConsultationAction(id: string, input: z.input<typeof consultSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = consultSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  const d = parsed.data;

  const consult = await db.consultation.findUnique({ where: { id }, include: { user: true } });
  if (!consult) return { ok: false, error: "admin.errNotFound" };

  const when = d.scheduledAt ? new Date(d.scheduledAt) : null;
  if (d.scheduledAt && (!when || Number.isNaN(when.getTime()))) return { ok: false, error: "admin.errInvalidInput" };
  if (d.panditId) {
    const pandit = await db.panditProfile.findUnique({ where: { id: d.panditId } });
    if (!pandit) return { ok: false, error: "admin.errNotFound" };
  }

  const status = d.status ?? (d.panditId && consult.status === "REQUESTED" ? "SCHEDULED" : consult.status);
  const updated = await db.consultation.update({
    where: { id },
    data: {
      panditId: d.panditId === undefined ? consult.panditId : d.panditId || null,
      mode: d.mode ?? consult.mode,
      scheduledAt: d.scheduledAt ? when : consult.scheduledAt,
      meetingLink: d.meetingLink || null,
      answer: d.answer || null,
      status,
    },
    include: { pandit: true },
  });

  if (status !== consult.status || d.panditId) {
    const titles: Record<string, { en: string; hi: string }> = {
      REQUESTED: { en: "Consultation received", hi: "परामर्श अनुरोध प्राप्त" },
      SCHEDULED: { en: "Consultation scheduled", hi: "परामर्श निर्धारित" },
      COMPLETED: { en: "Consultation completed", hi: "परामर्श पूर्ण" },
      CANCELLED: { en: "Consultation cancelled", hi: "परामर्श रद्द" },
    };
    const txt = titles[status] ?? titles.REQUESTED;
    const slot = updated.scheduledAt ? formatDateTime(updated.scheduledAt) : "";
    await notifyUser({
      userId: consult.userId,
      type: "SYSTEM",
      titleEn: txt.en,
      titleHi: txt.hi,
      bodyEn: [updated.pandit?.displayName, slot].filter(Boolean).join(" · ") || undefined,
      bodyHi: [updated.pandit?.displayNameHi ?? updated.pandit?.displayName, slot].filter(Boolean).join(" · ") || undefined,
      href: "/consult/my",
    });
  }

  await audit(admin.id, "consultation.update", "Consultation", id, { status, panditId: d.panditId });
  revalidatePath("/admin/consultations");
  revalidatePath("/admin");
  return { ok: true };
}
