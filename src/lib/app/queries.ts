import "server-only";
import type { Prisma, ServiceType } from "@prisma/client";
import { db } from "@/lib/db";
import { addDays, toDateKey } from "@/lib/utils";
import { getLaunchScope, isServiceInScope, serviceScope, templeScope } from "./launch";
import { isCity } from "./cities";

/** Columns every service card needs — keeps payloads small. */
export const serviceCardSelect = {
  id: true,
  slug: true,
  type: true,
  nameEn: true,
  nameHi: true,
  taglineEn: true,
  taglineHi: true,
  deityEn: true,
  deityHi: true,
  coverUrl: true,
  images: true,
  basePrice: true,
  compareAtPrice: true,
  nextDate: true,
  slots: true,
  ratingAvg: true,
  ratingCount: true,
  bookingCount: true,
  durationMin: true,
  featured: true,
  trending: true,
  temple: { select: { slug: true, nameEn: true, nameHi: true, city: true, state: true } },
  category: { select: { slug: true, nameEn: true, nameHi: true } },
  festival: { select: { slug: true, nameEn: true, nameHi: true, date: true } },
} satisfies Prisma.ServiceSelect;

export type ServiceCard = Prisma.ServiceGetPayload<{ select: typeof serviceCardSelect }>;

const activeService = { active: true } satisfies Prisma.ServiceWhereInput;

/** Active services inside the launch-city scope (see src/lib/app/launch.ts). */
async function scopedServices(): Promise<Prisma.ServiceWhereInput> {
  const scope = await getLaunchScope();
  return { ...activeService, AND: [serviceScope(scope)] };
}

/* ─────────────────────────── Home ─────────────────────────── */

export async function getHomeData() {
  const today = toDateKey();
  const horizon = toDateKey(addDays(new Date(), 200));
  const scope = await getLaunchScope();
  const inScope = await scopedServices();

  const [banners, categories, featured, trending, chadhava, temples, atHome, astrology, content, festivals] = await Promise.all([
    db.banner.findMany({ where: { active: true, placement: "home" }, orderBy: { sortOrder: "asc" }, take: 6 }),
    db.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 12 }),
    db.service.findMany({
      where: { ...inScope, type: "ONLINE_POOJA", featured: true },
      select: serviceCardSelect,
      orderBy: [{ sortOrder: "asc" }, { bookingCount: "desc" }],
      take: 10,
    }),
    db.service.findMany({
      where: { ...inScope, trending: true },
      select: serviceCardSelect,
      orderBy: { bookingCount: "desc" },
      take: 10,
    }),
    db.service.findMany({ where: { ...inScope, type: "CHADHAVA" }, select: serviceCardSelect, orderBy: { sortOrder: "asc" }, take: 10 }),
    db.temple.findMany({
      where: { active: true, ...templeScope(scope) },
      orderBy: [{ featured: "desc" }, { nameEn: "asc" }],
      take: 10,
      select: { id: true, slug: true, nameEn: true, nameHi: true, city: true, state: true, coverUrl: true, images: true, deityEn: true, deityHi: true, liveDarshanUrl: true },
    }),
    db.service.findMany({ where: { ...inScope, type: "PANDIT_AT_HOME" }, select: serviceCardSelect, orderBy: { sortOrder: "asc" }, take: 10 }),
    db.service.findMany({ where: { ...inScope, type: "ASTROLOGY" }, select: serviceCardSelect, take: 4 }),
    db.contentItem.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { views: "desc" }],
      take: 10,
      select: { id: true, slug: true, type: true, titleEn: true, titleHi: true, deityEn: true, deityHi: true, imageUrl: true },
    }),
    db.festival.findMany({
      where: { active: true, date: { gte: today, lte: horizon } },
      orderBy: { date: "asc" },
      take: 8,
      include: { services: { where: inScope, take: 1, select: { slug: true } } },
    }),
  ]);

  return { banners, categories, featured, trending, chadhava, temples, atHome, astrology, content, festivals, localCity: scope.only ? scope.city : null };
}

/* ─────────────────────────── Catalog listing ─────────────────────────── */

export type ServiceFilters = {
  type?: ServiceType | ServiceType[];
  q?: string;
  deity?: string;
  temple?: string;
  category?: string;
  festival?: string;
  sort?: "popular" | "priceAsc" | "priceDesc" | "rating" | "date";
  take?: number;
};

export function serviceOrderBy(sort: ServiceFilters["sort"]): Prisma.ServiceOrderByWithRelationInput[] {
  switch (sort) {
    case "priceAsc":
      return [{ basePrice: "asc" }];
    case "priceDesc":
      return [{ basePrice: "desc" }];
    case "rating":
      return [{ ratingAvg: "desc" }, { ratingCount: "desc" }];
    case "date":
      return [{ nextDate: "asc" }];
    default:
      return [{ featured: "desc" }, { bookingCount: "desc" }, { sortOrder: "asc" }];
  }
}

