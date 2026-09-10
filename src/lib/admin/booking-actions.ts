"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { BookingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";
import { autoAssignPandit, transitionBooking } from "@/lib/bookings";
import { markPaid, refundBooking } from "@/lib/payments";

export type Result = { ok: boolean; error?: string };

const STATUSES = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  "FAILED",
] as const;

function touch(id: string) {
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin");
}

/** Assign (or clear) the pandit for a booking. Moves CONFIRMED → ASSIGNED. */
export async function assignPanditAction(bookingId: string, panditId: string | null, note?: string): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.object({ bookingId: z.string().min(1), panditId: z.string().min(1).nullable() }).safeParse({ bookingId, panditId });
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { ok: false, error: "admin.errNotFound" };

  if (!panditId) {
    await db.booking.update({ where: { id: bookingId }, data: { panditId: null } });
    await db.bookingEvent.create({ data: { bookingId, status: booking.status, note: note ?? "Pandit unassigned", actorRole: "ADMIN" } });
    await audit(admin.id, "booking.unassign", "Booking", bookingId, { previous: booking.panditId });
    touch(bookingId);
    return { ok: true };
  }

  const pandit = await db.panditProfile.findUnique({ where: { id: panditId } });
  if (!pandit) return { ok: false, error: "admin.errNotFound" };

  const target: BookingStatus = booking.status === "PENDING_PAYMENT" || booking.status === "FAILED" ? booking.status : "ASSIGNED";
  if (target === "ASSIGNED") {
    const res = await transitionBooking(bookingId, "ASSIGNED", {
      actorId: admin.id,
      actorRole: "ADMIN",
      panditId,
      note: note ?? `Assigned to ${pandit.displayName}`,
    });
    if (!res.ok) return { ok: false, error: res.error };
  } else {
    await db.booking.update({ where: { id: bookingId }, data: { panditId } });
    await db.bookingEvent.create({ data: { bookingId, status: booking.status, note: `Pre-assigned to ${pandit.displayName}`, actorRole: "ADMIN" } });
  }
  await audit(admin.id, "booking.assign", "Booking", bookingId, { panditId, note });
  touch(bookingId);
  return { ok: true };
}

/** Picks the best eligible pandit automatically (same city first, then rating). */
export async function autoAssignAction(bookingId: string): Promise<Result> {
  const admin = await requireAdmin();
  const chosen = await autoAssignPandit(bookingId);
  if (!chosen) return { ok: false, error: "admin.errNoEligiblePandit" };
  await audit(admin.id, "booking.auto_assign", "Booking", bookingId, { panditId: chosen.id });
  touch(bookingId);
  return { ok: true };
}

/** Status transition through the shared state machine. */
export async function transitionBookingAction(bookingId: string, status: string, note?: string): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.object({ status: z.enum(STATUSES), note: z.string().max(500).optional() }).safeParse({ status, note });
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };

  const res = await transitionBooking(bookingId, parsed.data.status, {
    actorId: admin.id,
    actorRole: "ADMIN",
    note: parsed.data.note,
    ...(parsed.data.status === "CANCELLED" ? { cancelReason: parsed.data.note ?? "Cancelled by admin" } : {}),
  });
  if (!res.ok) return { ok: false, error: res.error };
  touch(bookingId);
  return { ok: true };
}

const mediaSchema = z.object({
  liveLink: z.string().max(500).optional().nullable(),
  videoUrl: z.string().max(500).optional().nullable(),
  photos: z.array(z.string().max(500)).max(12).optional(),
  adminNote: z.string().max(2000).optional().nullable(),
});

/** Live link, recording, pooja photos and the internal admin note. */
export async function updateBookingMediaAction(bookingId: string, input: z.input<typeof mediaSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = mediaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  const { liveLink, videoUrl, photos, adminNote } = parsed.data;

  await db.booking.update({
    where: { id: bookingId },
    data: {
      liveLink: liveLink || null,
      videoUrl: videoUrl || null,
      adminNote: adminNote || null,
      ...(photos ? { photos: JSON.stringify(photos) } : {}),
    },
  });
  await audit(admin.id, "booking.media", "Booking", bookingId, { liveLink, videoUrl, photos: photos?.length ?? 0 });
  touch(bookingId);
  return { ok: true };
}

/** Refund a paid booking (or cancel an unpaid one) with a reason. */
export async function refundBookingAction(bookingId: string, reason: string): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.string().min(3).max(300).safeParse(reason);
  if (!parsed.success) return { ok: false, error: "admin.errReasonRequired" };
  await refundBooking(bookingId, parsed.data, "ADMIN");
  await audit(admin.id, "booking.refund", "Booking", bookingId, { reason: parsed.data });
  touch(bookingId);
  revalidatePath("/admin/payments");
  return { ok: true };
}

/** Records an offline payment (cash / bank transfer) and confirms the booking. */
export async function markPaidManuallyAction(bookingId: string, reference?: string): Promise<Result> {
  const admin = await requireAdmin();
  const booking = await db.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
  if (!booking) return { ok: false, error: "admin.errNotFound" };
  if (booking.payment?.status === "PAID") return { ok: false, error: "admin.errAlreadyPaid" };

  const payment =
    booking.payment ??
    (await db.payment.create({
      data: { bookingId, provider: "manual", amount: booking.amountTotal, currency: booking.currency, status: "PENDING" },
    }));

  await markPaid(payment.id, { method: "manual", providerPaymentId: reference || `manual_${payment.id.slice(-8)}`, raw: { by: admin.id, reference } });
  await audit(admin.id, "payment.manual_paid", "Payment", payment.id, { bookingId, reference });
  touch(bookingId);
  revalidatePath("/admin/payments");
  return { ok: true };
}
