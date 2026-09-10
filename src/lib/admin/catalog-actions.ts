"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";
import { formatDate, slugify, toJson } from "@/lib/utils";

export type Result = { ok: boolean; error?: string; id?: string; count?: number };

const SERVICE_TYPES = ["ONLINE_POOJA", "PANDIT_AT_HOME", "CHADHAVA", "ASTROLOGY", "PRASAD", "KATHA", "LIVE_DARSHAN"] as const;
const FESTIVAL_TYPES = ["FESTIVAL", "VRAT", "EKADASHI", "PURNIMA", "AMAVASYA", "JAYANTI", "SANKRANTI", "PRADOSH", "SPECIAL"] as const;
const CONTENT_TYPES = ["AARTI", "CHALISA", "MANTRA", "STOTRA", "BHAJAN", "KATHA", "ARTICLE"] as const;

// ─────────────────────────── Categories ───────────────────────────

const categorySchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(80).optional().default(""),
  nameEn: z.string().min(2).max(80),
  nameHi: z.string().min(1).max(80),
  icon: z.string().max(40).optional().default(""),
  imageUrl: z.string().max(400).optional().default(""),
  type: z.union([z.enum(SERVICE_TYPES), z.literal("")]).optional().default(""),
  sortOrder: z.number().int().min(0).max(999).default(0),
  active: z.boolean().default(true),
});

export async function saveCategoryAction(input: z.input<typeof categorySchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  const d = parsed.data;
  const slug = slugify(d.slug || d.nameEn);
  if (!slug) return { ok: false, error: "admin.errSlugRequired" };

  const clash = await db.category.findUnique({ where: { slug } });
  if (clash && clash.id !== d.id) return { ok: false, error: "admin.errSlugTaken" };

  const data = {
    slug,
    nameEn: d.nameEn,
    nameHi: d.nameHi,
    icon: d.icon || null,
    imageUrl: d.imageUrl || null,
    type: d.type ? d.type : null,
    sortOrder: d.sortOrder,
    active: d.active,
  };
  const row = d.id ? await db.category.update({ where: { id: d.id }, data }) : await db.category.create({ data });
  await audit(admin.id, d.id ? "category.update" : "category.create", "Category", row.id, { slug });
  revalidatePath("/admin/categories");
  return { ok: true, id: row.id };
}

export async function deleteCategoryAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  const cat = await db.category.findUnique({ where: { id }, include: { _count: { select: { services: true } } } });
  if (!cat) return { ok: false, error: "admin.errNotFound" };
  if (cat._count.services > 0) return { ok: false, error: "admin.errCategoryInUse" };
  await db.category.delete({ where: { id } });
  await audit(admin.id, "category.delete", "Category", id, { slug: cat.slug });
  revalidatePath("/admin/categories");
  return { ok: true };
}

// ─────────────────────────── Temples ───────────────────────────

const templeSchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(120).optional().default(""),
  nameEn: z.string().min(2).max(160),
  nameHi: z.string().min(1).max(160),
  deityEn: z.string().max(120).optional().default(""),
  deityHi: z.string().max(120).optional().default(""),
  city: z.string().min(1).max(80),
  state: z.string().min(1).max(80),
  descriptionEn: z.string().max(4000).optional().default(""),
  descriptionHi: z.string().max(4000).optional().default(""),
  historyEn: z.string().max(6000).optional().default(""),
  historyHi: z.string().max(6000).optional().default(""),
  images: z.array(z.string().max(400)).max(10).default([]),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  timings: z.string().max(160).optional().default(""),
  liveDarshanUrl: z.string().max(400).optional().default(""),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export async function saveTempleAction(input: z.input<typeof templeSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = templeSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
  }
  const d = parsed.data;
  const slug = slugify(d.slug || d.nameEn);
  if (!slug) return { ok: false, error: "admin.errSlugRequired" };
  const clash = await db.temple.findUnique({ where: { slug } });
  if (clash && clash.id !== d.id) return { ok: false, error: "admin.errSlugTaken" };

  const images = d.images.filter(Boolean);
  const data = {
    slug,
    nameEn: d.nameEn,
    nameHi: d.nameHi,
    deityEn: d.deityEn || null,
    deityHi: d.deityHi || null,
    city: d.city,
    state: d.state,
    descriptionEn: d.descriptionEn || null,
    descriptionHi: d.descriptionHi || null,
    historyEn: d.historyEn || null,
    historyHi: d.historyHi || null,
    images: toJson(images),
    coverUrl: images[0] ?? null,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    timings: d.timings || null,
    liveDarshanUrl: d.liveDarshanUrl || null,
    featured: d.featured,
    active: d.active,
  };
  const row = d.id ? await db.temple.update({ where: { id: d.id }, data }) : await db.temple.create({ data });
  await audit(admin.id, d.id ? "temple.update" : "temple.create", "Temple", row.id, { slug });
  revalidatePath("/admin/temples");
  revalidatePath(`/admin/temples/${row.id}`);
  revalidatePath(`/temples/${slug}`);
  return { ok: true, id: row.id };
}