export async function listServices(f: ServiceFilters = {}) {
  const where: Prisma.ServiceWhereInput = await scopedServices();
  if (f.type) where.type = Array.isArray(f.type) ? { in: f.type } : f.type;
  if (f.deity) where.OR = [{ deityEn: { contains: f.deity } }, { deityHi: { contains: f.deity } }];
  if (f.temple) where.temple = { slug: f.temple };
  if (f.category) where.category = { slug: f.category };
  if (f.festival) where.festival = { slug: f.festival };
  if (f.q?.trim()) {
    const q = f.q.trim();
    where.AND = [
      ...((where.AND as Prisma.ServiceWhereInput[] | undefined) ?? []),
      {
        OR: [
          { nameEn: { contains: q } },
          { nameHi: { contains: q } },
          { taglineEn: { contains: q } },
          { taglineHi: { contains: q } },
          { deityEn: { contains: q } },
          { deityHi: { contains: q } },
          { tags: { contains: q } },
          { temple: { nameEn: { contains: q } } },
          { temple: { nameHi: { contains: q } } },
        ],
      },
    ];
  }
  return db.service.findMany({ where, select: serviceCardSelect, orderBy: serviceOrderBy(f.sort), take: f.take ?? 60 });
}

/** Distinct deity chips for the filter bar of a given service type. */
export async function deityOptions(type?: ServiceType | ServiceType[]) {
  const rows = await db.service.findMany({
    where: { ...activeService, ...(type ? { type: Array.isArray(type) ? { in: type } : type } : {}), deityEn: { not: null } },
    select: { deityEn: true, deityHi: true },
    distinct: ["deityEn"],
    take: 20,
  });
  return rows.filter((r): r is { deityEn: string; deityHi: string | null } => !!r.deityEn);
}

export async function templeOptions() {
  const scope = await getLaunchScope();
  return db.temple.findMany({ where: { active: true, ...templeScope(scope) }, select: { slug: true, nameEn: true, nameHi: true }, orderBy: { nameEn: "asc" }, take: 30 });
}

export async function categoryOptions(type?: ServiceType) {
  return db.category.findMany({
    where: { active: true, ...(type ? { OR: [{ type }, { type: null }] } : {}) },
    select: { slug: true, nameEn: true, nameHi: true, icon: true, imageUrl: true, type: true },
    orderBy: { sortOrder: "asc" },
  });
}

/* ─────────────────────────── Service detail ─────────────────────────── */

export async function getServiceBySlug(slug: string) {
  return db.service.findFirst({
    where: { slug, active: true },
    include: {
      packages: { orderBy: { sortOrder: "asc" } },
      addons: true,
      temple: true,
      category: true,
      festival: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true, avatarUrl: true } } },
      },
    },
  });
}

export type ServiceDetail = NonNullable<Awaited<ReturnType<typeof getServiceBySlug>>>;

export async function getRelatedServices(service: { id: string; type: ServiceType; categoryId: string | null; templeId: string | null }) {
  return db.service.findMany({
    where: {
      ...(await scopedServices()),
      id: { not: service.id },
      OR: [
        service.categoryId ? { categoryId: service.categoryId } : {},
        service.templeId ? { templeId: service.templeId } : {},
        { type: service.type },
      ].filter((x) => Object.keys(x).length > 0),
    },
    select: serviceCardSelect,
    orderBy: [{ featured: "desc" }, { bookingCount: "desc" }],
    take: 8,
  });
}

/* ─────────────────────────── Temples ─────────────────────────── */

export async function listTemples(q?: string) {
  const where: Prisma.TempleWhereInput = { active: true, ...templeScope(await getLaunchScope()) };
  if (q?.trim()) {
    where.OR = [
      { nameEn: { contains: q.trim() } },
      { nameHi: { contains: q.trim() } },
      { city: { contains: q.trim() } },
      { deityEn: { contains: q.trim() } },
      { deityHi: { contains: q.trim() } },
    ];
  }
  return db.temple.findMany({ where, orderBy: [{ featured: "desc" }, { nameEn: "asc" }], include: { _count: { select: { services: true } } } });
}

export async function getTempleBySlug(slug: string) {
  return db.temple.findFirst({
    where: { slug, active: true },
    include: {
      services: { where: activeService, select: serviceCardSelect, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }] },
      pandits: {
        where: { isActive: true, kycStatus: "APPROVED" },
        select: { id: true, displayName: true, displayNameHi: true, photoUrl: true, classification: true, verified: true, ratingAvg: true, ratingCount: true, experienceYears: true, city: true },
      },
    },
  });
}

/* ─────────────────────────── Festivals ─────────────────────────── */

