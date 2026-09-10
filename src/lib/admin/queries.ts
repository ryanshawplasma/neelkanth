import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { addDays, toDateKey } from "@/lib/utils";
import { parsePaging, sp, type Paging, type SearchParams } from "./util";

/** Standard shape returned by every paginated list query. */
export type Page<T> = { rows: T[]; total: number; page: number; size: number; pages: number };

function pageOf<T>(rows: T[], total: number, p: Paging): Page<T> {
  return { rows, total, page: p.page, size: p.size, pages: Math.max(1, Math.ceil(total / p.size)) };
}

// ─────────────────────────── Overview ───────────────────────────

export async function getOverview() {
  const now = new Date();
  const today = toDateKey(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = addDays(dayStart, -7);
  const thirtyAgo = addDays(dayStart, -29);

  const [
    revenueToday,
    revenueMonth,
    bookingsToday,
    statusGroups,
    newUsersWeek,
    pendingKyc,
    activePandits,
    upcomingFestivals,
    paidLast30,
    bookingsByType,
    recentBookings,
    needsPandit,
    kycSubmitted,
    consultsRequested,
    failedToday,
  ] = await Promise.all([
    db.payment.aggregate({ where: { status: "PAID", updatedAt: { gte: dayStart } }, _sum: { amount: true }, _count: true }),
    db.payment.aggregate({ where: { status: "PAID", updatedAt: { gte: monthStart } }, _sum: { amount: true }, _count: true }),
    db.booking.count({ where: { createdAt: { gte: dayStart } } }),
    db.booking.groupBy({ by: ["status"], _count: { _all: true } }),
    db.user.count({ where: { createdAt: { gte: weekStart }, role: { in: ["USER", "PANDIT"] } } }),
    db.panditProfile.count({ where: { kycStatus: "SUBMITTED" } }),
    db.panditProfile.count({ where: { isActive: true, verified: true, kycStatus: "APPROVED" } }),
    db.festival.findMany({
      where: { active: true, date: { gte: today, lte: toDateKey(addDays(now, 14)) } },
      orderBy: { date: "asc" },
      take: 8,
      select: { id: true, slug: true, nameEn: true, nameHi: true, date: true, type: true, major: true, pushEnabled: true },
    }),
    db.payment.findMany({
      where: { status: "PAID", updatedAt: { gte: thirtyAgo } },
      select: { amount: true, updatedAt: true },
    }),
    db.booking.groupBy({ by: ["type"], _count: { _all: true } }),
    db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { service: true, user: true, pandit: true, payment: true },
    }),
    db.booking.findMany({
      where: { status: "CONFIRMED", panditId: null, service: { requiresPandit: true } },
      orderBy: { scheduledDate: "asc" },
      take: 8,
      include: { service: true, user: true },
    }),
    db.panditProfile.findMany({
      where: { kycStatus: "SUBMITTED" },
      orderBy: { kycSubmittedAt: "asc" },
      take: 8,
      select: { id: true, displayName: true, displayNameHi: true, city: true, kycSubmittedAt: true, photoUrl: true },
    }),
    db.consultation.findMany({
      where: { status: "REQUESTED" },
      orderBy: { createdAt: "asc" },
      take: 8,
      include: { user: { select: { id: true, name: true, phone: true } } },
    }),
    db.payment.findMany({
      where: { status: "FAILED", updatedAt: { gte: dayStart } },
      take: 8,
      include: { booking: { select: { id: true, code: true } } },
    }),
  ]);

  // revenue series for the last 30 days, bucketed by date key
  const buckets = new Map<string, number>();
  for (let i = 0; i < 30; i++) buckets.set(toDateKey(addDays(thirtyAgo, i)), 0);
  for (const p of paidLast30) {
    const key = toDateKey(p.updatedAt);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + p.amount);
  }
  const revenueSeries = [...buckets.entries()].map(([date, value]) => ({ label: date.slice(5), value }));

  const byStatus: Record<string, number> = {};
  for (const g of statusGroups) byStatus[g.status] = g._count._all;

  return {
    revenueToday: revenueToday._sum.amount ?? 0,
    revenueTodayCount: revenueToday._count,
    revenueMonth: revenueMonth._sum.amount ?? 0,
    revenueMonthCount: revenueMonth._count,
    bookingsToday,
    byStatus,
    newUsersWeek,
    pendingKyc,
    activePandits,
    upcomingFestivals,
    revenueSeries,
    bookingsByType: bookingsByType.map((b) => ({ type: b.type, count: b._count._all })),
    recentBookings,
    needsAttention: { needsPandit, kycSubmitted, consultsRequested, failedToday },
  };
}