export async function deleteTempleAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  const temple = await db.temple.findUnique({ where: { id }, include: { _count: { select: { services: true, bookings: true, pandits: true } } } });
  if (!temple) return { ok: false, error: "admin.errNotFound" };
  if (temple._count.services > 0 || temple._count.bookings > 0 || temple._count.pandits > 0) return { ok: false, error: "admin.errTempleInUse" };
  await db.temple.delete({ where: { id } });
  await audit(admin.id, "temple.delete", "Temple", id, { slug: temple.slug });
  revalidatePath("/admin/temples");
  return { ok: true };
}

export async function toggleTempleFlagAction(id: string, flag: "featured" | "active", value: boolean): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.object({ flag: z.enum(["featured", "active"]), value: z.boolean() }).safeParse({ flag, value });
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  await db.temple.update({ where: { id }, data: { [parsed.data.flag]: parsed.data.value } });
  await audit(admin.id, `temple.flag.${flag}`, "Temple", id, { value });
  revalidatePath("/admin/temples");
  return { ok: true };
}

// ─────────────────────────── Festivals ───────────────────────────

const festivalSchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(120).optional().default(""),
  nameEn: z.string().min(2).max(160),
  nameHi: z.string().min(1).max(160),
  type: z.enum(FESTIVAL_TYPES).default("FESTIVAL"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date"),
  endDate: z.string().optional().default(""),
  deityEn: z.string().max(120).optional().default(""),
  deityHi: z.string().max(120).optional().default(""),
  descriptionEn: z.string().max(3000).optional().default(""),
  descriptionHi: z.string().max(3000).optional().default(""),
  significanceEn: z.string().max(3000).optional().default(""),
  significanceHi: z.string().max(3000).optional().default(""),
  ritualsEn: z.array(z.string().max(300)).max(20).default([]),
  ritualsHi: z.array(z.string().max(300)).max(20).default([]),
  imageUrl: z.string().max(400).optional().default(""),
  major: z.boolean().default(false),
  remindDaysBefore: z.array(z.number().int().min(0).max(60)).max(8).default([7, 3, 1, 0]),
  pushEnabled: z.boolean().default(true),
  active: z.boolean().default(true),
});

export async function saveFestivalAction(input: z.input<typeof festivalSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = festivalSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
  }
  const d = parsed.data;
  const slug = slugify(d.slug || d.nameEn);
  if (!slug) return { ok: false, error: "admin.errSlugRequired" };
  const clash = await db.festival.findUnique({ where: { slug } });
  if (clash && clash.id !== d.id) return { ok: false, error: "admin.errSlugTaken" };

  const data = {
    slug,
    nameEn: d.nameEn,
    nameHi: d.nameHi,
    type: d.type,
    date: d.date,
    endDate: d.endDate || null,
    deityEn: d.deityEn || null,
    deityHi: d.deityHi || null,
    descriptionEn: d.descriptionEn || null,
    descriptionHi: d.descriptionHi || null,
    significanceEn: d.significanceEn || null,
    significanceHi: d.significanceHi || null,
    ritualsEn: toJson(d.ritualsEn.filter(Boolean)),
    ritualsHi: toJson(d.ritualsHi.filter(Boolean)),
    imageUrl: d.imageUrl || null,
    major: d.major,
    remindDaysBefore: toJson([...new Set(d.remindDaysBefore)].sort((a, b) => b - a)),
    pushEnabled: d.pushEnabled,
    active: d.active,
  };
  const row = d.id ? await db.festival.update({ where: { id: d.id }, data }) : await db.festival.create({ data });
  await audit(admin.id, d.id ? "festival.update" : "festival.create", "Festival", row.id, { slug, date: d.date });
  revalidatePath("/admin/festivals");
  revalidatePath(`/admin/festivals/${row.id}`);
  revalidatePath(`/festivals/${slug}`);
  return { ok: true, id: row.id };
}

