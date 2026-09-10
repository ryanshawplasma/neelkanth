"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { toDateKey } from "@/lib/utils";
import { currentPandit, done, ERR, fail, type Result } from "./guard";
import { DATE_KEY_RE, TIME_RE } from "./shared";

export type AvailabilitySlot = { weekday: number; startTime: string; endTime: string; enabled: boolean };

/** Replaces the whole weekly grid in one transaction. */
export async function saveAvailabilityAction(slots: AvailabilitySlot[]): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);

  const cleaned: AvailabilitySlot[] = [];
  for (const s of slots ?? []) {
    if (!Number.isInteger(s.weekday) || s.weekday < 0 || s.weekday > 6) return fail("pandit.errWeekday");
    if (!TIME_RE.test(s.startTime) || !TIME_RE.test(s.endTime)) return fail("pandit.errTime");
    if (s.startTime >= s.endTime) return fail("pandit.errTimeOrder");
    cleaned.push({ weekday: s.weekday, startTime: s.startTime, endTime: s.endTime, enabled: !!s.enabled });
  }
  if (cleaned.length > 60) return fail("pandit.errTooManySlots");

  // overlap check per weekday
  for (let d = 0; d < 7; d++) {
    const day = cleaned.filter((s) => s.weekday === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 1; i < day.length; i++) {
      if (day[i].startTime < day[i - 1].endTime) return fail("pandit.errOverlap");
    }
  }

  await db.$transaction([
    db.panditAvailability.deleteMany({ where: { panditId: ctx.pandit.id } }),
    ...(cleaned.length
      ? [db.panditAvailability.createMany({ data: cleaned.map((s) => ({ ...s, panditId: ctx.pandit.id })) })]
      : []),
  ]);
  await audit(ctx.user.id, "pandit.availability.save", "PanditProfile", ctx.pandit.id, { count: cleaned.length });
  revalidatePath("/pandit/availability");
  return done();
}

export async function addBlockedDateAction(date: string, reason?: string): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);
  const key = (date ?? "").trim();
  if (!DATE_KEY_RE.test(key)) return fail("pandit.errDate");
  if (key < toDateKey()) return fail("pandit.errDatePast");

  const exists = await db.panditBlockedDate.findFirst({ where: { panditId: ctx.pandit.id, date: key } });
  if (exists) return fail("pandit.errDateExists");

  await db.panditBlockedDate.create({ data: { panditId: ctx.pandit.id, date: key, reason: reason?.trim() || null } });
  revalidatePath("/pandit/availability");
  return done();
}

export async function removeBlockedDateAction(id: string): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);
  const row = await db.panditBlockedDate.findUnique({ where: { id } });
  if (!row || row.panditId !== ctx.pandit.id) return fail(ERR.notFound);
  await db.panditBlockedDate.delete({ where: { id } });
  revalidatePath("/pandit/availability");
  return done();
}