export async function listFestivals(type?: string) {
  const today = toDateKey();
  return db.festival.findMany({
    where: { active: true, date: { gte: toDateKey(addDays(new Date(), -30)) }, ...(type && type !== "ALL" ? { type: type as Prisma.EnumFestivalTypeFilter["equals"] } : {}) },
    orderBy: { date: "asc" },
    take: 120,
    select: { id: true, slug: true, nameEn: true, nameHi: true, type: true, date: true, endDate: true, deityEn: true, deityHi: true, imageUrl: true, major: true, descriptionEn: true, descriptionHi: true },
  }).then((rows) => rows.filter((r) => r.date >= today || (r.endDate ?? r.date) >= today));
}

export async function festivalsInMonth(year: number, month: number) {
  const mm = String(month).padStart(2, "0");
  return db.festival.findMany({
    where: { active: true, date: { startsWith: `${year}-${mm}` } },
    orderBy: { date: "asc" },
    select: { id: true, slug: true, nameEn: true, nameHi: true, type: true, date: true, major: true },
  });
}

export async function getFestivalBySlug(slug: string) {
  return db.festival.findFirst({
    where: { slug, active: true },
    include: { services: { where: await scopedServices(), select: serviceCardSelect, take: 8 } },
  });
}

/* ─────────────────────────── Library ─────────────────────────── */

export async function listContent(opts: { type?: string; q?: string; deity?: string } = {}) {
  const where: Prisma.ContentItemWhereInput = { active: true };
  if (opts.type && opts.type !== "ALL") where.type = opts.type as Prisma.EnumContentTypeFilter["equals"];
  if (opts.deity) where.OR = [{ deityEn: { contains: opts.deity } }, { deityHi: { contains: opts.deity } }];
  if (opts.q?.trim()) {
    const q = opts.q.trim();
    where.AND = [{ OR: [{ titleEn: { contains: q } }, { titleHi: { contains: q } }, { deityEn: { contains: q } }, { deityHi: { contains: q } }, { tags: { contains: q } }] }];
  }
  return db.contentItem.findMany({
    where,
    orderBy: [{ featured: "desc" }, { views: "desc" }],
    take: 100,
    select: { id: true, slug: true, type: true, titleEn: true, titleHi: true, deityEn: true, deityHi: true, imageUrl: true, audioUrl: true, views: true },
  });
}

export async function contentDeities() {
  const rows = await db.contentItem.findMany({ where: { active: true, deityEn: { not: null } }, select: { deityEn: true, deityHi: true }, distinct: ["deityEn"], take: 24 });
  return rows.filter((r): r is { deityEn: string; deityHi: string | null } => !!r.deityEn);
}

export async function getContentBySlug(slug: string) {
  return db.contentItem.findFirst({ where: { slug, active: true } });
}

/* ─────────────────────────── Pandits ─────────────────────────── */

export type PanditFilters = { classification?: string; city?: string; language?: string; verifiedOnly?: boolean; q?: string };

export async function listPandits(f: PanditFilters = {}, opts: { anyCity?: boolean } = {}) {
  const where: Prisma.PanditProfileWhereInput = { isActive: true, kycStatus: "APPROVED" };
  const scope = await getLaunchScope();
  if (scope.only && scope.city && !opts.anyCity) {
    // Local mode: pandits who live in the launch city (their city is free text, so match in code).
    const city = scope.city;
    const all = await db.panditProfile.findMany({ where: { isActive: true, kycStatus: "APPROVED" }, select: { id: true, city: true } });
    where.id = { in: all.filter((p) => isCity(p.city, city)).map((p) => p.id) };
  }
  if (f.classification && f.classification !== "ALL") where.classification = f.classification as Prisma.EnumPanditClassificationFilter["equals"];
  if (f.city && f.city !== "ALL") where.city = { contains: f.city };
  if (f.language && f.language !== "ALL") where.languages = { contains: `"${f.language}"` };
  if (f.verifiedOnly) where.verified = true;
  if (f.q?.trim()) where.OR = [{ displayName: { contains: f.q.trim() } }, { displayNameHi: { contains: f.q.trim() } }];
  return db.panditProfile.findMany({
    where,
    orderBy: [{ featured: "desc" }, { ratingAvg: "desc" }, { completedCount: "desc" }],
    take: 60,
    select: {
      id: true, displayName: true, displayNameHi: true, photoUrl: true, classification: true, verified: true,
      experienceYears: true, ratingAvg: true, ratingCount: true, city: true, state: true, languages: true,
      specialities: true, servesAtHome: true, servesOnline: true, completedCount: true,
    },
  });
}

export async function panditCities() {
  if ((await getLaunchScope()).only) return [];
  const rows = await db.panditProfile.findMany({ where: { isActive: true, kycStatus: "APPROVED", city: { not: null } }, select: { city: true }, distinct: ["city"], take: 30 });
  return rows.map((r) => r.city).filter((c): c is string => !!c);
}

