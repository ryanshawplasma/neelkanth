/**
 * DivyaDham database seed.
 *
 * Idempotent: every row is upserted by its natural key (slug / phone / email /
 * setting key / coupon code / booking code), and child collections that have no
 * natural key of their own (service packages and add-ons, KYC documents,
 * availability, booking timelines) are deleted and recreated for their parent.
 * Running it twice leaves the database in exactly the same state.
 *
 *     npm run db:seed        # seed / re-seed
 *     npm run db:reset       # drop, push the schema, then seed
 *
 * Before seeding, throwaway fixture rows left behind by earlier development
 * (categories, temples, services, festivals and content whose slug is not part of
 * this seed, plus the two placeholder users) are removed so the database matches
 * the catalogue exactly. Tables are never dropped.
 *
 * `tsx` does not load `.env`, so the file is parsed by hand below when the
 * variables the seed needs are missing from the environment.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

import { CATEGORIES, CATEGORY_SLUGS } from "@/data/categories";
import { TEMPLES } from "@/data/temples";
import { MAJOR_FESTIVALS, generateRecurringObservances } from "@/data/festivals";
import { SERVICES, SERVICE_SLUGS, type ServiceSeed } from "@/data/services";
import { CONTENT, CONTENT_SLUGS } from "@/data/content";
import {
  DEMO_BANNERS,
  DEMO_BOOKINGS,
  DEMO_CAMPAIGNS,
  DEMO_CONSULTATIONS,
  DEMO_COUPONS,
  DEMO_DEVOTEES,
  DEMO_NOTIFICATIONS,
  DEMO_PANDITS,
  DEMO_SETTINGS,
} from "@/data/demo";
import { maskDoc, toDateKey } from "@/lib/utils";

const db = new PrismaClient();

// ───────────────────────────── env ─────────────────────────────

/** Minimal `.env` reader — `tsx` does not load dotenv for us. */
function loadEnvFile() {
  for (const file of [".env.local", ".env"]) {
    let raw: string;
    try {
      raw = readFileSync(path.join(process.cwd(), file), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.DATABASE_URL) loadEnvFile();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@divyadham.app";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

// ───────────────────────────── helpers ─────────────────────────────

const J = (v: unknown) => JSON.stringify(v ?? []);

const NOW = new Date();
const dayKey = (offset: number) => toDateKey(new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + offset));
const dayTime = (offset: number, hour = 10) =>
  new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + offset, hour, 0, 0, 0);

const counts: Record<string, number> = {};
const tally = (key: string, n = 1) => {
  counts[key] = (counts[key] ?? 0) + n;
};

function step(label: string) {
  const started = Date.now();
  return () => console.log(`  · ${label} — ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

// ───────────────────────────── 0. cleanup of stale fixture rows ─────────────────────────────

/** Phones used by throwaway fixtures from earlier development. */
const STALE_PHONES = ["+919812345678", "+919000000099"];

async function cleanupStaleRows(festivalSlugs: string[]) {
  const done = step("cleaned up stale fixture rows");

  // 1. Users left behind by fixtures (and everything that hangs off them).
  const staleUsers = await db.user.findMany({
    where: { phone: { in: STALE_PHONES } },
    select: { id: true, pandit: { select: { id: true } } },
  });
  for (const u of staleUsers) {
    if (u.pandit) {
      await db.booking.updateMany({ where: { panditId: u.pandit.id }, data: { panditId: null } });
      await db.review.updateMany({ where: { panditId: u.pandit.id }, data: { panditId: null } });
      await db.consultation.updateMany({ where: { panditId: u.pandit.id }, data: { panditId: null } });
      await db.payout.deleteMany({ where: { panditId: u.pandit.id } });
    }
    await db.consultation.deleteMany({ where: { userId: u.id } });
    await db.review.deleteMany({ where: { userId: u.id } });
    await db.booking.deleteMany({ where: { userId: u.id } });
    await db.auditLog.updateMany({ where: { actorId: u.id }, data: { actorId: null } });
    await db.user.delete({ where: { id: u.id } });
    tally("removed.users");
  }

  // 2. Services that are no longer part of the catalogue.
  const staleServices = await db.service.findMany({ where: { slug: { notIn: SERVICE_SLUGS } }, select: { id: true } });
  if (staleServices.length) {
    const ids = staleServices.map((s) => s.id);
    await db.review.deleteMany({ where: { serviceId: { in: ids } } });
    await db.booking.deleteMany({ where: { serviceId: { in: ids } } });
    await db.service.deleteMany({ where: { id: { in: ids } } });
    tally("removed.services", ids.length);
  }

  // 3. Temples, festivals and categories that are no longer seeded.
  const staleTemples = await db.temple.findMany({ where: { slug: { notIn: TEMPLES.map((t) => t.slug) } }, select: { id: true } });
  if (staleTemples.length) {
    const ids = staleTemples.map((t) => t.id);
    await db.service.updateMany({ where: { templeId: { in: ids } }, data: { templeId: null } });
    await db.booking.updateMany({ where: { templeId: { in: ids } }, data: { templeId: null } });
    await db.panditProfile.updateMany({ where: { templeId: { in: ids } }, data: { templeId: null } });
    await db.temple.deleteMany({ where: { id: { in: ids } } });
    tally("removed.temples", ids.length);
  }

  const staleFestivals = await db.festival.findMany({ where: { slug: { notIn: festivalSlugs } }, select: { id: true } });
  if (staleFestivals.length) {
    const ids = staleFestivals.map((f) => f.id);
    await db.service.updateMany({ where: { festivalId: { in: ids } }, data: { festivalId: null } });
    await db.festival.deleteMany({ where: { id: { in: ids } } });
    tally("removed.festivals", ids.length);
  }

  const staleCategories = await db.category.findMany({ where: { slug: { notIn: CATEGORY_SLUGS } }, select: { id: true } });
  if (staleCategories.length) {
    const ids = staleCategories.map((c) => c.id);
    await db.service.updateMany({ where: { categoryId: { in: ids } }, data: { categoryId: null } });
    await db.category.deleteMany({ where: { id: { in: ids } } });
    tally("removed.categories", ids.length);
  }

  const staleContent = await db.contentItem.deleteMany({ where: { slug: { notIn: CONTENT_SLUGS } } });
  if (staleContent.count) tally("removed.content", staleContent.count);

  // 4. Banners, coupons and demo-account notifications left behind by fixtures.
  const staleBanners = await db.banner.deleteMany({ where: { titleEn: { notIn: DEMO_BANNERS.map((b) => b.titleEn) } } });
  if (staleBanners.count) tally("removed.banners", staleBanners.count);

  const staleCoupons = await db.coupon.deleteMany({ where: { code: { notIn: DEMO_COUPONS.map((c) => c.code) } } });
  if (staleCoupons.count) tally("removed.coupons", staleCoupons.count);

  const demoPhones = [...DEMO_PANDITS.map((p) => p.phone), ...DEMO_DEVOTEES.map((d) => d.phone)];
  const staleNotifications = await db.notification.deleteMany({
    where: {
      user: { phone: { in: demoPhones } },
      OR: [{ dedupeKey: null }, { dedupeKey: { notIn: DEMO_NOTIFICATIONS.map((n) => n.dedupeKey) } }],
    },
  });
  if (staleNotifications.count) tally("removed.notifications", staleNotifications.count);

  // Fixtures also left booking notifications on the admin account, which never
  // receives in-app notifications in this product.
  const staleAdminNotifications = await db.notification.deleteMany({ where: { user: { role: "ADMIN" }, dedupeKey: null } });
  if (staleAdminNotifications.count) tally("removed.notifications", staleAdminNotifications.count);

  done();
}

// ───────────────────────────── 1. settings ─────────────────────────────

async function seedSettings() {
  const done = step("settings");
  for (const [key, value] of Object.entries(DEMO_SETTINGS)) {
    await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
    tally("settings");
  }
  done();
}

// ───────────────────────────── 2. admin ─────────────────────────────

async function seedAdmin() {
  const done = step("admin user");
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: { email: ADMIN_EMAIL, passwordHash, name: "Admin", role: "ADMIN", onboarded: true, locale: "en" },
    update: { passwordHash, name: "Admin", role: "ADMIN", onboarded: true },
  });
  tally("users");
  done();
}

// ───────────────────────────── 3. categories ─────────────────────────────

async function seedCategories() {
  const done = step("categories");
  for (const c of CATEGORIES) {
    const data = {
      nameEn: c.nameEn,
      nameHi: c.nameHi,
      icon: c.icon,
      imageUrl: c.imageUrl,
      type: c.type ?? null,
      sortOrder: c.sortOrder,
      active: true,
    };
    await db.category.upsert({ where: { slug: c.slug }, create: { slug: c.slug, ...data }, update: data });
    tally("categories");
  }
  done();
}

// ───────────────────────────── 4. temples ─────────────────────────────

async function seedTemples() {
  const done = step("temples");
  for (const t of TEMPLES) {
    const cover = `/images/temples/${t.slug}.svg`;
    const data = {
      nameEn: t.nameEn,
      nameHi: t.nameHi,
      deityEn: t.deityEn,
      deityHi: t.deityHi,
      city: t.city,
      state: t.state,
      descriptionEn: t.descriptionEn,
      descriptionHi: t.descriptionHi,
      historyEn: t.historyEn,
      historyHi: t.historyHi,
      images: J([cover, `/images/temples/${t.slug}-alt.svg`]),
      coverUrl: cover,
      latitude: t.latitude,
      longitude: t.longitude,
      timings: t.timings,
      liveDarshanUrl: t.liveDarshanUrl,
      featured: t.featured,
      active: true,
    };
    await db.temple.upsert({ where: { slug: t.slug }, create: { slug: t.slug, ...data }, update: data });
    tally("temples");
  }
  done();
}

// ───────────────────────────── 5. festivals ─────────────────────────────

async function seedFestivals() {
  const done = step("festivals");
  const recurring = generateRecurringObservances("2026-09-01", "2027-12-31");
  const all = [...MAJOR_FESTIVALS, ...recurring];

  for (const f of all) {
    const data = {
      nameEn: f.nameEn,
      nameHi: f.nameHi,
      type: f.type,
      date: f.date,
      endDate: f.endDate,
      deityEn: f.deityEn,
      deityHi: f.deityHi,
      descriptionEn: f.descriptionEn,
      descriptionHi: f.descriptionHi,
      significanceEn: f.significanceEn,
      significanceHi: f.significanceHi,
      ritualsEn: J(f.ritualsEn),
      ritualsHi: J(f.ritualsHi),
      imageUrl: f.imageUrl,
      major: f.major,
      remindDaysBefore: J(f.remindDaysBefore),
      pushEnabled: true,
      active: true,
    };
    await db.festival.upsert({ where: { slug: f.slug }, create: { slug: f.slug, ...data }, update: data });
    tally(f.major ? "festivals.major" : "festivals.recurring");
  }
  done();
  return all.map((f) => f.slug);
}

// ───────────────────────────── 6. services ─────────────────────────────

async function seedServices() {
  const done = step("services, packages and add-ons");

  const categories = new Map((await db.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]));
  const temples = new Map((await db.temple.findMany({ select: { id: true, slug: true } })).map((t) => [t.slug, t.id]));
  const festivals = new Map((await db.festival.findMany({ select: { id: true, slug: true } })).map((f) => [f.slug, f.id]));

  let sortOrder = 0;
  for (const s of SERVICES as ServiceSeed[]) {
    sortOrder += 1;
    if (s.categorySlug && !categories.has(s.categorySlug)) throw new Error(`Service ${s.slug}: unknown category ${s.categorySlug}`);
    if (s.templeSlug && !temples.has(s.templeSlug)) throw new Error(`Service ${s.slug}: unknown temple ${s.templeSlug}`);
    if (s.festivalSlug && !festivals.has(s.festivalSlug)) throw new Error(`Service ${s.slug}: unknown festival ${s.festivalSlug}`);

    const data = {
      type: s.type,
      nameEn: s.nameEn,
      nameHi: s.nameHi,
      taglineEn: s.taglineEn,
      taglineHi: s.taglineHi,
      descriptionEn: s.descriptionEn,
      descriptionHi: s.descriptionHi,
      benefitsEn: J(s.benefitsEn),
      benefitsHi: J(s.benefitsHi),
      processEn: J(s.processEn),
      processHi: J(s.processHi),
      faqEn: J(s.faqEn),
      faqHi: J(s.faqHi),
      deityEn: s.deityEn,
      deityHi: s.deityHi,
      images: J(s.images),
      coverUrl: s.coverUrl,
      basePrice: s.basePrice,
      compareAtPrice: s.compareAtPrice,
      durationMin: s.durationMin,
      categoryId: s.categorySlug ? categories.get(s.categorySlug)! : null,
      templeId: s.templeSlug ? temples.get(s.templeSlug)! : null,
      festivalId: s.festivalSlug ? festivals.get(s.festivalSlug)! : null,
      availableFrom: s.availableFrom,
      availableTo: s.availableTo,
      nextDate: s.nextDate,
      slots: J(s.slots),
      tags: J(s.tags),
      featured: s.featured,
      trending: s.trending,
      active: true,
      requiresPandit: s.requiresPandit,
      ratingAvg: s.ratingAvg,
      ratingCount: s.ratingCount,
      bookingCount: s.bookingCount,
      sortOrder,
    };

    const service = await db.service.upsert({ where: { slug: s.slug }, create: { slug: s.slug, ...data }, update: data });
    tally("services");

    // Children have no natural key — replace them wholesale. Bookings keep a
    // nullable packageId, so detach before deleting to avoid an FK failure.
    const oldPackages = await db.servicePackage.findMany({ where: { serviceId: service.id }, select: { id: true } });
    if (oldPackages.length) {
      await db.booking.updateMany({ where: { packageId: { in: oldPackages.map((p) => p.id) } }, data: { packageId: null } });
      await db.servicePackage.deleteMany({ where: { serviceId: service.id } });
    }
    await db.serviceAddon.deleteMany({ where: { serviceId: service.id } });

    await db.servicePackage.createMany({
      data: s.packages.map((p, i) => ({
        serviceId: service.id,
        slug: p.slug,
        nameEn: p.nameEn,
        nameHi: p.nameHi,
        descriptionEn: p.descriptionEn,
        descriptionHi: p.descriptionHi,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        maxDevotees: p.maxDevotees,
        featuresEn: J(p.featuresEn),
        featuresHi: J(p.featuresHi),
        popular: p.popular,
        sortOrder: i + 1,
      })),
    });
    tally("packages", s.packages.length);

    if (s.addons.length) {
      await db.serviceAddon.createMany({
        data: s.addons.map((a) => ({
          serviceId: service.id,
          slug: a.slug,
          nameEn: a.nameEn,
          nameHi: a.nameHi,
          price: a.price,
          imageUrl: null,
        })),
      });
      tally("addons", s.addons.length);
    }
  }
  done();
}

// ───────────────────────────── 7. content library ─────────────────────────────

async function seedContent() {
  const done = step("content library");
  for (const c of CONTENT) {
    const data = {
      type: c.type,
      titleEn: c.titleEn,
      titleHi: c.titleHi,
      deityEn: c.deityEn,
      deityHi: c.deityHi,
      bodyHi: c.bodyHi,
      bodyEn: c.bodyEn,
      imageUrl: c.imageUrl,
      tags: J(c.tags),
      featured: c.featured,
      active: true,
    };
    await db.contentItem.upsert({ where: { slug: c.slug }, create: { slug: c.slug, ...data }, update: data });
    tally("content");
  }
  done();
}

// ───────────────────────────── 8. banners & coupons ─────────────────────────────

async function seedBanners() {
  const done = step("banners");
  for (const b of DEMO_BANNERS) {
    const data = {
      titleEn: b.titleEn,
      titleHi: b.titleHi,
      subtitleEn: b.subtitleEn,
      subtitleHi: b.subtitleHi,
      imageUrl: b.imageUrl,
      href: b.href,
      placement: b.placement,
      sortOrder: b.sortOrder,
      startsAt: b.startsAt,
      endsAt: b.endsAt,
      active: true,
    };
    const existing = await db.banner.findFirst({ where: { titleEn: b.titleEn } });
    if (existing) await db.banner.update({ where: { id: existing.id }, data });
    else await db.banner.create({ data });
    tally("banners");
  }
  done();
}

async function seedCoupons() {
  const done = step("coupons");
  for (const c of DEMO_COUPONS) {
    const data = {
      descriptionEn: c.descriptionEn,
      descriptionHi: c.descriptionHi,
      discountPct: c.discountPct,
      discountFlat: c.discountFlat,
      minAmount: c.minAmount,
      maxUses: c.maxUses,
      usedCount: c.usedCount,
      validFrom: c.validFrom,
      validTo: c.validTo,
      active: c.active,
    };
    await db.coupon.upsert({ where: { code: c.code }, create: { code: c.code, ...data }, update: data });
    tally("coupons");
  }
  done();
}

// ───────────────────────────── 9. pandits ─────────────────────────────

async function seedPandits() {
  const done = step("pandits, KYC, availability and offered services");

  const temples = new Map((await db.temple.findMany({ select: { id: true, slug: true } })).map((t) => [t.slug, t.id]));
  const services = new Map((await db.service.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));

  for (const p of DEMO_PANDITS) {
    const user = await db.user.upsert({
      where: { phone: p.phone },
      create: {
        phone: p.phone,
        name: p.name,
        role: "PANDIT",
        locale: "hi",
        avatarUrl: p.photoUrl,
        gotra: p.gotra,
        city: p.city,
        state: p.state,
        pincode: p.pincode,
        onboarded: true,
      },
      update: {
        name: p.name,
        role: "PANDIT",
        avatarUrl: p.photoUrl,
        gotra: p.gotra,
        city: p.city,
        state: p.state,
        pincode: p.pincode,
        onboarded: true,
      },
    });
    tally("users");

    const submitted = p.kycStatus === "SUBMITTED" || p.kycStatus === "APPROVED" || p.kycStatus === "REJECTED";
    const reviewed = p.kycStatus === "APPROVED" || p.kycStatus === "REJECTED";
    const profileData = {
      displayName: p.displayName,
      displayNameHi: p.displayNameHi,
      bio: p.bio,
      bioHi: p.bioHi,
      photoUrl: p.photoUrl,
      classification: p.classification,
      specialities: J(p.specialities),
      languages: J(p.languages),
      experienceYears: p.experienceYears,
      sampradaya: p.sampradaya,
      gotra: p.gotra,
      education: p.education,
      city: p.city,
      state: p.state,
      pincode: p.pincode,
      serviceRadiusKm: p.serviceRadiusKm,
      servesOnline: p.servesOnline,
      servesAtHome: p.servesAtHome,
      servesAtTemple: p.servesAtTemple,
      templeId: p.templeSlug ? (temples.get(p.templeSlug) ?? null) : null,
      kycStatus: p.kycStatus,
      kycSubmittedAt: submitted ? dayTime(-40) : null,
      kycReviewedAt: reviewed ? dayTime(-38) : null,
      kycReviewNote: p.kycReviewNote,
      verified: p.verified,
      featured: p.featured,
      isActive: p.isActive,
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
      completedCount: p.completedCount,
      commissionPct: p.commissionPct,
      bankAccountName: p.bankAccountName,
      bankAccountNo: p.bankAccountNo,
      bankIfsc: p.bankIfsc,
      upiId: p.upiId,
    };

    const profile = await db.panditProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...profileData },
      update: profileData,
    });
    tally("pandits");

    await db.kycDocument.deleteMany({ where: { panditId: profile.id } });
    if (p.documents.length) {
      await db.kycDocument.createMany({
        data: p.documents.map((d) => ({
          panditId: profile.id,
          type: d.type,
          fileUrl: d.fileUrl,
          docNumber: d.docNumber ? maskDoc(d.docNumber) : null,
          status: d.status,
          note: d.note,
        })),
      });
      tally("kycDocuments", p.documents.length);
    }

    await db.panditAvailability.deleteMany({ where: { panditId: profile.id } });
    if (p.availability.length) {
      await db.panditAvailability.createMany({
        data: p.availability.map((a) => ({
          panditId: profile.id,
          weekday: a.weekday,
          startTime: a.startTime,
          endTime: a.endTime,
          enabled: a.enabled,
        })),
      });
      tally("availability", p.availability.length);
    }

    await db.panditService.deleteMany({ where: { panditId: profile.id } });
    for (const slug of p.serviceSlugs) {
      const serviceId = services.get(slug);
      if (!serviceId) throw new Error(`Pandit ${p.phone} offers unknown service ${slug}`);
      await db.panditService.create({ data: { panditId: profile.id, serviceId, price: null, active: true } });
      tally("panditServices");
    }
  }
  done();
}

// ───────────────────────────── 10. devotees ─────────────────────────────

async function seedDevotees() {
  const done = step("devotees and family members");
  for (const d of DEMO_DEVOTEES) {
    const data = {
      name: d.name,
      role: "USER" as const,
      locale: d.locale,
      gender: d.gender,
      gotra: d.gotra,
      dob: d.dob,
      tob: d.tob,
      birthPlace: d.birthPlace,
      rashi: d.rashi,
      city: d.city,
      state: d.state,
      pincode: d.pincode,
      addressLine: d.addressLine,
      onboarded: d.onboarded,
      lastSeenAt: d.onboarded ? dayTime(0, 9) : null,
    };
    const user = await db.user.upsert({ where: { phone: d.phone }, create: { phone: d.phone, ...data }, update: data });
    tally("users");

    await db.familyMember.deleteMany({ where: { userId: user.id } });
    if (d.family.length) {
      await db.familyMember.createMany({
        data: d.family.map((f) => ({ userId: user.id, name: f.name, relation: f.relation, gotra: f.gotra, dob: f.dob })),
      });
      tally("familyMembers", d.family.length);
    }
  }
  done();
}

// ───────────────────────────── 11. bookings ─────────────────────────────

async function seedBookings() {
  const done = step("bookings, payments, timelines and reviews");

  const users = new Map(
    (await db.user.findMany({ where: { phone: { not: null } }, select: { id: true, phone: true, city: true, state: true, pincode: true, addressLine: true } })).map(
      (u) => [u.phone!, u],
    ),
  );
  const pandits = new Map(
    (await db.panditProfile.findMany({ select: { id: true, user: { select: { phone: true } } } })).map((p) => [p.user.phone!, p.id]),
  );
  const services = await db.service.findMany({
    where: { slug: { in: DEMO_BOOKINGS.map((b) => b.serviceSlug) } },
    select: { id: true, slug: true, type: true, templeId: true, packages: true, addons: true },
  });
  const serviceBySlug = new Map(services.map((s) => [s.slug, s]));
  const coupons = new Map((await db.coupon.findMany()).map((c) => [c.code, c]));

  const bookingIdsByCode = new Map<string, string>();

  for (const b of DEMO_BOOKINGS) {
    const user = users.get(b.userPhone);
    const service = serviceBySlug.get(b.serviceSlug);
    if (!user || !service) throw new Error(`Booking ${b.code}: unknown user or service`);

    const pkg = service.packages.find((p) => p.slug === b.packageSlug);
    if (!pkg) throw new Error(`Booking ${b.code}: service ${b.serviceSlug} has no "${b.packageSlug}" package`);

    const chosenAddons = b.addonSlugs.map((slug) => {
      const a = service.addons.find((x) => x.slug === slug);
      if (!a) throw new Error(`Booking ${b.code}: service ${b.serviceSlug} has no add-on "${slug}"`);
      return { slug: a.slug, name: a.nameEn, price: a.price };
    });

    const amountBase = pkg.price;
    const amountAddons = chosenAddons.reduce((sum, a) => sum + a.price, 0);
    const coupon = b.couponCode ? coupons.get(b.couponCode) : undefined;
    const subtotal = amountBase + amountAddons;
    let amountDiscount = 0;
    if (coupon && subtotal >= coupon.minAmount) {
      amountDiscount = coupon.discountFlat ?? Math.round((subtotal * (coupon.discountPct ?? 0)) / 100);
      amountDiscount = Math.min(amountDiscount, subtotal);
    }
    const amountTotal = subtotal - amountDiscount;

    const panditId = b.panditPhone ? (pandits.get(b.panditPhone) ?? null) : null;
    if (b.panditPhone && !panditId) throw new Error(`Booking ${b.code}: unknown pandit ${b.panditPhone}`);

    const data = {
      userId: user.id,
      serviceId: service.id,
      packageId: pkg.id,
      panditId,
      templeId: service.templeId,
      type: service.type,
      status: b.status,
      scheduledDate: dayKey(b.dayOffset),
      scheduledSlot: b.scheduledSlot,
      devotees: J(b.devotees),
      sankalpNote: b.sankalpNote,
      addons: J(chosenAddons),
      addressLine: b.useAddress ? user.addressLine : null,
      city: b.useAddress ? user.city : null,
      state: b.useAddress ? user.state : null,
      pincode: b.useAddress ? user.pincode : null,
      prasadDelivery: b.prasadDelivery,
      amountBase,
      amountAddons,
      amountDiscount,
      amountTotal,
      currency: "INR",
      couponCode: amountDiscount > 0 ? b.couponCode : null,
      liveLink: b.liveLink,
      videoUrl: b.videoUrl,
      photos: J(b.photos),
      panditNote: b.panditNote,
      adminNote: b.adminNote,
      cancelReason: b.cancelReason,
      completedAt: b.status === "COMPLETED" ? dayTime(b.dayOffset, 11) : null,
      createdAt: dayTime(b.createdDayOffset, 9),
    };

    const booking = await db.booking.upsert({ where: { code: b.code }, create: { code: b.code, ...data }, update: data });
    bookingIdsByCode.set(b.code, booking.id);
    tally("bookings");

    // Payment
    const paymentData = {
      provider: "mock",
      orderId: `order_demo_${b.code.replace(/-/g, "").toLowerCase()}`,
      paymentId: b.paymentStatus === "PAID" || b.paymentStatus === "REFUNDED" ? `pay_demo_${b.code.replace(/-/g, "").toLowerCase()}` : null,
      amount: amountTotal,
      currency: "INR",
      status: b.paymentStatus,
      method: b.paymentMethod,
      raw: J({ demo: true, code: b.code }),
      refundId: b.paymentStatus === "REFUNDED" ? `rfnd_demo_${b.code.replace(/-/g, "").toLowerCase()}` : null,
      refundedAt: b.paymentStatus === "REFUNDED" ? dayTime(b.dayOffset, 12) : null,
    };
    await db.payment.upsert({
      where: { bookingId: booking.id },
      create: { bookingId: booking.id, ...paymentData },
      update: paymentData,
    });
    tally("payments");

    // Timeline
    await db.bookingEvent.deleteMany({ where: { bookingId: booking.id } });
    await db.bookingEvent.createMany({
      data: b.timeline.map((e, i) => ({
        bookingId: booking.id,
        status: e.status,
        note: e.note,
        actorRole: e.actorRole,
        createdAt: dayTime(e.dayOffset, 9 + i),
      })),
    });
    tally("bookingEvents", b.timeline.length);

    // Review
    if (b.review) {
      const reviewData = {
        userId: user.id,
        serviceId: service.id,
        panditId,
        rating: b.review.rating,
        comment: b.review.comment,
        approved: true,
        createdAt: dayTime(b.dayOffset + 1, 20),
      };
      await db.review.upsert({
        where: { bookingId: booking.id },
        create: { bookingId: booking.id, ...reviewData },
        update: reviewData,
      });
      tally("reviews");
    } else {
      await db.review.deleteMany({ where: { bookingId: booking.id } });
    }
  }

  done();
  return bookingIdsByCode;
}

// ───────────────────────────── 12. notifications, campaign, consultations ─────────────────────────────

async function seedNotifications(bookingIds: Map<string, string>) {
  const done = step("notifications");
  for (const n of DEMO_NOTIFICATIONS) {
    const user = await db.user.findUnique({ where: { phone: n.userPhone }, select: { id: true } });
    if (!user) continue;

    let href = n.href;
    if (href.startsWith("booking:")) {
      const id = bookingIds.get(href.slice("booking:".length));
      href = id ? `/bookings/${id}` : "/bookings";
    }

    const data = {
      type: n.type,
      titleEn: n.titleEn,
      titleHi: n.titleHi,
      bodyEn: n.bodyEn,
      bodyHi: n.bodyHi,
      href,
      imageUrl: n.imageUrl,
      read: n.read,
      pushed: true,
      createdAt: dayTime(n.dayOffset, 8),
    };
    await db.notification.upsert({
      where: { userId_dedupeKey: { userId: user.id, dedupeKey: n.dedupeKey } },
      create: { userId: user.id, dedupeKey: n.dedupeKey, ...data },
      update: data,
    });
    tally("notifications");
  }
  done();
}

async function seedCampaigns() {
  const done = step("campaigns");
  for (const c of DEMO_CAMPAIGNS) {
    const data = {
      titleHi: c.titleHi,
      bodyEn: c.bodyEn,
      bodyHi: c.bodyHi,
      href: c.href,
      imageUrl: c.imageUrl,
      audience: c.audience,
      status: c.status,
      sentCount: c.sentCount,
      sentAt: c.status === "SENT" ? dayTime(c.sentDayOffset, 10) : null,
      scheduledAt: null,
    };
    const existing = await db.campaign.findFirst({ where: { titleEn: c.titleEn } });
    if (existing) await db.campaign.update({ where: { id: existing.id }, data });
    else await db.campaign.create({ data: { titleEn: c.titleEn, ...data } });
    tally("campaigns");
  }
  done();
}

async function seedConsultations() {
  const done = step("consultations");
  for (const c of DEMO_CONSULTATIONS) {
    const user = await db.user.findUnique({ where: { phone: c.userPhone }, select: { id: true } });
    if (!user) continue;
    let panditId: string | null = null;
    if (c.panditPhone) {
      const p = await db.panditProfile.findFirst({ where: { user: { phone: c.panditPhone } }, select: { id: true } });
      panditId = p?.id ?? null;
    }
    const data = {
      panditId,
      question: c.question,
      mode: c.mode,
      scheduledAt: c.scheduledDayOffset === null ? null : dayTime(c.scheduledDayOffset, 18),
      status: c.status,
      answer: c.answer,
      meetingLink: c.meetingLink,
      amount: c.amount,
      createdAt: dayTime(c.createdDayOffset, 11),
    };
    const existing = await db.consultation.findFirst({ where: { userId: user.id, topic: c.topic } });
    if (existing) await db.consultation.update({ where: { id: existing.id }, data });
    else await db.consultation.create({ data: { userId: user.id, topic: c.topic, ...data } });
    tally("consultations");
  }
  done();
}

// ───────────────────────────── run ─────────────────────────────

async function main() {
  const started = Date.now();
  console.log("\nDivyaDham — seeding\n");

  const festivalSlugs = [...MAJOR_FESTIVALS, ...generateRecurringObservances("2026-09-01", "2027-12-31")].map((f) => f.slug);
  await cleanupStaleRows(festivalSlugs);

  await seedSettings();
  await seedAdmin();
  await seedCategories();
  await seedTemples();
  await seedFestivals();
  await seedServices();
  await seedContent();
  await seedBanners();
  await seedCoupons();
  await seedPandits();
  await seedDevotees();
  const bookingIds = await seedBookings();
  await seedNotifications(bookingIds);
  await seedCampaigns();
  await seedConsultations();

  console.log("\nSeeded rows");
  for (const key of Object.keys(counts).sort()) console.log(`  ${key.padEnd(22)} ${counts[key]}`);

  console.log("\nDatabase totals");
  const totals: Record<string, number> = {
    users: await db.user.count(),
    pandits: await db.panditProfile.count(),
    kycDocuments: await db.kycDocument.count(),
    availability: await db.panditAvailability.count(),
    panditServices: await db.panditService.count(),
    categories: await db.category.count(),
    temples: await db.temple.count(),
    festivals: await db.festival.count(),
    services: await db.service.count(),
    servicePackages: await db.servicePackage.count(),
    serviceAddons: await db.serviceAddon.count(),
    contentItems: await db.contentItem.count(),
    banners: await db.banner.count(),
    coupons: await db.coupon.count(),
    bookings: await db.booking.count(),
    bookingEvents: await db.bookingEvent.count(),
    payments: await db.payment.count(),
    reviews: await db.review.count(),
    familyMembers: await db.familyMember.count(),
    notifications: await db.notification.count(),
    campaigns: await db.campaign.count(),
    consultations: await db.consultation.count(),
    settings: await db.setting.count(),
  };
  for (const key of Object.keys(totals)) console.log(`  ${key.padEnd(22)} ${totals[key]}`);

  console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log(`Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log("Devotees: 9111111111, 9222222222, 9333333333 · Pandits: 9000000001–9000000006 · OTP 123456\n");
}

main()
  .catch((e) => {
    console.error(e instanceof Prisma.PrismaClientKnownRequestError ? `${e.code}: ${e.message}` : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
