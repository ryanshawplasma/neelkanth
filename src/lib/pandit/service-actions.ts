"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { currentPandit, done, ERR, fail, type Result } from "./guard";

/** Turn "I offer this service" on/off. */
export async function toggleServiceAction(serviceId: string, offer: boolean): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);

  const service = await db.service.findUnique({ where: { id: serviceId }, select: { id: true, requiresPandit: true, active: true } });
  if (!service || !service.requiresPandit || !service.active) return fail(ERR.notFound);

  if (offer) {
    await db.panditService.upsert({
      where: { panditId_serviceId: { panditId: ctx.pandit.id, serviceId } },
      create: { panditId: ctx.pandit.id, serviceId, active: true },
      update: { active: true },
    });
  } else {
    await db.panditService.deleteMany({ where: { panditId: ctx.pandit.id, serviceId } });
  }
  await audit(ctx.user.id, "pandit.service.toggle", "Service", serviceId, { offer });
  revalidatePath("/pandit/services");
  return done();
}

/** Optional price override (null / 0 clears it and falls back to the catalog price). */
export async function setServicePriceAction(serviceId: string, price: number | null): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);

  const existing = await db.panditService.findUnique({ where: { panditId_serviceId: { panditId: ctx.pandit.id, serviceId } } });
  if (!existing) return fail("pandit.errNotOffered");

  let value: number | null = null;
  if (price !== null && price !== undefined && Number.isFinite(price) && price > 0) {
    if (price < 51 || price > 500000) return fail("pandit.errPriceRange");
    value = Math.round(price);
  }
  await db.panditService.update({ where: { id: existing.id }, data: { price: value } });
  revalidatePath("/pandit/services");
  return done();
}
