"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { transitionBooking } from "@/lib/bookings";
import { notifyAdmins, notifyUser } from "@/lib/notify";
import { currentPandit, done, ERR, fail, type Result } from "./guard";
import { isUrl } from "./shared";

/** Loads a booking and proves it belongs to the signed-in pandit. */
async function ownBooking(bookingId: string) {
  const ctx = await currentPandit();
  if (!ctx) return { ok: false as const, error: ERR.auth as string };
  const booking = await db.booking.findUnique({ where: { id: bookingId }, include: { service: true } });
  if (!booking || booking.panditId !== ctx.pandit.id) return { ok: false as const, error: ERR.notFound as string };
  return { ok: true as const, ctx, booking };
}

function touch(id: string) {
  revalidatePath(`/pandit/bookings/${id}`);
  revalidatePath("/pandit/bookings");
  revalidatePath("/pandit/dashboard");
}

/** Attach / update the live-stream link without changing the booking status. */
export async function setLiveLinkAction(bookingId: string, liveLink: string): Promise<Result> {
  const r = await ownBooking(bookingId);
  if (!r.ok) return fail(r.error);
  const url = liveLink.trim();
  if (!isUrl(url)) return fail("pandit.errUrl");
  if (["COMPLETED", "CANCELLED", "REFUNDED", "FAILED"].includes(r.booking.status)) return fail("pandit.errBookingClosed");

  await db.booking.update({ where: { id: bookingId }, data: { liveLink: url } });
  await db.bookingEvent.create({
    data: { bookingId, status: r.booking.status, note: `Live link added: ${url}`, actorRole: "PANDIT" },
  });
  await notifyUser({
    userId: r.booking.userId,
    type: "BOOKING_UPDATE",
    titleEn: `Live link ready · ${r.booking.service.nameEn}`,
    titleHi: `लाइव लिंक तैयार · ${r.booking.service.nameHi}`,
    bodyEn: "Join the live pooja from your booking page.",
    bodyHi: "अपनी बुकिंग पृष्ठ से पूजा में लाइव जुड़ें।",
    href: `/bookings/${bookingId}`,
  });
  await audit(r.ctx.user.id, "pandit.booking.live_link", "Booking", bookingId, { liveLink: url });
  touch(bookingId);
  return done();
}

/** ASSIGNED / CONFIRMED → IN_PROGRESS */
export async function startPoojaAction(bookingId: string): Promise<Result> {
  const r = await ownBooking(bookingId);
  if (!r.ok) return fail(r.error);
  if (!["ASSIGNED", "CONFIRMED"].includes(r.booking.status)) return fail("pandit.errBadTransition");
  const res = await transitionBooking(bookingId, "IN_PROGRESS", { actorId: r.ctx.user.id, actorRole: "PANDIT", note: "Pooja started by pandit ji" });
  if (!res.ok) return fail("pandit.errBadTransition");
  touch(bookingId);
  return done();
}

/** → COMPLETED with video / photos / note. */
export async function completeBookingAction(
  bookingId: string,
  input: { videoUrl?: string; photos?: string[]; panditNote?: string },
): Promise<Result> {
  const r = await ownBooking(bookingId);
  if (!r.ok) return fail(r.error);
  if (!["ASSIGNED", "CONFIRMED", "IN_PROGRESS"].includes(r.booking.status)) return fail("pandit.errBadTransition");

  const videoUrl = input.videoUrl?.trim();
  if (videoUrl && !isUrl(videoUrl)) return fail("pandit.errUrl");
  const photos = (input.photos ?? []).filter(Boolean).slice(0, 8);
  if (!videoUrl && photos.length === 0) return fail("pandit.errProofRequired");

  const res = await transitionBooking(bookingId, "COMPLETED", {
    actorId: r.ctx.user.id,
    actorRole: "PANDIT",
    note: input.panditNote?.trim() || "Pooja completed",
    videoUrl: videoUrl || undefined,
    photos,
    panditNote: input.panditNote?.trim() || undefined,
  });
  if (!res.ok) return fail("pandit.errBadTransition");
  await audit(r.ctx.user.id, "pandit.booking.complete", "Booking", bookingId);
  touch(bookingId);
  revalidatePath("/pandit/earnings");
  return done();
}

/** Hand the booking back to the admin team for re-assignment. */
export async function cannotPerformAction(bookingId: string, reason: string): Promise<Result> {
  const r = await ownBooking(bookingId);
  if (!r.ok) return fail(r.error);
  const note = reason.trim();
  if (note.length < 5) return fail("pandit.errReasonShort");
  if (!["ASSIGNED", "CONFIRMED"].includes(r.booking.status)) return fail("pandit.errBadTransition");

  const res = await transitionBooking(bookingId, "CONFIRMED", {
    actorId: r.ctx.user.id,
    actorRole: "PANDIT",
    panditId: null,
    panditNote: note,
    note: `Pandit unavailable: ${note}`,
  });
  if (!res.ok) return fail("pandit.errBadTransition");

  await notifyAdmins({
    type: "BOOKING_UPDATE",
    titleEn: `Re-assign needed · ${r.booking.code}`,
    titleHi: `पुनः नियुक्ति आवश्यक · ${r.booking.code}`,
    bodyEn: `${r.ctx.pandit.displayName} cannot perform ${r.booking.service.nameEn} on ${r.booking.scheduledDate}. Reason: ${note}`,
    bodyHi: `${r.ctx.pandit.displayNameHi || r.ctx.pandit.displayName} ${r.booking.scheduledDate} को ${r.booking.service.nameHi} नहीं कर सकते। कारण: ${note}`,
    href: `/admin/bookings/${bookingId}`,
  });
  await audit(r.ctx.user.id, "pandit.booking.release", "Booking", bookingId, { reason: note });
  touch(bookingId);
  return done();
}
