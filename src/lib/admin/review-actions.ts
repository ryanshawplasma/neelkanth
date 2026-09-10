"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";
import { recomputePanditRating, recomputeServiceRating } from "@/lib/bookings";

export type Result = { ok: boolean; error?: string };

async function recompute(serviceId: string, panditId: string | null) {
  await recomputeServiceRating(serviceId);
  if (panditId) await recomputePanditRating(panditId);
}

/** Approving / un-approving a review recomputes service and pandit ratings. */
export async function setReviewApprovedAction(id: string, approved: boolean): Promise<Result> {
  const admin = await requireAdmin();
  const review = await db.review.findUnique({ where: { id } });
  if (!review) return { ok: false, error: "admin.errNotFound" };

  await db.review.update({ where: { id }, data: { approved } });
  await recompute(review.serviceId, review.panditId);
  await audit(admin.id, approved ? "review.approve" : "review.unapprove", "Review", id, { rating: review.rating });
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function deleteReviewAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  const review = await db.review.findUnique({ where: { id } });
  if (!review) return { ok: false, error: "admin.errNotFound" };

  await db.review.delete({ where: { id } });
  await recompute(review.serviceId, review.panditId);
  await audit(admin.id, "review.delete", "Review", id, { bookingId: review.bookingId, rating: review.rating });
  revalidatePath("/admin/reviews");
  return { ok: true };
}