/** Sidebar badge. */
export async function getPendingKycCount() {
  return db.panditProfile.count({ where: { kycStatus: "SUBMITTED" } });
}

// ─────────────────────────── Bookings ───────────────────────────

export async function listBookings(params: SearchParams) {
  const p = parsePaging(params);
  const status = sp(params, "status");
  const type = sp(params, "type");
  const from = sp(params, "from");
  const to = sp(params, "to");
  const q = sp(params, "q");

  const where: Prisma.BookingWhereInput = {};
  if (status) where.status = status as Prisma.BookingWhereInput["status"];
  if (type) where.type = type as Prisma.BookingWhereInput["type"];
  if (from || to) where.scheduledDate = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
  if (q) {
    where.OR = [
      { code: { contains: q } },
      { user: { name: { contains: q } } },
      { user: { phone: { contains: q } } },
      { service: { nameEn: { contains: q } } },
      { service: { nameHi: { contains: q } } },
    ];
  }

  const [rows, total] = await Promise.all([
    db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: p.skip,
      take: p.take,
      include: { service: true, user: true, pandit: true, payment: true },
    }),
    db.booking.count({ where }),
  ]);
  return pageOf(rows, total, p);
}

export async function getBookingDetail(id: string) {
  return db.booking.findUnique({
    where: { id },
    include: {
      service: { include: { temple: true, packages: true, addons: true } },
      package: true,
      user: true,
      pandit: { include: { user: true } },
      temple: true,
      payment: true,
      review: true,
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });
}

/** Pandits eligible for a booking: offer the service, KYC approved, active. Same-city first. */
export async function getEligiblePandits(serviceId: string, city?: string | null) {
  const rows = await db.panditService.findMany({
    where: { serviceId, active: true, pandit: { isActive: true, kycStatus: "APPROVED" } },
    include: { pandit: true },
  });
  return rows
    .map((r) => ({ ...r.pandit, overridePrice: r.price }))
    .sort((a, b) => {
      const ca = city && a.city && a.city.toLowerCase() === city.toLowerCase() ? 1 : 0;
      const cb = city && b.city && b.city.toLowerCase() === city.toLowerCase() ? 1 : 0;
      if (ca !== cb) return cb - ca;
      return b.ratingAvg - a.ratingAvg;
    });
}

// ─────────────────────────── Pandits ───────────────────────────

export async function listPandits(params: SearchParams) {
  const p = parsePaging(params);
  const kyc = sp(params, "kyc");
  const classification = sp(params, "classification");
  const verified = sp(params, "verified");
  const city = sp(params, "city");
  const q = sp(params, "q");

  const where: Prisma.PanditProfileWhereInput = {};
  if (kyc) where.kycStatus = kyc as Prisma.PanditProfileWhereInput["kycStatus"];
  if (classification) where.classification = classification as Prisma.PanditProfileWhereInput["classification"];
  if (verified === "yes") where.verified = true;
  if (verified === "no") where.verified = false;
  if (city) where.city = { contains: city };
  if (q) {
    where.OR = [
      { displayName: { contains: q } },
      { displayNameHi: { contains: q } },
      { user: { phone: { contains: q } } },
      { city: { contains: q } },
    ];
  }

  const [rows, total] = await Promise.all([
    db.panditProfile.findMany({
      where,
      orderBy: [{ kycStatus: "asc" }, { createdAt: "desc" }],
      skip: p.skip,
      take: p.take,
      include: { user: true, _count: { select: { bookings: true, services: true } } },
    }),
    db.panditProfile.count({ where }),
  ]);
  return pageOf(rows, total, p);
}

export async function getPanditDetail(id: string) {
  return db.panditProfile.findUnique({
    where: { id },
    include: {
      user: true,
      temple: true,
      documents: { orderBy: { createdAt: "asc" } },
      availability: { orderBy: [{ weekday: "asc" }, { startTime: "asc" }] },
      blockedDates: { orderBy: { date: "asc" } },
      services: { include: { service: true } },
      payouts: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 20, include: { user: true, service: true } },
      bookings: { orderBy: { createdAt: "desc" }, take: 20, include: { service: true, user: true } },
    },
  });
}

