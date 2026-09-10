"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { markFailed, markPaid } from "@/lib/payments";
import type { ActionResult } from "@/lib/auth-actions";

async function ownPayment(paymentId: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  const payment = await db.payment.findFirst({ where: { id: paymentId, booking: { userId: user.id } }, include: { booking: { select: { id: true } } } });
  return payment;
}

/** Mock gateway "Pay" button. */
export async function payNowAction(paymentId: string, method: string): Promise<ActionResult> {
  const payment = await ownPayment(paymentId);
  if (!payment) return { ok: false, error: "notFound" };
  if (payment.status === "PAID") redirect(`/bookings/${payment.bookingId}?paid=1`);
  await markPaid(paymentId, { method });
  revalidatePath("/bookings");
  redirect(`/bookings/${payment.bookingId}?paid=1`);
}

/** "Simulate failure" link on the mock gateway. */
export async function failPaymentAction(paymentId: string): Promise<ActionResult> {
  const payment = await ownPayment(paymentId);
  if (!payment) return { ok: false, error: "notFound" };
  await markFailed(paymentId, "Simulated failure from the mock gateway");
  revalidatePath("/bookings");
  redirect(`/bookings/${payment.bookingId}?failed=1`);
}

/** Razorpay success handler — called from the checkout.js callback. */
export async function confirmRazorpayAction(paymentId: string, providerPaymentId: string): Promise<ActionResult<{ bookingId: string }>> {
  const payment = await ownPayment(paymentId);
  if (!payment) return { ok: false, error: "notFound" };
  await markPaid(paymentId, { method: "razorpay", providerPaymentId });
  revalidatePath("/bookings");
  return { ok: true, data: { bookingId: payment.bookingId } };
}
