import "server-only";
import type { Prisma, SupportStatus } from "@prisma/client";
import { db } from "./db";
import { notifyAdmins, notifyUser } from "./notify";
import { formatPhone } from "./account-types";
import type { SupportMessageDTO, SupportThreadDTO } from "./support-types";

export const SUPPORT_MESSAGE_MAX = 2000;
/** Messages shown when a conversation opens; older ones load on demand. */
const PAGE_SIZE = 40;
/** Someone who had the conversation open this recently is watching it: skip the push. */
const WATCHING_MS = 25_000;
/** Avoid a DB write on every poll: refresh "seen" at most this often when nothing is unread. */
const SEEN_REFRESH_MS = 10_000;

const messageSelect = {
  id: true,
  body: true,
  fromAdmin: true,
  createdAt: true,
  sender: { select: { name: true } },
  booking: { select: { id: true, code: true, service: { select: { nameEn: true, nameHi: true } } } },
} satisfies Prisma.SupportMessageSelect;

type MessageRow = Prisma.SupportMessageGetPayload<{ select: typeof messageSelect }>;

/** `audience` = who is reading: customers never see which admin replied. */
function toDTO(m: MessageRow, audience: "user" | "admin"): SupportMessageDTO {
  return {
    id: m.id,
    body: m.body,
    fromAdmin: m.fromAdmin,
    senderName: audience === "admin" && m.fromAdmin ? (m.sender?.name ?? null) : null,
    createdAt: m.createdAt.toISOString(),
    booking: m.booking ? { id: m.booking.id, code: m.booking.code, nameEn: m.booking.service.nameEn, nameHi: m.booking.service.nameHi } : null,
  };
}

function threadDTO(t: { id: string; status: SupportStatus; userUnread: number; adminUnread: number }): SupportThreadDTO {
  return { id: t.id, status: t.status, userUnread: t.userUnread, adminUnread: t.adminUnread };
}