/** Net earned (completed bookings minus commission) minus payouts already made. */
export async function getPanditBalance(panditId: string, commissionPct: number) {
  const [earned, paid] = await Promise.all([
    db.booking.aggregate({ where: { panditId, status: "COMPLETED" }, _sum: { amountTotal: true } }),
    db.payout.aggregate({ where: { panditId, status: "PAID" }, _sum: { amount: true } }),
  ]);
  const gross = earned._sum.amountTotal ?? 0;
  const net = Math.round((gross * (100 - commissionPct)) / 100);
  const paidOut = paid._sum.amount ?? 0;
  return { gross, net, paidOut, balance: net - paidOut };
}

// ─────────────────────────── Users ───────────────────────────

export async function listUsers(params: SearchParams) {
  const p = parsePaging(params);
  const role = sp(params, "role");
  const onboarded = sp(params, "onboarded");
  const blocked = sp(params, "blocked");
  const q = sp(params, "q");

  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role as Prisma.UserWhereInput["role"];
  if (onboarded === "yes") where.onboarded = true;
  if (onboarded === "no") where.onboarded = false;
  if (blocked === "yes") where.isBlocked = true;
  if (blocked === "no") where.isBlocked = false;
  if (q) where.OR = [{ name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }];

  const [rows, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: p.skip,
      take: p.take,
      include: { _count: { select: { bookings: true } } },
    }),
    db.user.count({ where }),
  ]);
  return pageOf(rows, total, p);
}

export async function getUserDetail(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      pandit: true,
      familyMembers: true,
      bookings: { orderBy: { createdAt: "desc" }, take: 20, include: { service: true, payment: true } },
      notifications: { orderBy: { createdAt: "desc" }, take: 20 },
      favorites: { include: { service: true } },
      consultations: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

// ─────────────────────────── Services ───────────────────────────

export async function listServices(params: SearchParams) {
  const p = parsePaging(params);
  const type = sp(params, "type");
  const categoryId = sp(params, "category");
  const templeId = sp(params, "temple");
  const active = sp(params, "active");
  const featured = sp(params, "featured");
  const q = sp(params, "q");

  const where: Prisma.ServiceWhereInput = {};
  if (type) where.type = type as Prisma.ServiceWhereInput["type"];
  if (categoryId) where.categoryId = categoryId;
  if (templeId) where.templeId = templeId;
  if (active === "yes") where.active = true;
  if (active === "no") where.active = false;
  if (featured === "yes") where.featured = true;
  if (featured === "no") where.featured = false;
  if (q) where.OR = [{ nameEn: { contains: q } }, { nameHi: { contains: q } }, { slug: { contains: q } }];

  const [rows, total] = await Promise.all([
    db.service.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: p.skip,
      take: p.take,
      include: { temple: true, category: true, _count: { select: { packages: true, bookings: true } } },
    }),
    db.service.count({ where }),
  ]);
  return pageOf(rows, total, p);
}

export async function getServiceEditorData(id?: string) {
  const [service, categories, temples, festivals] = await Promise.all([
    id
      ? db.service.findUnique({
          where: { id },
          include: { packages: { orderBy: { sortOrder: "asc" } }, addons: true, _count: { select: { bookings: true } } },
        })
      : Promise.resolve(null),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.temple.findMany({ orderBy: { nameEn: "asc" } }),
    db.festival.findMany({ orderBy: { date: "asc" }, select: { id: true, nameEn: true, nameHi: true, date: true } }),
  ]);
  return { service, categories, temples, festivals };
}

