import "server-only";
import { db } from "./db";
import { notifyUser } from "./notify";
import { formatINR } from "./utils";

/**
 * Payment provider abstraction.
 *  - mock:     redirects to the built-in simulator at /pay/[paymentId] (dev & demos)
 *  - razorpay: creates a Razorpay order and returns the checkout params (client opens Razorpay.js)
 */
export type ProviderName = "mock" | "razorpay";
export const paymentProvider = (): ProviderName => (process.env.PAYMENT_PROVIDER === "razorpay" && process.env.RAZORPAY_KEY_ID ? "razorpay" : "mock");

export async function createPaymentForBooking(bookingId: string) {
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId }, include: { payment: true } });
  const provider = paymentProvider();

  const payment =
    booking.payment ??
    (await db.payment.create({
      data: { bookingId, provider, amount: booking.amountTotal, currency: booking.currency, status: "CREATED" },
    }));

  if (provider === "razorpay") {
    const key = process.env.RAZORPAY_KEY_ID!;
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(`${key}:${secret}`).toString("base64"), "Content-Type": "application/json" },
      body: JSON.stringify({ amount: booking.amountTotal * 100, currency: "INR", receipt: booking.code, notes: { bookingId } }),
    });
    const order = (await res.json()) as { id: string };
    await db.payment.update({ where: { id: payment.id }, data: { orderId: order.id, status: "PENDING", provider: "razorpay" } });
    return { provider, paymentId: payment.id, redirectUrl: `/pay/${payment.id}`, razorpay: { key, orderId: order.id, amount: booking.amountTotal * 100 } };
  }

  await db.payment.update({ where: { id: payment.id }, data: { status: "PENDING", orderId: `mock_${payment.id}` } });
  return { provider, paymentId: payment.id, redirectUrl: `/pay/${payment.id}` };
}

/** Marks payment as paid and confirms booking. Safe to call twice. */
export async function markPaid(paymentId: string, opts: { method?: string; providerPaymentId?: string; raw?: unknown } = {}) {
  const payment = await db.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { booking: { include: { service: true, pandit: true } } } });
  if (payment.status === "PAID") return payment.booking;

  await db.$transaction([
    db.payment.update({
      where: { id: paymentId },
      data: { status: "PAID", method: opts.method, paymentId: opts.providerPaymentId ?? `pay_${paymentId.slice(-8)}`, raw: opts.raw ? JSON.stringify(opts.raw) : undefined },
    }),
    db.booking.update({ where: { id: payment.bookingId }, data: { status: payment.booking.panditId ? "ASSIGNED" : "CONFIRMED" } }),
    db.bookingEvent.create({ data: { bookingId: payment.bookingId, status: "CONFIRMED", note: "Payment received", actorRole: "SYSTEM" } }),
    db.service.update({ where: { id: payment.booking.serviceId }, data: { bookingCount: { increment: 1 } } }),
  ]);

  const b = payment.booking;
  await notifyUser({
    userId: b.userId,
    type: "BOOKING_UPDATE",
    titleEn: `Booking confirmed · ${b.service.nameEn}`,
    titleHi: `बुकिंग पुष्ट · ${b.service.nameHi}`,
    bodyEn: `${formatINR(b.amountTotal)} received. Scheduled for ${b.scheduledDate}${b.scheduledSlot ? " at " + b.scheduledSlot : ""}. Booking ${b.code}.`,
    bodyHi: `${formatINR(b.amountTotal, "hi")} प्राप्त हुए। ${b.scheduledDate}${b.scheduledSlot ? " " + b.scheduledSlot : ""} के लिए निर्धारित। बुकिंग ${b.code}।`,
    href: `/bookings/${b.id}`,
  });
  if (b.pandit) {
    await notifyUser({
      userId: b.pandit.userId,
      type: "BOOKING_UPDATE",
      titleEn: `New booking · ${b.service.nameEn}`,
      titleHi: `नई बुकिंग · ${b.service.nameHi}`,
      bodyEn: `${b.scheduledDate}${b.scheduledSlot ? " " + b.scheduledSlot : ""} · ${b.code}`,
      bodyHi: `${b.scheduledDate}${b.scheduledSlot ? " " + b.scheduledSlot : ""} · ${b.code}`,
      href: `/pandit/bookings/${b.id}`,
    });
  }
  return b;
}

export async function markFailed(paymentId: string, reason?: string) {
  const payment = await db.payment.findUniqueOrThrow({ where: { id: paymentId } });
  if (payment.status === "PAID") return;
  await db.$transaction([
    db.payment.update({ where: { id: paymentId }, data: { status: "FAILED", raw: reason ? JSON.stringify({ reason }) : undefined } }),
    db.booking.update({ where: { id: payment.bookingId }, data: { status: "FAILED" } }),
    db.bookingEvent.create({ data: { bookingId: payment.bookingId, status: "FAILED", note: reason ?? "Payment failed", actorRole: "SYSTEM" } }),
  ]);
}

export async function refundBooking(bookingId: string, reason: string, actorRole: "ADMIN" | "USER" = "ADMIN") {
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId }, include: { payment: true, service: true } });
  if (!booking.payment || booking.payment.status !== "PAID") {
    await db.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED", cancelReason: reason } });
    await db.bookingEvent.create({ data: { bookingId, status: "CANCELLED", note: reason, actorRole } });
    return;
  }
  // Razorpay refund hook could be called here with booking.payment.paymentId
  await db.$transaction([
    db.payment.update({ where: { id: booking.payment.id }, data: { status: "REFUNDED", refundedAt: new Date(), refundId: `rfnd_${booking.payment.id.slice(-8)}` } }),
    db.booking.update({ where: { id: bookingId }, data: { status: "REFUNDED", cancelReason: reason } }),
    db.bookingEvent.create({ data: { bookingId, status: "REFUNDED", note: reason, actorRole } }),
  ]);
  await notifyUser({
    userId: booking.userId,
    type: "BOOKING_UPDATE",
    titleEn: `Refund initiated · ${booking.service.nameEn}`,
    titleHi: `धनवापसी शुरू · ${booking.service.nameHi}`,
    bodyEn: `${formatINR(booking.amountTotal)} will be credited in 5–7 working days.`,
    bodyHi: `${formatINR(booking.amountTotal, "hi")} 5–7 कार्यदिवसों में वापस आ जाएँगे।`,
    href: `/bookings/${booking.id}`,
  });
}