export async function deleteFestivalAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  const fest = await db.festival.findUnique({ where: { id }, include: { _count: { select: { services: true } } } });
  if (!fest) return { ok: false, error: "admin.errNotFound" };
  if (fest._count.services > 0) return { ok: false, error: "admin.errFestivalInUse" };
  await db.festival.delete({ where: { id } });
  await audit(admin.id, "festival.delete", "Festival", id, { slug: fest.slug });
  revalidatePath("/admin/festivals");
  return { ok: true };
}

/**
 * Immediate festival push to every active devotee & pandit.
 * Deduped by `festival:<slug>:manual:<timestamp>` so re-sending is deliberate.
 */
export async function sendFestivalReminderNowAction(festivalId: string): Promise<Result> {
  const admin = await requireAdmin();
  const fest = await db.festival.findUnique({
    where: { id: festivalId },
    include: { services: { where: { active: true }, take: 1, orderBy: { featured: "desc" } } },
  });
  if (!fest) return { ok: false, error: "admin.errNotFound" };

  const users = await db.user.findMany({ where: { isBlocked: false, role: { in: ["USER", "PANDIT"] } }, select: { id: true } });
  const svc = fest.services[0];
  const stamp = Date.now();
  let count = 0;
  for (const u of users) {
    const r = await notifyUser({
      userId: u.id,
      type: "FESTIVAL_REMINDER",
      titleEn: `${fest.nameEn} · ${formatDate(fest.date, "en")} 🪔`,
      titleHi: `${fest.nameHi} · ${formatDate(fest.date, "hi")} 🪔`,
      bodyEn: svc ? `Book ${svc.nameEn} in advance.` : fest.descriptionEn ?? "",
      bodyHi: svc ? `${svc.nameHi} पहले से बुक करें।` : fest.descriptionHi ?? "",
      href: svc ? `/pooja/${svc.slug}` : `/festivals/${fest.slug}`,
      imageUrl: fest.imageUrl ?? undefined,
      dedupeKey: `festival:${fest.slug}:manual:${stamp}`,
    });
    if (r.created) count++;
  }
  await audit(admin.id, "festival.reminder_now", "Festival", festivalId, { count, slug: fest.slug });
  revalidatePath("/admin/festivals");
  revalidatePath("/admin/notifications");
  return { ok: true, count };
}

// ─────────────────────────── Content library ───────────────────────────

const contentSchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(120).optional().default(""),
  type: z.enum(CONTENT_TYPES).default("AARTI"),
  titleEn: z.string().min(2).max(160),
  titleHi: z.string().min(1).max(160),
  deityEn: z.string().max(120).optional().default(""),
  deityHi: z.string().max(120).optional().default(""),
  bodyHi: z.string().min(1).max(40000),
  bodyEn: z.string().max(40000).optional().default(""),
  audioUrl: z.string().max(400).optional().default(""),
  imageUrl: z.string().max(400).optional().default(""),
  tags: z.array(z.string().max(40)).max(20).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export async function saveContentAction(input: z.input<typeof contentSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
  }
  const d = parsed.data;
  const slug = slugify(d.slug || d.titleEn);
  if (!slug) return { ok: false, error: "admin.errSlugRequired" };
  const clash = await db.contentItem.findUnique({ where: { slug } });
  if (clash && clash.id !== d.id) return { ok: false, error: "admin.errSlugTaken" };

  const data = {
    slug,
    type: d.type,
    titleEn: d.titleEn,
    titleHi: d.titleHi,
    deityEn: d.deityEn || null,
    deityHi: d.deityHi || null,
    bodyHi: d.bodyHi,
    bodyEn: d.bodyEn || null,
    audioUrl: d.audioUrl || null,
    imageUrl: d.imageUrl || null,
    tags: toJson(d.tags.filter(Boolean)),
    featured: d.featured,
    active: d.active,
  };
  const row = d.id ? await db.contentItem.update({ where: { id: d.id }, data }) : await db.contentItem.create({ data });
  await audit(admin.id, d.id ? "content.update" : "content.create", "ContentItem", row.id, { slug, type: d.type });
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${row.id}`);
  revalidatePath(`/library/${slug}`);
  return { ok: true, id: row.id };
}

export async function deleteContentAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  const row = await db.contentItem.findUnique({ where: { id } });
  if (!row) return { ok: false, error: "admin.errNotFound" };
  await db.contentItem.delete({ where: { id } });
  await audit(admin.id, "content.delete", "ContentItem", id, { slug: row.slug });
  revalidatePath("/admin/content");
  return { ok: true };
}

// ─────────────────────────── Banners ───────────────────────────

const bannerSchema = z.object({
  id: z.string().optional(),
  titleEn: z.string().min(2).max(120),
  titleHi: z.string().min(1).max(120),
  subtitleEn: z.string().max(200).optional().default(""),
  subtitleHi: z.string().max(200).optional().default(""),
  imageUrl: z.string().max(400).optional().default(""),
  href: z.string().max(300).optional().default(""),
  placement: z.string().min(1).max(40).default("home"),
  sortOrder: z.number().int().min(0).max(999).default(0),
  active: z.boolean().default(true),
  startsAt: z.string().max(10).optional().default(""),
  endsAt: z.string().max(10).optional().default(""),
});

export async function saveBannerAction(input: z.input<typeof bannerSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  const d = parsed.data;
  const data = {
    titleEn: d.titleEn,
    titleHi: d.titleHi,
    subtitleEn: d.subtitleEn || null,
    subtitleHi: d.subtitleHi || null,
    imageUrl: d.imageUrl || null,
    href: d.href || null,
    placement: d.placement,
    sortOrder: d.sortOrder,
    active: d.active,
    startsAt: d.startsAt || null,
    endsAt: d.endsAt || null,
  };
  const row = d.id ? await db.banner.update({ where: { id: d.id }, data }) : await db.banner.create({ data });
  await audit(admin.id, d.id ? "banner.update" : "banner.create", "Banner", row.id, { placement: d.placement });
  revalidatePath("/admin/banners");
  return { ok: true, id: row.id };
}

export async function deleteBannerAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  await db.banner.delete({ where: { id } }).catch(() => null);
  await audit(admin.id, "banner.delete", "Banner", id);
  revalidatePath("/admin/banners");
  return { ok: true };
}

// ─────────────────────────── Coupons ───────────────────────────

const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3).max(24),
  descriptionEn: z.string().max(200).optional().default(""),
  descriptionHi: z.string().max(200).optional().default(""),
  discountPct: z.number().int().min(0).max(100).nullable().optional(),
  discountFlat: z.number().int().min(0).max(100000).nullable().optional(),
  minAmount: z.number().int().min(0).max(1000000).default(0),
  maxUses: z.number().int().min(0).max(1000000).nullable().optional(),
  validFrom: z.string().max(10).optional().default(""),
  validTo: z.string().max(10).optional().default(""),
  active: z.boolean().default(true),
});

export async function saveCouponAction(input: z.input<typeof couponSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  const d = parsed.data;
  if (!d.discountPct && !d.discountFlat) return { ok: false, error: "admin.errDiscountRequired" };

  const code = d.code.trim().toUpperCase();
  const clash = await db.coupon.findUnique({ where: { code } });
  if (clash && clash.id !== d.id) return { ok: false, error: "admin.errCodeTaken" };

  const data = {
    code,
    descriptionEn: d.descriptionEn || null,
    descriptionHi: d.descriptionHi || null,
    discountPct: d.discountPct ?? null,
    discountFlat: d.discountFlat ?? null,
    minAmount: d.minAmount,
    maxUses: d.maxUses ?? null,
    validFrom: d.validFrom || null,
    validTo: d.validTo || null,
    active: d.active,
  };
  const row = d.id ? await db.coupon.update({ where: { id: d.id }, data }) : await db.coupon.create({ data });
  await audit(admin.id, d.id ? "coupon.update" : "coupon.create", "Coupon", row.id, { code });
  revalidatePath("/admin/coupons");
  return { ok: true, id: row.id };
}

export async function deleteCouponAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  const row = await db.coupon.findUnique({ where: { id } });
  if (!row) return { ok: false, error: "admin.errNotFound" };
  await db.coupon.delete({ where: { id } });
  await audit(admin.id, "coupon.delete", "Coupon", id, { code: row.code });
  revalidatePath("/admin/coupons");
  return { ok: true };
}