/** Trim, normalise newlines and enforce the length limit. Returns null when there is nothing to send. */
export function cleanSupportBody(raw: unknown) {
  if (typeof raw !== "string") return null;
  const body = raw.replace(/\r\n?/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim();
  if (!body || body.length > SUPPORT_MESSAGE_MAX) return null;
  return body;
}

export async function getSupportUnreadForUser(userId: string) {
  const t = await db.supportThread.findUnique({ where: { userId }, select: { userUnread: true } });
  return t?.userUnread ?? 0;
}

export async function getSupportThreadForUser(userId: string) {
  return db.supportThread.findUnique({ where: { userId } });
}

/**
 * Messages of a conversation, oldest first.
 * - `after`: everything created at/after that instant (polling; the client de-duplicates by id)
 * - `before`: the page of older messages just before that instant ("load earlier")
 * - neither: the latest page
 */
export async function listSupportMessages(
  threadId: string,
  audience: "user" | "admin",
  opts: { after?: Date | null; before?: Date | null } = {},
): Promise<{ messages: SupportMessageDTO[]; hasMore: boolean }> {
  if (opts.after) {
    const rows = await db.supportMessage.findMany({
      where: { threadId, createdAt: { gte: opts.after } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: 200,
      select: messageSelect,
    });
    return { messages: rows.map((m) => toDTO(m, audience)), hasMore: false };
  }
  const rows = await db.supportMessage.findMany({
    where: { threadId, ...(opts.before ? { createdAt: { lt: opts.before } } : {}) },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    select: messageSelect,
  });
  const hasMore = rows.length > PAGE_SIZE;
  return { messages: rows.slice(0, PAGE_SIZE).reverse().map((m) => toDTO(m, audience)), hasMore };
}

/**
 * The reader has the conversation on screen: clear their unread count, note that they are watching,
 * and mark the matching chat notifications as read so the bell count agrees.
 */
export async function markSupportSeen(
  thread: { id: string; userId: string; userUnread: number; adminUnread: number },
  side: "user" | "admin",
  viewerId: string,
) {
  const staleBefore = new Date(Date.now() - SEEN_REFRESH_MS);
  const now = new Date();
  if (side === "user") {
    await db.supportThread.updateMany({
      where: { id: thread.id, OR: [{ userUnread: { gt: 0 } }, { userSeenAt: null }, { userSeenAt: { lt: staleBefore } }] },
      data: { userUnread: 0, userSeenAt: now },
    });
    if (thread.userUnread > 0) {
      await db.notification.updateMany({ where: { userId: viewerId, type: "SUPPORT", read: false }, data: { read: true } });
    }
  } else {
    await db.supportThread.updateMany({
      where: { id: thread.id, OR: [{ adminUnread: { gt: 0 } }, { adminSeenAt: null }, { adminSeenAt: { lt: staleBefore } }] },
      data: { adminUnread: 0, adminSeenAt: now },
    });
    if (thread.adminUnread > 0) {
      await db.notification.updateMany({
        where: { type: "SUPPORT", read: false, href: `/admin/support/${thread.id}`, user: { role: "ADMIN" } },
        data: { read: true },
      });
    }
  }
}

export async function ensureSupportThread(userId: string) {
  return db.supportThread.upsert({ where: { userId }, create: { userId }, update: {} });
}

/**
 * Add a message to a customer's conversation (creating it on first contact) and update unread
 * counters. Returns the message plus a `notify` callback to run after the response is sent.
 */
export async function postSupportMessage(input: {
  customerId: string;
  senderId: string;
  fromAdmin: boolean;
  body: string;
  bookingId?: string | null;
}) {
  const before = await ensureSupportThread(input.customerId);

  let bookingId: string | null = null;
  if (input.bookingId) {
    const booking = await db.booking.findFirst({ where: { id: input.bookingId, userId: input.customerId }, select: { id: true } });
    bookingId = booking?.id ?? null;
  }

  const now = new Date();
  const preview = input.body.replace(/\s+/g, " ").slice(0, 140);
  const [message, thread] = await db.$transaction([
    db.supportMessage.create({
      data: { threadId: before.id, senderId: input.senderId, fromAdmin: input.fromAdmin, body: input.body, bookingId, createdAt: now },
      select: messageSelect,
    }),
    db.supportThread.update({
      where: { id: before.id },
      data: input.fromAdmin
        ? { lastMessageAt: now, lastMessagePreview: preview, lastFromAdmin: true, userUnread: { increment: 1 }, adminUnread: 0, adminSeenAt: now }
        : {
            lastMessageAt: now,
            lastMessagePreview: preview,
            lastFromAdmin: false,
            adminUnread: { increment: 1 },
            userUnread: 0,
            userSeenAt: now,
            status: "OPEN",
            resolvedAt: null,
          },
    }),
  ]);

  const watching = (at: Date | null) => !!at && now.getTime() - at.getTime() < WATCHING_MS;

  /** Push only for the first unread message of a burst, and not while the other side is watching. */
  const notify = async () => {
    try {
      if (input.fromAdmin) {
        if (before.userUnread > 0 || watching(before.userSeenAt)) return;
        await notifyUser({
          userId: input.customerId,
          type: "SUPPORT",
          titleEn: "New reply from DivyaDham support",
          titleHi: "दिव्यधाम सहायता से नया जवाब",
          bodyEn: preview,
          bodyHi: preview,
          href: "/support",
          dedupeKey: `support:${message.id}`,
        });
      } else {
        if (before.adminUnread > 0 || watching(before.adminSeenAt)) return;
        const customer = await db.user.findUnique({ where: { id: input.customerId }, select: { name: true, phone: true, email: true } });
        const who = customer?.name || formatPhone(customer?.phone) || customer?.email || "A devotee";
        await notifyAdmins({
          type: "SUPPORT",
          titleEn: `New message from ${who}`,
          titleHi: `${who} का नया संदेश`,
          bodyEn: preview,
          bodyHi: preview,
          href: `/admin/support/${thread.id}`,
          dedupeKey: `support:${message.id}`,
        });
      }
    } catch (e) {
      console.error("[support] notify failed", e);
    }
  };

  return { message: toDTO(message, input.fromAdmin ? "admin" : "user"), thread: threadDTO(thread), notify };
}

// ─────────────────────────── Admin inbox ───────────────────────────

export type SupportInboxFilter = "open" | "resolved" | "unread" | "all";

export async function listSupportThreads(params: { filter: SupportInboxFilter; q?: string; take?: number }) {
  const where: Prisma.SupportThreadWhereInput = {};
  if (params.filter === "open") where.status = "OPEN";
  if (params.filter === "resolved") where.status = "RESOLVED";
  if (params.filter === "unread") where.adminUnread = { gt: 0 };
  const q = params.q?.trim();
  if (q) {
    where.user = { OR: [{ name: { contains: q } }, { phone: { contains: q.replace(/\s+/g, "") } }, { email: { contains: q } }] };
  }
  const [threads, open, resolved, unread] = await Promise.all([
    db.supportThread.findMany({
      where,
      orderBy: [{ lastMessageAt: "desc" }],
      take: params.take ?? 100,
      include: { user: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true, city: true } } },
    }),
    db.supportThread.count({ where: { status: "OPEN" } }),
    db.supportThread.count({ where: { status: "RESOLVED" } }),
    db.supportThread.count({ where: { adminUnread: { gt: 0 } } }),
  ]);
  return { threads, counts: { open, resolved, unread, all: open + resolved } };
}

export async function getSupportThreadDetail(id: string) {
  return db.supportThread.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatarUrl: true,
          city: true,
          state: true,
          role: true,
          createdAt: true,
          bookings: {
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, code: true, status: true, scheduledDate: true, amountTotal: true, service: { select: { nameEn: true, nameHi: true } } },
          },
          _count: { select: { bookings: true } },
        },
      },
    },
  });
}

export async function setSupportThreadStatus(id: string, status: SupportStatus) {
  return db.supportThread.update({
    where: { id },
    data: status === "RESOLVED" ? { status, resolvedAt: new Date(), adminUnread: 0 } : { status, resolvedAt: null },
  });
}
