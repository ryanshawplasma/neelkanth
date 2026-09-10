import "server-only";
import webpush from "web-push";
import type { NotificationType } from "@prisma/client";
import { db } from "./db";

let vapidReady = false;
function ensureVapid() {
  if (vapidReady) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:admin@divyadham.app", pub, priv);
  vapidReady = true;
  return true;
}

export type NotifyInput = {
  userId: string;
  type?: NotificationType;
  titleEn: string;
  titleHi: string;
  bodyEn?: string;
  bodyHi?: string;
  href?: string;
  imageUrl?: string;
  /** Same (userId, dedupeKey) is only ever created once — use for reminders. */
  dedupeKey?: string;
};

/** Creates an in-app notification and (best-effort) sends a web push to all of the user's devices. */
export async function notifyUser(input: NotifyInput) {
  const { userId, dedupeKey } = input;
  if (dedupeKey) {
    const exists = await db.notification.findUnique({ where: { userId_dedupeKey: { userId, dedupeKey } } });
    if (exists) return { created: false, id: exists.id };
  }
  const n = await db.notification.create({
    data: {
      userId,
      type: input.type ?? "SYSTEM",
      titleEn: input.titleEn,
      titleHi: input.titleHi,
      bodyEn: input.bodyEn,
      bodyHi: input.bodyHi,
      href: input.href,
      imageUrl: input.imageUrl,
      dedupeKey,
    },
  });
  const pushed = await sendPush(userId, n.id, input);
  if (pushed) await db.notification.update({ where: { id: n.id }, data: { pushed: true } });
  return { created: true, id: n.id };
}

export async function notifyMany(userIds: string[], input: Omit<NotifyInput, "userId">) {
  let count = 0;
  for (const userId of userIds) {
    const r = await notifyUser({ ...input, userId });
    if (r.created) count++;
  }
  return count;
}

async function sendPush(userId: string, notificationId: string, input: Omit<NotifyInput, "userId">) {
  if (!ensureVapid()) return false;
  const [subs, user] = await Promise.all([
    db.pushSubscription.findMany({ where: { userId } }),
    db.user.findUnique({ where: { id: userId }, select: { locale: true } }),
  ]);
  if (!subs.length) return false;
  const hi = user?.locale === "hi";
  const payload = JSON.stringify({
    id: notificationId,
    title: hi ? input.titleHi : input.titleEn,
    body: hi ? input.bodyHi ?? input.bodyEn : input.bodyEn ?? input.bodyHi,
    url: input.href ?? "/notifications",
    image: input.imageUrl,
  });
  let ok = false;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 24 });
      ok = true;
    } catch (e: unknown) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
    }
  }
  return ok;
}

/** Convenience: notify all admins (e.g. new KYC submission). */
export async function notifyAdmins(input: Omit<NotifyInput, "userId">) {
  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  return notifyMany(admins.map((a) => a.id), input);
}