// ─────────────────────────── Catalog: festivals / content / etc ───────────────────────────

export async function listFestivals(params: SearchParams) {
  const p = parsePaging(params, 50);
  const type = sp(params, "type");
  const major = sp(params, "major");
  const push = sp(params, "push");
  const q = sp(params, "q");
  const year = sp(params, "year");

  const where: Prisma.FestivalWhereInput = {};
  if (type) where.type = type as Prisma.FestivalWhereInput["type"];
  if (major === "yes") where.major = true;
  if (major === "no") where.major = false;
  if (push === "yes") where.pushEnabled = true;
  if (push === "no") where.pushEnabled = false;
  if (year) where.date = { gte: `${year}-01-01`, lte: `${year}-12-31` };
  if (q) where.OR = [{ nameEn: { contains: q } }, { nameHi: { contains: q } }, { slug: { contains: q } }];

  const [rows, total] = await Promise.all([
    db.festival.findMany({
      where,
      orderBy: { date: "asc" },
      skip: p.skip,
      take: p.take,
      include: { _count: { select: { services: true } } },
    }),
    db.festival.count({ where }),
  ]);
  return pageOf(rows, total, p);
}

export async function listContent(params: SearchParams) {
  const p = parsePaging(params);
  const type = sp(params, "type");
  const q = sp(params, "q");
  const where: Prisma.ContentItemWhereInput = {};
  if (type) where.type = type as Prisma.ContentItemWhereInput["type"];
  if (q) where.OR = [{ titleEn: { contains: q } }, { titleHi: { contains: q } }, { slug: { contains: q } }];
  const [rows, total] = await Promise.all([
    db.contentItem.findMany({ where, orderBy: [{ type: "asc" }, { titleEn: "asc" }], skip: p.skip, take: p.take }),
    db.contentItem.count({ where }),
  ]);
  return pageOf(rows, total, p);
}

// ─────────────────────────── Payments / payouts ───────────────────────────

export async function listPayments(params: SearchParams) {
  const p = parsePaging(params);
  const status = sp(params, "status");
  const provider = sp(params, "provider");
  const from = sp(params, "from");
  const to = sp(params, "to");
  const q = sp(params, "q");

  const where: Prisma.PaymentWhereInput = {};
  if (status) where.status = status as Prisma.PaymentWhereInput["status"];
  if (provider) where.provider = provider;
  if (from) where.createdAt = { gte: new Date(`${from}T00:00:00`) };
  if (to) where.createdAt = { ...(where.createdAt as object), lte: new Date(`${to}T23:59:59`) };
  if (q) where.booking = { OR: [{ code: { contains: q } }, { user: { name: { contains: q } } }, { user: { phone: { contains: q } } }] };

  const [rows, total, sums] = await Promise.all([
    db.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: p.skip,
      take: p.take,
      include: { booking: { include: { user: true, service: true } } },
    }),
    db.payment.count({ where }),
    db.payment.aggregate({ where, _sum: { amount: true } }),
  ]);
  return { ...pageOf(rows, total, p), sum: sums._sum.amount ?? 0 };
}

export async function listPayouts(params: SearchParams) {
  const p = parsePaging(params);
  const status = sp(params, "status");
  const where: Prisma.PayoutWhereInput = {};
  if (status) where.status = status;
  const [rows, total, sums] = await Promise.all([
    db.payout.findMany({ where, orderBy: { createdAt: "desc" }, skip: p.skip, take: p.take, include: { pandit: true } }),
    db.payout.count({ where }),
    db.payout.aggregate({ where, _sum: { amount: true } }),
  ]);
  return { ...pageOf(rows, total, p), sum: sums._sum.amount ?? 0 };
}

// ─────────────────────────── Reviews / consultations ───────────────────────────

