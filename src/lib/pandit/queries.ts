import "server-only";
import type { BookingStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePandit } from "@/lib/auth";
import { toDateKey } from "@/lib/utils";
import { PANDIT_SERVICE_TYPES, lastMonths, monthKey, monthRange, netEarning, type BookingTab } from "./shared";

/** Statuses that belong to each tab of /pandit/bookings. */
const TAB_STATUSES: Record<BookingTab, BookingStatus[]> = {
  upcoming: ["ASSIGNED", "CONFIRMED"],
  inprogress: ["IN_PROGRESS"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED", "REFUNDED", "FAILED"],
};

export const bookingCardSelect = {
  id: true,
  code: true,
  type: true,
  status: true,
  scheduledDate: true,
  scheduledSlot: true,
  devotees: true,
  city: true,
  state: true,
  amountTotal: true,
  liveLink: true,
  videoUrl: true,
  completedAt: true,
  createdAt: true,
  service: { select: { id: true, nameEn: true, nameHi: true, type: true, coverUrl: true } },
  user: { select: { name: true, phone: true } },
} satisfies Prisma.BookingSelect;

export type BookingCard = Prisma.BookingGetPayload<{ select: typeof bookingCardSelect }>;

/** The signed-in pandit (redirects to login/register when missing). */
export async function panditContext() {
  return requirePandit();
}

// ─────────────────────────── dashboard ───────────────────────────

export async function getDashboardData() {
  const { user, pandit } = await requirePandit();
  const today = toDateKey();
  const { start, end } = monthRange(monthKey());

  const [todayBookings, upcoming, upcomingCount, completedMonth, notifications, unreadCount] = await Promise.all([
    db.booking.findMany({
      where: { panditId: pandit.id, scheduledDate: today, status: { in: ["ASSIGNED", "CONFIRMED", "IN_PROGRESS"] } },
      select: bookingCardSelect,
      orderBy: [{ scheduledSlot: "asc" }],
    }),
    db.booking.findMany({
      where: { panditId: pandit.id, scheduledDate: { gt: today }, status: { in: ["ASSIGNED", "CONFIRMED", "IN_PROGRESS"] } },
      select: bookingCardSelect,
      orderBy: [{ scheduledDate: "asc" }, { scheduledSlot: "asc" }],
      take: 5,
    }),
    db.booking.count({ where: { panditId: pandit.id, scheduledDate: { gte: today }, status: { in: ["ASSIGNED", "CONFIRMED", "IN_PROGRESS"] } } }),
    db.booking.findMany({
      where: { panditId: pandit.id, status: "COMPLETED", completedAt: { gte: start, lt: end } },
      select: { amountTotal: true },
    }),
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  const earningsMonth = completedMonth.reduce((sum, b) => sum + netEarning(b.amountTotal, pandit.commissionPct), 0);
  const needsLiveLink = todayBookings.filter((b) => b.type === "ONLINE_POOJA" && !b.liveLink);

  return {
    user,
    pandit,
    today,
    todayBookings,
    upcoming,
    upcomingCount,
    completedMonthCount: completedMonth.length,
    earningsMonth,
    notifications,
    unreadCount,
    needsLiveLink,
  };
}

// ─────────────────────────── bookings ───────────────────────────

export async function getBookingCounts(panditId: string) {
  const rows = await db.booking.groupBy({ by: ["status"], where: { panditId }, _count: { _all: true } });
  const map = new Map(rows.map((r) => [r.status, r._count._all]));
  const sum = (list: BookingStatus[]) => list.reduce((n, s) => n + (map.get(s) ?? 0), 0);
  return {
    upcoming: sum(TAB_STATUSES.upcoming),
    inprogress: sum(TAB_STATUSES.inprogress),
    completed: sum(TAB_STATUSES.completed),
    cancelled: sum(TAB_STATUSES.cancelled),
  } satisfies Record<BookingTab, number>;
}

export async function getBookingsForTab(tab: BookingTab) {
  const { pandit } = await requirePandit();
  const [bookings, counts] = await Promise.all([
    db.booking.findMany({
      where: { panditId: pandit.id, status: { in: TAB_STATUSES[tab] } },
      select: bookingCardSelect,
      orderBy: tab === "completed" || tab === "cancelled" ? [{ scheduledDate: "desc" }] : [{ scheduledDate: "asc" }, { scheduledSlot: "asc" }],
      take: 100,
    }),
    getBookingCounts(pandit.id),
  ]);
  return { pandit, bookings, counts };
}

/** Full booking detail — returns null when the booking is not this pandit's. */
export async function getBookingDetail(id: string) {
  const { user, pandit } = await requirePandit();
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      service: true,
      package: true,
      temple: { select: { id: true, nameEn: true, nameHi: true, city: true, state: true } },
      user: { select: { id: true, name: true, phone: true } },
      payment: { select: { status: true, method: true, amount: true, provider: true } },
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!booking || booking.panditId !== pandit.id) return null;
  return { user, pandit, booking };
}

export type BookingDetail = NonNullable<Awaited<ReturnType<typeof getBookingDetail>>>["booking"];

// ─────────────────────────── services ───────────────────────────

export async function getServiceCatalog() {
  const { pandit } = await requirePandit();
  const [services, offered] = await Promise.all([
    db.service.findMany({
      where: { active: true, requiresPandit: true, type: { in: [...PANDIT_SERVICE_TYPES] } },
      select: {
        id: true,
        slug: true,
        type: true,
        nameEn: true,
        nameHi: true,
        taglineEn: true,
        taglineHi: true,
        basePrice: true,
        durationMin: true,
        coverUrl: true,
        temple: { select: { nameEn: true, nameHi: true } },
      },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { nameEn: "asc" }],
    }),
    db.panditService.findMany({ where: { panditId: pandit.id }, select: { serviceId: true, price: true, active: true } }),
  ]);
  return { pandit, services, offered };
}

// ─────────────────────────── availability ───────────────────────────

export async function getAvailability() {
  const { pandit } = await requirePandit();
  const today = toDateKey();
  const [slots, blocked] = await Promise.all([
    db.panditAvailability.findMany({ where: { panditId: pandit.id }, orderBy: [{ weekday: "asc" }, { startTime: "asc" }] }),
    db.panditBlockedDate.findMany({ where: { panditId: pandit.id, date: { gte: today } }, orderBy: { date: "asc" } }),
  ]);
  return { pandit, slots, blocked };
}

// ─────────────────────────── earnings ───────────────────────────

export async function getEarnings(month: string) {
  const { pandit } = await requirePandit();
  const { start, end } = monthRange(month);
  const months = lastMonths(6, month);
  const chartStart = monthRange(months[0]).start;

  const [rows, payouts, history] = await Promise.all([
    db.booking.findMany({
      where: { panditId: pandit.id, status: "COMPLETED", completedAt: { gte: start, lt: end } },
      select: {
        id: true,
        code: true,
        amountTotal: true,
        scheduledDate: true,
        completedAt: true,
        service: { select: { nameEn: true, nameHi: true } },
      },
      orderBy: { completedAt: "desc" },
    }),
    db.payout.findMany({ where: { panditId: pandit.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.booking.findMany({
      where: { panditId: pandit.id, status: "COMPLETED", completedAt: { gte: chartStart, lt: end } },
      select: { amountTotal: true, completedAt: true },
    }),
  ]);

  const gross = rows.reduce((s, r) => s + r.amountTotal, 0);
  const net = rows.reduce((s, r) => s + netEarning(r.amountTotal, pandit.commissionPct), 0);

  const byMonth = new Map(months.map((m) => [m, 0]));
  for (const b of history) {
    if (!b.completedAt) continue;
    const k = monthKey(b.completedAt);
    if (byMonth.has(k)) byMonth.set(k, (byMonth.get(k) ?? 0) + netEarning(b.amountTotal, pandit.commissionPct));
  }
  const chart = months.map((m) => ({ month: m, net: byMonth.get(m) ?? 0 }));

  const paidOut = payouts.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const pendingPayout = payouts.filter((p) => p.status !== "PAID").reduce((s, p) => s + p.amount, 0);

  return { pandit, rows, payouts, gross, net, chart, paidOut, pendingPayout };
}

// ─────────────────────────── misc ───────────────────────────

export async function getKycData() {
  const { pandit } = await requirePandit();
  const documents = await db.kycDocument.findMany({ where: { panditId: pandit.id }, orderBy: { createdAt: "asc" } });
  return { pandit, documents };
}

export async function getProfileData() {
  const { user, pandit } = await requirePandit();
  const temples = await db.temple.findMany({ where: { active: true }, select: { id: true, nameEn: true, nameHi: true, city: true }, orderBy: { nameEn: "asc" } });
  return { user, pandit, temples };
}

export async function getReviews() {
  const { pandit } = await requirePandit();
  const reviews = await db.review.findMany({
    where: { panditId: pandit.id, approved: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true } },
      service: { select: { nameEn: true, nameHi: true } },
      booking: { select: { code: true, scheduledDate: true } },
    },
  });
  return { pandit, reviews };
}

export async function getNotifications() {
  const { user } = await requirePandit();
  const [items, unread] = await Promise.all([
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 60 }),
    db.notification.count({ where: { userId: user.id, read: false } }),
  ]);
  return { user, items, unread };
}

/** Unread badge for the portal shell. */
export async function getUnreadCount(userId: string) {
  return db.notification.count({ where: { userId, read: false } });
}

/** Active temples — used by the registration & profile forms. */
export async function getTempleOptions() {
  return db.temple.findMany({ where: { active: true }, select: { id: true, nameEn: true, nameHi: true, city: true }, orderBy: { nameEn: "asc" } });
}
