"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit, getCurrentUser } from "@/lib/auth";
import { createPaymentForBooking, refundBooking } from "@/lib/payments";
import { recomputePanditRating, recomputeServiceRating } from "@/lib/bookings";
import { generateBookingCode, toDateKey, toJson, addDays } from "@/lib/utils";
import type { ActionResult } from "@/lib/auth-actions";
import { getLaunchScope, isAddressInScope, isServiceInScope } from "./launch";

const devoteeSchema = z.object({
  name: z.string().trim().min(2).max(60),
  gotra: z.string().trim().max(40).optional(),
  relation: z.string().trim().max(30).optional(),
});

const bookingSchema = z.object({
  serviceSlug: z.string().min(1),
  packageSlug: z.string().optional(),
  addonSlugs: z.array(z.string()).default([]),
  devotees: z.array(devoteeSchema).min(1).max(20),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduledSlot: z.string().optional(),
  sankalpNote: z.string().trim().max(500).optional(),
  couponCode: z.string().trim().max(30).optional(),
  addressLine: z.string().trim().max(200).optional(),
  city: z.string().trim().max(60).optional(),
  state: z.string().trim().max(60).optional(),
  pincode: z.string().trim().max(10).optional(),
  prasadDelivery: z.boolean().default(false),
  panditId: z.string().optional(),
});

export type CreateBookingInput = z.input<typeof bookingSchema>;

/** Validates a coupon against a subtotal. Used live in checkout and again at booking creation. */
export async function validateCouponAction(code: string, subtotal: number): Promise<ActionResult<{ code: string; discount: number; descriptionEn?: string; descriptionHi?: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const res = await computeCoupon(code, subtotal);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, data: { code: res.coupon.code, discount: res.discount, descriptionEn: res.coupon.descriptionEn ?? undefined, descriptionHi: res.coupon.descriptionHi ?? undefined } };
}

async function computeCoupon(code: string, subtotal: number) {
  const clean = code.trim().toUpperCase();
  if (!clean) return { ok: false as const, error: "couponInvalid" as const };
  const coupon = await db.coupon.findUnique({ where: { code: clean } });
  const today = toDateKey();
  if (!coupon || !coupon.active) return { ok: false as const, error: "couponInvalid" as const };
  if (coupon.validFrom && today < coupon.validFrom) return { ok: false as const, error: "couponNotStarted" as const };
  if (coupon.validTo && today > coupon.validTo) return { ok: false as const, error: "couponExpired" as const };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { ok: false as const, error: "couponExhausted" as const };
  if (subtotal < coupon.minAmount) return { ok: false as const, error: "couponMinAmount" as const };
  const pct = coupon.discountPct ? Math.floor((subtotal * coupon.discountPct) / 100) : 0;
  const flat = coupon.discountFlat ?? 0;
  const discount = Math.min(subtotal, Math.max(pct, flat));
  if (discount <= 0) return { ok: false as const, error: "couponInvalid" as const };
  return { ok: true as const, coupon, discount };
}

/**
 * Creates a PENDING_PAYMENT booking, its first timeline event and a Payment,
 * then redirects to the payment page. Re-checks everything server-side.
 */
