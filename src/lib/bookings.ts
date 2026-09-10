import "server-only";
import type { BookingStatus } from "@prisma/client";
import { db } from "./db";
import { notifyUser } from "./notify";
import { audit } from "./auth";

/**
 * Single place for booking status transitions so devotee app, pandit portal and admin console
 * all behave the same: validates the transition, appends a BookingEvent, notifies the devotee
 * (and pandit), updates counters.
 */
const ALLOWED: Record<BookingStatus, BookingStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED", "FAILED"],
  CONFIRMED: ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REFUNDED"],
  ASSIGNED: ["IN_PROGRESS", "COMPLETED", "CANCELLED", "REFUNDED", "CONFIRMED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: ["REFUNDED"],
  REFUNDED: [],
  FAILED: ["PENDING_PAYMENT", "CANCELLED"],
};

const STATUS_TEXT: Record<BookingStatus, { en: string; hi: string }> = {
  PENDING_PAYMENT: { en: "Payment pending", hi: "भुगतान लंबित" },
  CONFIRMED: { en: "Booking confirmed", hi: "बुकिंग पुष्ट" },
  ASSIGNED: { en: "Pandit ji assigned", hi: "पंडित जी नियुक्त" },
  IN_PROGRESS: { en: "Pooja has started", hi: "पूजा आरंभ हो गई" },
  COMPLETED: { en: "Pooja completed 🙏", hi: "पूजा सम्पन्न 🙏" },
  CANCELLED: { en: "Booking cancelled", hi: "बुकिंग रद्द" },
  REFUNDED: { en: "Refund processed", hi: "धनवापसी पूर्ण" },
  FAILED: { en: "Payment failed", hi: "भुगतान असफल" },
};

export type TransitionOpts = {
  actorId?: string | null;
  actorRole: "USER" | "PANDIT" | "ADMIN" | "SYSTEM";
  note?: string;
  panditId?: string | null;
  liveLink?: string | null;
  videoUrl?: string | null;
  photos?: string[];
  panditNote?: string;
  adminNote?: string;
  cancelReason?: string;
};

export async function transitionBooking(bookingId: string, to: BookingStatus, opts: TransitionOpts) {
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId }, include: { service: true, pandit: true } });
  if (booking.status !== to && !ALLOWED[booking.status].includes(to)) {
    return { ok: false as const, error: `Cannot move from ${booking.status} to ${to}` };
  }

  const data: Record<string, unknown> = { status: to };
  if (opts.panditId !== undefined) data.panditId = opts.panditId;
  if (opts.liveLink !== undefined) data.liveLink = opts.liveLink;
  if (opts.videoUrl !== undefined) data.videoUrl = opts.videoUrl;
  if (opts.photos) data.photos = JSON.stringify(opts.photos);
  if (opts.panditNote !== undefined) data.panditNote = opts.panditNote;
  if (opts.adminNote !== undefined) data.adminNote = opts.adminNote;
  if (opts.cancelReason !== undefined) data.cancelReason = opts.cancelReason;
  if (to === "COMPLETED") data.completedAt = new Date();

  const updated = await db.booking.update({ where: { id: bookingId }, data, include: { pandit: true, service: true } });
  await db.bookingEvent.create({ data: { bookingId, status: to, note: opts.note ?? opts.cancelReason, actorRole: opts.actorRole } });

  if (to === "COMPLETED" && updated.panditId) {
    await db.panditProfile.update({ where: { id: updated.panditId }, data: { completedCount: { increment: 1 } } });
  }

  const txt = STATUS_TEXT[to];
  await notifyUser({
    userId: updated.userId,
    type: "BOOKING_UPDATE",
    titleEn: `${txt.en} · ${updated.service.nameEn}`,
    titleHi: `${txt.hi} · ${updated.service.nameHi}`,
    bodyEn: to === "COMPLETED" && updated.videoUrl ? "Your pooja video is ready to watch." : opts.note ?? `Booking ${updated.code}`,
    bodyHi: to === "COMPLETED" && updated.videoUrl ? "आपकी पूजा का वीडियो तैयार है।" : opts.note ?? `बुकिंग ${updated.code}`,
    href: `/bookings/${updated.id}`,
  });

  // Newly assigned pandit gets a heads-up
  if (to === "ASSIGNED" && updated.pandit && updated.pandit.id !== booking.panditId) {
    await notifyUser({
      userId: updated.pandit.userId,
      type: "BOOKING_UPDATE",
      titleEn: `New booking assigned · ${updated.service.nameEn}`,
      titleHi: `नई बुकिंग सौंपी गई · ${updated.service.nameHi}`,
      bodyEn: `${updated.scheduledDate}${updated.scheduledSlot ? " " + updated.scheduledSlot : ""} · ${updated.code}`,
      bodyHi: `${updated.scheduledDate}${updated.scheduledSlot ? " " + updated.scheduledSlot : ""} · ${updated.code}`,
      href: `/pandit/bookings/${updated.id}`,
    });
  }

  await audit(opts.actorId ?? null, `booking.${to.toLowerCase()}`, "Booking", bookingId, { from: booking.status, note: opts.note });
  return { ok: true as const, booking: updated };
}

/** Auto-assign: first verified, active pandit offering this service (prefer same city, highest rating). */
export async function autoAssignPandit(bookingId: string) {
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId }, include: { service: true } });
  if (booking.panditId || !booking.service.requiresPandit) return null;
  const candidates = await db.panditService.findMany({
    where: { serviceId: booking.serviceId, active: true, pandit: { verified: true, isActive: true, kycStatus: "APPROVED" } },
    include: { pandit: true },
  });
  if (!candidates.length) return null;
  const sorted = candidates.sort((a, c) => {
    const cityA = a.pandit.city && booking.city && a.pandit.city.toLowerCase() === booking.city.toLowerCase() ? 1 : 0;
    const cityC = c.pandit.city && booking.city && c.pandit.city.toLowerCase() === booking.city.toLowerCase() ? 1 : 0;
    if (cityA !== cityC) return cityC - cityA;
    return c.pandit.ratingAvg - a.pandit.ratingAvg;
  });
  const chosen = sorted[0].pandit;
  await transitionBooking(bookingId, "ASSIGNED", { actorRole: "SYSTEM", panditId: chosen.id, note: `Auto-assigned to ${chosen.displayName}` });
  return chosen;
}

/** Recompute a pandit's rating after a review is created/approved. */
export async function recomputePanditRating(panditId: string) {
  const agg = await db.review.aggregate({ where: { panditId, approved: true }, _avg: { rating: true }, _count: { rating: true } });
  await db.panditProfile.update({ where: { id: panditId }, data: { ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count.rating } });
}

export async function recomputeServiceRating(serviceId: string) {
  const agg = await db.review.aggregate({ where: { serviceId, approved: true }, _avg: { rating: true }, _count: { rating: true } });
  if (agg._count.rating > 0) {
    await db.service.update({ where: { id: serviceId }, data: { ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count.rating } });
  }
}
