"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";
import { formatINR } from "@/lib/utils";

export type Result = { ok: boolean; error?: string };

function touch(panditId?: string) {
  revalidatePath("/admin/pandits");
  if (panditId) revalidatePath(`/admin/pandits/${panditId}`);
  revalidatePath("/admin");
}

// ─────────────────────────── KYC ───────────────────────────

/** Approve / reject a single KYC document with an optional reviewer note. */
export async function reviewKycDocAction(docId: string, status: "APPROVED" | "REJECTED" | "PENDING", note?: string): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.object({ status: z.enum(["APPROVED", "REJECTED", "PENDING"]), note: z.string().max(500).optional() }).safeParse({ status, note });
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };

  const doc = await db.kycDocument.findUnique({ where: { id: docId } });
  if (!doc) return { ok: false, error: "admin.errNotFound" };
  if (parsed.data.status === "REJECTED" && !parsed.data.note?.trim()) return { ok: false, error: "admin.errNoteRequired" };

  await db.kycDocument.update({ where: { id: docId }, data: { status: parsed.data.status, note: parsed.data.note || null } });
  await audit(admin.id, `pandit.kyc.doc_${parsed.data.status.toLowerCase()}`, "KycDocument", docId, { panditId: doc.panditId, note: parsed.data.note });
  touch(doc.panditId);
  return { ok: true };
}

/** Overall KYC approval: marks the profile verified and notifies the pandit. */
export async function approveKycAction(panditId: string, note?: string): Promise<Result> {
  const admin = await requireAdmin();
  const pandit = await db.panditProfile.findUnique({ where: { id: panditId }, include: { user: true } });
  if (!pandit) return { ok: false, error: "admin.errNotFound" };

  await db.panditProfile.update({
    where: { id: panditId },
    data: { kycStatus: "APPROVED", verified: true, isActive: true, kycReviewedAt: new Date(), kycReviewNote: note?.trim() || null },
  });
  await db.user.update({ where: { id: pandit.userId }, data: { role: "PANDIT" } });
  await notifyUser({
    userId: pandit.userId,
    type: "KYC",
    titleEn: "KYC approved 🎉",
    titleHi: "केवाईसी स्वीकृत 🎉",
    bodyEn: "Your profile is verified. You can now receive bookings on DivyaDham.",
    bodyHi: "आपकी प्रोफ़ाइल सत्यापित हो गई है। अब आप दिव्यधाम पर बुकिंग प्राप्त कर सकते हैं।",
    href: "/pandit/dashboard",
  });
  await audit(admin.id, "pandit.kyc.approve", "PanditProfile", panditId, { note });
  touch(panditId);
  return { ok: true };
}

/** Rejects KYC. A reason is mandatory and is sent to the pandit. */
export async function rejectKycAction(panditId: string, note: string): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.string().min(5, "note").max(500).safeParse(note);
  if (!parsed.success) return { ok: false, error: "admin.errNoteRequired" };

  const pandit = await db.panditProfile.findUnique({ where: { id: panditId } });
  if (!pandit) return { ok: false, error: "admin.errNotFound" };

  await db.panditProfile.update({
    where: { id: panditId },
    data: { kycStatus: "REJECTED", verified: false, kycReviewedAt: new Date(), kycReviewNote: parsed.data },
  });
  await notifyUser({
    userId: pandit.userId,
    type: "KYC",
    titleEn: "KYC needs changes",
    titleHi: "केवाईसी में सुधार आवश्यक",
    bodyEn: parsed.data,
    bodyHi: parsed.data,
    href: "/pandit/kyc",
  });
  await audit(admin.id, "pandit.kyc.reject", "PanditProfile", panditId, { note: parsed.data });
  touch(panditId);
  return { ok: true };
}

// ─────────────────────────── Profile flags ───────────────────────────

const FLAGS = ["verified", "featured", "isActive"] as const;

export async function togglePanditFlagAction(panditId: string, flag: (typeof FLAGS)[number], value: boolean): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.object({ flag: z.enum(FLAGS), value: z.boolean() }).safeParse({ flag, value });
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  await db.panditProfile.update({ where: { id: panditId }, data: { [parsed.data.flag]: parsed.data.value } });
  await audit(admin.id, `pandit.flag.${parsed.data.flag}`, "PanditProfile", panditId, { value: parsed.data.value });
  touch(panditId);
  return { ok: true };
}

export async function setCommissionAction(panditId: string, pct: number): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.number().int().min(0).max(60).safeParse(pct);
  if (!parsed.success) return { ok: false, error: "admin.errCommissionRange" };
  await db.panditProfile.update({ where: { id: panditId }, data: { commissionPct: parsed.data } });
  await audit(admin.id, "pandit.commission", "PanditProfile", panditId, { pct: parsed.data });
  touch(panditId);
  return { ok: true };
}