export async function createBookingAction(input: CreateBookingInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalidInput" };
  const v = parsed.data;

  const service = await db.service.findFirst({ where: { slug: v.serviceSlug, active: true }, include: { packages: true, addons: true } });
  if (!service) return { ok: false, error: "serviceNotFound" };
  const scope = await getLaunchScope();
  if (!isServiceInScope(scope, service.templeId)) return { ok: false, error: "notAvailableInCity" };

  const pkg = v.packageSlug ? service.packages.find((p) => p.slug === v.packageSlug) : service.packages[0];
  if (service.packages.length > 0 && !pkg) return { ok: false, error: "packageNotFound" };

  const maxDevotees = pkg?.maxDevotees ?? 4;
  if (v.devotees.length > maxDevotees) return { ok: false, error: "tooManyDevotees" };

  // Date must be today or later, and inside the service availability window.
  const today = toDateKey();
  if (v.scheduledDate < today) return { ok: false, error: "dateInPast" };
  if (service.availableFrom && v.scheduledDate < service.availableFrom) return { ok: false, error: "dateOutOfRange" };
  if (service.availableTo && v.scheduledDate > service.availableTo) return { ok: false, error: "dateOutOfRange" };

  const slots = safeArray(service.slots);
  if (slots.length > 0 && v.scheduledSlot && !slots.includes(v.scheduledSlot)) return { ok: false, error: "invalidSlot" };
  if (slots.length > 0 && !v.scheduledSlot) return { ok: false, error: "slotRequired" };

  const needsAddress = service.type === "PANDIT_AT_HOME" || service.type === "PRASAD" || v.prasadDelivery;
  if (needsAddress && (!v.addressLine || !v.city || !v.pincode)) return { ok: false, error: "addressRequired" };
  if (needsAddress && !isAddressInScope(scope, v.city)) return { ok: false, error: "serviceAreaOnly" };

  const addons = service.addons.filter((a) => v.addonSlugs.includes(a.slug));
  const amountBase = pkg?.price ?? service.basePrice;
  const amountAddons = addons.reduce((s, a) => s + a.price, 0);
  const subtotal = amountBase + amountAddons;

  let amountDiscount = 0;
  let couponCode: string | null = null;
  let couponId: string | null = null;
  if (v.couponCode?.trim()) {
    const res = await computeCoupon(v.couponCode, subtotal);
    if (!res.ok) return { ok: false, error: res.error };
    amountDiscount = res.discount;
    couponCode = res.coupon.code;
    couponId = res.coupon.id;
  }

  // Preassigned pandit (from /pandits/[id] → "Book for home pooja")
  let panditId: string | null = null;
  if (v.panditId) {
    const p = await db.panditProfile.findFirst({ where: { id: v.panditId, isActive: true, kycStatus: "APPROVED" }, select: { id: true } });
    panditId = p?.id ?? null;
  }

  const booking = await db.booking.create({
    data: {
      code: generateBookingCode(),
      userId: user.id,
      serviceId: service.id,
      packageId: pkg?.id ?? null,
      panditId,
      templeId: service.templeId,
      type: service.type,
      status: "PENDING_PAYMENT",
      scheduledDate: v.scheduledDate,
      scheduledSlot: v.scheduledSlot ?? null,
      devotees: toJson(v.devotees.map((d) => ({ name: d.name, gotra: d.gotra || "Kashyap", relation: d.relation ?? null }))),
      sankalpNote: v.sankalpNote || null,
      addons: toJson(addons.map((a) => ({ slug: a.slug, nameEn: a.nameEn, nameHi: a.nameHi, price: a.price }))),
      addressLine: v.addressLine || null,
      city: v.city || null,
      state: v.state || null,
      pincode: v.pincode || null,
      prasadDelivery: v.prasadDelivery,
      amountBase,
      amountAddons,
      amountDiscount,
      amountTotal: Math.max(0, subtotal - amountDiscount),
      couponCode,
    },
  });

  await db.bookingEvent.create({ data: { bookingId: booking.id, status: "PENDING_PAYMENT", note: "Booking created", actorRole: "USER" } });
  if (couponId) await db.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
  await audit(user.id, "booking.create", "Booking", booking.id, { service: service.slug, amount: booking.amountTotal });

  const payment = await createPaymentForBooking(booking.id);
  revalidatePath("/bookings");
  redirect(payment.redirectUrl);
}

/** Re-opens payment for a FAILED / PENDING_PAYMENT booking. */
export async function retryPaymentAction(bookingId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const booking = await db.booking.findFirst({ where: { id: bookingId, userId: user.id } });
  if (!booking) return { ok: false, error: "notFound" };
  if (!["FAILED", "PENDING_PAYMENT"].includes(booking.status)) return { ok: false, error: "notPayable" };
  if (booking.status === "FAILED") {
    await db.booking.update({ where: { id: booking.id }, data: { status: "PENDING_PAYMENT" } });
    await db.bookingEvent.create({ data: { bookingId: booking.id, status: "PENDING_PAYMENT", note: "Retrying payment", actorRole: "USER" } });
  }
  const payment = await createPaymentForBooking(booking.id);
  redirect(payment.redirectUrl);
}

export async function cancelBookingAction(bookingId: string, reason: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const booking = await db.booking.findFirst({ where: { id: bookingId, userId: user.id } });
  if (!booking) return { ok: false, error: "notFound" };
  if (!["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED"].includes(booking.status)) return { ok: false, error: "cannotCancel" };
  if (booking.scheduledDate < toDateKey(addDays(new Date(), 1))) return { ok: false, error: "cancelTooLate" };

  await refundBooking(bookingId, reason.trim() || "Cancelled by devotee", "USER");
  await audit(user.id, "booking.cancel", "Booking", bookingId, { reason });
  revalidatePath("/bookings");
  revalidatePath(`/bookings/${bookingId}`);
  return { ok: true };
}

const reviewSchema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(600).optional() });

export async function submitReviewAction(bookingId: string, rating: number, comment?: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const parsed = reviewSchema.safeParse({ rating, comment });
  if (!parsed.success) return { ok: false, error: "invalidInput" };

  const booking = await db.booking.findFirst({ where: { id: bookingId, userId: user.id } });
  if (!booking) return { ok: false, error: "notFound" };
  if (booking.status !== "COMPLETED") return { ok: false, error: "notCompleted" };

  await db.review.upsert({
    where: { bookingId },
    create: { bookingId, userId: user.id, serviceId: booking.serviceId, panditId: booking.panditId, rating: parsed.data.rating, comment: parsed.data.comment || null },
    update: { rating: parsed.data.rating, comment: parsed.data.comment || null },
  });
  await recomputeServiceRating(booking.serviceId);
  if (booking.panditId) await recomputePanditRating(booking.panditId);
  await audit(user.id, "review.submit", "Booking", bookingId, { rating: parsed.data.rating });
  revalidatePath(`/bookings/${bookingId}`);
  return { ok: true };
}

function safeArray(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}