export async function listReviews(params: SearchParams) {
  const p = parsePaging(params);
  const approved = sp(params, "approved");
  const rating = sp(params, "rating");
  const q = sp(params, "q");
  const where: Prisma.ReviewWhereInput = {};
  if (approved === "yes") where.approved = true;
  if (approved === "no") where.approved = false;
  if (rating) where.rating = Number(rating);
  if (q) where.OR = [{ comment: { contains: q } }, { user: { name: { contains: q } } }, { service: { nameEn: { contains: q } } }];
  const [rows, total] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: p.skip,
      take: p.take,
      include: { user: true, service: true, pandit: true, booking: { select: { code: true, id: true } } },
    }),
    db.review.count({ where }),
  ]);
  return pageOf(rows, total, p);
}

export async function listConsultations(params: SearchParams) {
  const p = parsePaging(params);
  const status = sp(params, "status");
  const topic = sp(params, "topic");
  const where: Prisma.ConsultationWhereInput = {};
  if (status) where.status = status;
  if (topic) where.topic = topic;
  const [rows, total, jyotishis] = await Promise.all([
    db.consultation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: p.skip,
      take: p.take,
      include: { user: true, pandit: true },
    }),
    db.consultation.count({ where }),
    db.panditProfile.findMany({
      where: { classification: "JYOTISHI", isActive: true },
      select: { id: true, displayName: true, city: true, ratingAvg: true },
      orderBy: { ratingAvg: "desc" },
    }),
  ]);
  return { ...pageOf(rows, total, p), jyotishis };
}

// ─────────────────────────── Audit / search ───────────────────────────

export async function listAudit(params: SearchParams) {
  const p = parsePaging(params, 50);
  const action = sp(params, "action");
  const entity = sp(params, "entity");
  const actorId = sp(params, "actor");
  const q = sp(params, "q");
  const where: Prisma.AuditLogWhereInput = {};
  if (action) where.action = { contains: action };
  if (entity) where.entity = entity;
  if (actorId) where.actorId = actorId;
  if (q) where.OR = [{ action: { contains: q } }, { entityId: { contains: q } }, { meta: { contains: q } }];
  const [rows, total, entities] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: p.skip, take: p.take, include: { actor: true } }),
    db.auditLog.count({ where }),
    db.auditLog.findMany({ distinct: ["entity"], select: { entity: true }, take: 40 }),
  ]);
  return { ...pageOf(rows, total, p), entities: entities.map((e) => e.entity).filter(Boolean) as string[] };
}

export async function globalSearch(q: string) {
  if (!q || q.length < 2) {
    return { bookings: [], users: [], pandits: [], services: [], temples: [], festivals: [] };
  }
  const [bookings, users, pandits, services, temples, festivals] = await Promise.all([
    db.booking.findMany({
      where: { OR: [{ code: { contains: q } }, { user: { phone: { contains: q } } }] },
      take: 10,
      include: { service: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      where: { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } }] },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    db.panditProfile.findMany({
      where: { OR: [{ displayName: { contains: q } }, { displayNameHi: { contains: q } }, { city: { contains: q } }] },
      take: 10,
    }),
    db.service.findMany({
      where: { OR: [{ nameEn: { contains: q } }, { nameHi: { contains: q } }, { slug: { contains: q } }] },
      take: 10,
    }),
    db.temple.findMany({
      where: { OR: [{ nameEn: { contains: q } }, { nameHi: { contains: q } }, { city: { contains: q } }] },
      take: 10,
    }),
    db.festival.findMany({
      where: { OR: [{ nameEn: { contains: q } }, { nameHi: { contains: q } }, { slug: { contains: q } }] },
      take: 10,
      orderBy: { date: "asc" },
    }),
  ]);
  return { bookings, users, pandits, services, temples, festivals };
}

// ─────────────────────────── Settings ───────────────────────────

export async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = await db.setting.findMany();
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function getDistinctCities() {
  const rows = await db.user.findMany({ where: { city: { not: null } }, distinct: ["city"], select: { city: true }, take: 100 });
  return rows.map((r) => r.city).filter(Boolean) as string[];
}