// ─────────────────────────── Services offered ───────────────────────────

export async function togglePanditServiceAction(panditId: string, serviceId: string, active: boolean): Promise<Result> {
  const admin = await requireAdmin();
  const existing = await db.panditService.findUnique({ where: { panditId_serviceId: { panditId, serviceId } } });
  if (existing) {
    await db.panditService.update({ where: { id: existing.id }, data: { active } });
  } else if (active) {
    await db.panditService.create({ data: { panditId, serviceId, active: true } });
  }
  await audit(admin.id, "pandit.service.toggle", "PanditService", `${panditId}:${serviceId}`, { active });
  touch(panditId);
  return { ok: true };
}

export async function setPanditServicePriceAction(panditId: string, serviceId: string, price: number | null): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.number().int().min(0).max(1000000).nullable().safeParse(price);
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  const existing = await db.panditService.findUnique({ where: { panditId_serviceId: { panditId, serviceId } } });
  if (!existing) return { ok: false, error: "admin.errNotFound" };
  await db.panditService.update({ where: { id: existing.id }, data: { price: parsed.data } });
  await audit(admin.id, "pandit.service.price", "PanditService", existing.id, { price: parsed.data });
  touch(panditId);
  return { ok: true };
}

// ─────────────────────────── Payouts ───────────────────────────

const payoutSchema = z.object({
  amount: z.number().int().min(1).max(10000000),
  reference: z.string().max(120).optional(),
  note: z.string().max(300).optional(),
  status: z.enum(["PENDING", "PAID"]).default("PENDING"),
});

export async function createPayoutAction(panditId: string, input: z.input<typeof payoutSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = payoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "admin.errInvalidAmount" };

  const pandit = await db.panditProfile.findUnique({ where: { id: panditId } });
  if (!pandit) return { ok: false, error: "admin.errNotFound" };

  const payout = await db.payout.create({
    data: {
      panditId,
      amount: parsed.data.amount,
      reference: parsed.data.reference || null,
      note: parsed.data.note || null,
      status: parsed.data.status,
      paidAt: parsed.data.status === "PAID" ? new Date() : null,
    },
  });
  if (parsed.data.status === "PAID") {
    await notifyUser({
      userId: pandit.userId,
      type: "SYSTEM",
      titleEn: "Payout sent",
      titleHi: "भुगतान भेजा गया",
      bodyEn: `${formatINR(parsed.data.amount)} has been transferred${parsed.data.reference ? ` (ref ${parsed.data.reference})` : ""}.`,
      bodyHi: `${formatINR(parsed.data.amount, "hi")} भेज दिए गए हैं${parsed.data.reference ? ` (संदर्भ ${parsed.data.reference})` : ""}।`,
      href: "/pandit/earnings",
    });
  }
  await audit(admin.id, "payout.create", "Payout", payout.id, { panditId, ...parsed.data });
  touch(panditId);
  revalidatePath("/admin/payouts");
  return { ok: true };
}

export async function markPayoutPaidAction(payoutId: string, reference?: string): Promise<Result> {
  const admin = await requireAdmin();
  const payout = await db.payout.findUnique({ where: { id: payoutId }, include: { pandit: true } });
  if (!payout) return { ok: false, error: "admin.errNotFound" };
  if (payout.status === "PAID") return { ok: false, error: "admin.errAlreadyPaid" };

  await db.payout.update({ where: { id: payoutId }, data: { status: "PAID", paidAt: new Date(), reference: reference || payout.reference } });
  await notifyUser({
    userId: payout.pandit.userId,
    type: "SYSTEM",
    titleEn: "Payout sent",
    titleHi: "भुगतान भेजा गया",
    bodyEn: `${formatINR(payout.amount)} has been transferred${reference ? ` (ref ${reference})` : ""}.`,
    bodyHi: `${formatINR(payout.amount, "hi")} भेज दिए गए हैं${reference ? ` (संदर्भ ${reference})` : ""}।`,
    href: "/pandit/earnings",
  });
  await audit(admin.id, "payout.paid", "Payout", payoutId, { reference });
  touch(payout.panditId);
  revalidatePath("/admin/payouts");
  return { ok: true };
}

export async function deletePayoutAction(payoutId: string): Promise<Result> {
  const admin = await requireAdmin();
  const payout = await db.payout.findUnique({ where: { id: payoutId } });
  if (!payout) return { ok: false, error: "admin.errNotFound" };
  if (payout.status === "PAID") return { ok: false, error: "admin.errPayoutPaid" };
  await db.payout.delete({ where: { id: payoutId } });
  await audit(admin.id, "payout.delete", "Payout", payoutId, { panditId: payout.panditId, amount: payout.amount });
  touch(payout.panditId);
  revalidatePath("/admin/payouts");
  return { ok: true };
}