export async function getPanditById(id: string) {
  return db.panditProfile.findFirst({
    where: { id, isActive: true, kycStatus: "APPROVED" },
    include: {
      temple: { select: { slug: true, nameEn: true, nameHi: true, city: true } },
      services: { where: { active: true }, include: { service: { select: serviceCardSelect } } },
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true, avatarUrl: true } }, service: { select: { nameEn: true, nameHi: true } } } },
    },
  });
}

/** Astrologers for the /astrology hub. Consultations happen by phone or video, so any city. */
export async function listJyotishis(take = 8) {
  return listPandits({ classification: "JYOTISHI" }, { anyCity: true }).then((rows) => rows.slice(0, take));
}

/* ─────────────────────────── Bookings ─────────────────────────── */

export const bookingCardInclude = {
  service: { select: { slug: true, nameEn: true, nameHi: true, coverUrl: true, images: true, type: true } },
  temple: { select: { slug: true, nameEn: true, nameHi: true, city: true } },
  package: { select: { nameEn: true, nameHi: true } },
  payment: { select: { id: true, status: true, method: true, provider: true } },
} satisfies Prisma.BookingInclude;

export async function listBookings(userId: string) {
  return db.booking.findMany({ where: { userId }, include: bookingCardInclude, orderBy: { createdAt: "desc" } });
}

export async function getBooking(userId: string, id: string) {
  return db.booking.findFirst({
    where: { id, userId },
    include: {
      service: true,
      temple: true,
      package: true,
      payment: true,
      review: true,
      timeline: { orderBy: { createdAt: "asc" } },
      pandit: { select: { id: true, displayName: true, displayNameHi: true, photoUrl: true, classification: true, verified: true, ratingAvg: true, ratingCount: true, user: { select: { phone: true } } } },
      user: { select: { name: true, phone: true } },
    },
  });
}

/* ─────────────────────────── User-scoped bits ─────────────────────────── */

export async function getFavoriteIds(userId: string | null | undefined) {
  if (!userId) return new Set<string>();
  const rows = await db.favorite.findMany({ where: { userId }, select: { serviceId: true } });
  return new Set(rows.map((r) => r.serviceId));
}

export async function getFavoriteServices(userId: string) {
  const rows = await db.favorite.findMany({ where: { userId }, include: { service: { select: serviceCardSelect } }, orderBy: { createdAt: "desc" } });
  return rows.map((r) => r.service);
}

export async function getUnreadCount(userId: string | null | undefined) {
  if (!userId) return 0;
  return db.notification.count({ where: { userId, read: false } });
}

export async function listNotifications(userId: string) {
  return db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
}

export async function listFamilyMembers(userId: string) {
  return db.familyMember.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}

export async function listConsultations(userId: string) {
  return db.consultation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { pandit: { select: { id: true, displayName: true, displayNameHi: true, photoUrl: true } } },
  });
}

/* ─────────────────────────── Search ─────────────────────────── */

export async function searchAll(q: string) {
  const term = q.trim();
  if (!term) return { services: [], temples: [], festivals: [], content: [] };
  const [services, temples, festivals, content] = await Promise.all([
    listServices({ q: term, take: 20 }),
    db.temple.findMany({
      where: { active: true, ...templeScope(await getLaunchScope()), OR: [{ nameEn: { contains: term } }, { nameHi: { contains: term } }, { city: { contains: term } }, { deityEn: { contains: term } }, { deityHi: { contains: term } }] },
      take: 10,
      select: { id: true, slug: true, nameEn: true, nameHi: true, city: true, state: true, coverUrl: true, images: true, deityEn: true, deityHi: true, liveDarshanUrl: true },
    }),
    db.festival.findMany({
      where: { active: true, OR: [{ nameEn: { contains: term } }, { nameHi: { contains: term } }, { deityEn: { contains: term } }, { deityHi: { contains: term } }] },
      take: 10,
      orderBy: { date: "asc" },
      select: { id: true, slug: true, nameEn: true, nameHi: true, type: true, date: true, imageUrl: true, major: true },
    }),
    db.contentItem.findMany({
      where: { active: true, OR: [{ titleEn: { contains: term } }, { titleHi: { contains: term } }, { deityEn: { contains: term } }, { deityHi: { contains: term } }] },
      take: 10,
      select: { id: true, slug: true, type: true, titleEn: true, titleHi: true, deityEn: true, deityHi: true, imageUrl: true },
    }),
  ]);
  return { services, temples, festivals, content };
}

/** Whether a service can be booked under the current launch-city scope. */
export async function serviceAvailableHere(service: { templeId: string | null }) {
  const scope = await getLaunchScope();
  return { available: isServiceInScope(scope, service.templeId), city: scope.only ? scope.city : null };
}