/** Read-only environment card on /admin/settings — never exposes secret values. */
export function getEnvInfo() {
  return {
    paymentProvider: process.env.PAYMENT_PROVIDER === "razorpay" && process.env.RAZORPAY_KEY_ID ? "razorpay" : "mock",
    vapidConfigured: !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    otpDevMode: !!process.env.OTP_DEV_CODE,
    cronPath: "/api/cron/reminders?secret=…",
    cronConfigured: !!process.env.CRON_SECRET,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
}

// ─────────────────────────── Categories / temples ───────────────────────────

export async function listCategories() {
  return db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }], include: { _count: { select: { services: true } } } });
}

export async function listTemples(params: SearchParams) {
  const p = parsePaging(params, 50);
  const q = sp(params, "q");
  const state = sp(params, "state");
  const active = sp(params, "active");
  const where: Prisma.TempleWhereInput = {};
  if (q) where.OR = [{ nameEn: { contains: q } }, { nameHi: { contains: q } }, { city: { contains: q } }, { slug: { contains: q } }];
  if (state) where.state = state;
  if (active === "yes") where.active = true;
  if (active === "no") where.active = false;
  const [rows, total] = await Promise.all([
    db.temple.findMany({
      where,
      orderBy: [{ featured: "desc" }, { nameEn: "asc" }],
      skip: p.skip,
      take: p.take,
      include: { _count: { select: { services: true, pandits: true } } },
    }),
    db.temple.count({ where }),
  ]);
  return pageOf(rows, total, p);
}

export async function getTemple(id: string) {
  return db.temple.findUnique({ where: { id }, include: { _count: { select: { services: true, bookings: true } } } });
}

// ─────────────────────────── Festivals / content details ───────────────────────────

export async function getFestival(id: string) {
  return db.festival.findUnique({ where: { id }, include: { services: { select: { id: true, slug: true, nameEn: true, nameHi: true } } } });
}

export async function getContentItem(id: string) {
  return db.contentItem.findUnique({ where: { id } });
}

// ─────────────────────────── Banners / coupons ───────────────────────────

export async function listBanners() {
  return db.banner.findMany({ orderBy: [{ placement: "asc" }, { sortOrder: "asc" }] });
}

export async function listCoupons() {
  const coupons = await db.coupon.findMany({ orderBy: { code: "asc" } });
  const usage = await db.booking.groupBy({ by: ["couponCode"], _count: { _all: true }, _sum: { amountDiscount: true } });
  const map = new Map(usage.filter((u) => u.couponCode).map((u) => [u.couponCode as string, { count: u._count._all, discount: u._sum.amountDiscount ?? 0 }]));
  return coupons.map((c) => ({ ...c, usage: map.get(c.code) ?? { count: 0, discount: 0 } }));
}

// ─────────────────────────── Campaigns / notifications ───────────────────────────

export async function listCampaigns(take = 30) {
  return db.campaign.findMany({ orderBy: { createdAt: "desc" }, take });
}

export async function getNotificationStats() {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const [total, today, pushed, subs, lastRun] = await Promise.all([
    db.notification.count(),
    db.notification.count({ where: { createdAt: { gte: dayStart } } }),
    db.notification.count({ where: { pushed: true } }),
    db.pushSubscription.count(),
    db.setting.findUnique({ where: { key: "reminders_last_run" } }),
  ]);
  return { total, today, pushed, subs, lastRun: lastRun?.value ?? null };
}

/** Audience size preview for the campaign composer. */
export async function getAudienceCounts() {
  const [all, users, pandits, onboarded] = await Promise.all([
    db.user.count({ where: { isBlocked: false } }),
    db.user.count({ where: { isBlocked: false, role: "USER" } }),
    db.user.count({ where: { isBlocked: false, role: "PANDIT" } }),
    db.user.count({ where: { isBlocked: false, onboarded: true } }),
  ]);
  return { ALL: all, USERS: users, PANDITS: pandits, ONBOARDED: onboarded };
}

/** Services a pandit may be linked to (for the "services offered" editor). */
export async function listServiceOptions() {
  return db.service.findMany({ where: { active: true }, orderBy: { nameEn: "asc" }, select: { id: true, nameEn: true, nameHi: true, type: true, basePrice: true } });
}
