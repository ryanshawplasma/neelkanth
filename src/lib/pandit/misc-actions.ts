"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentPanditUser, done, ERR, fail, type Result } from "./guard";

/** Mark one in-app notification as read (only the pandit's own). */
export async function markNotificationReadAction(id: string): Promise<Result> {
  const user = await currentPanditUser();
  if (!user) return fail(ERR.auth);
  const row = await db.notification.findUnique({ where: { id }, select: { userId: true } });
  if (!row || row.userId !== user.id) return fail(ERR.notFound);
  await db.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/pandit/notifications");
  revalidatePath("/pandit/dashboard");
  return done();
}

/** Mark every unread notification as read. */
export async function markAllNotificationsReadAction(): Promise<Result> {
  const user = await currentPanditUser();
  if (!user) return fail(ERR.auth);
  await db.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  revalidatePath("/pandit/notifications");
  revalidatePath("/pandit/dashboard");
  return done();
}
