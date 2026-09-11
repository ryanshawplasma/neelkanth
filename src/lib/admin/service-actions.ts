"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";
import { slugify, toJson } from "@/lib/utils";

export type Result = { ok: boolean; error?: string; id?: string };

const SERVICE_TYPES = ["ONLINE_POOJA", "PANDIT_AT_HOME", "CHADHAVA", "ASTROLOGY", "PRASAD", "KATHA", "LIVE_DARSHAN"] as const;

const packageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).max(60),
  nameEn: z.string().min(1).max(120),
  nameHi: z.string().min(1).max(120),
  descriptionEn: z.string().max(400).optional().default(""),
  descriptionHi: z.string().max(400).optional().default(""),
  price: z.number().int().min(0).max(10000000),
  compareAtPrice: z.number().int().min(0).max(10000000).nullable().optional(),
  maxDevotees: z.number().int().min(1).max(50).default(1),
  featuresEn: z.array(z.string().max(200)).max(20).default([]),
  featuresHi: z.array(z.string().max(200)).max(20).default([]),
  popular: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(99).default(0),
});

const addonSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).max(60),
  nameEn: z.string().min(1).max(120),
  nameHi: z.string().min(1).max(120),
  price: z.number().int().min(0).max(1000000),
  imageUrl: z.string().max(400).optional().default(""),
});

const faqSchema = z.array(z.object({ q: z.string().max(300), a: z.string().max(2000) })).max(20);

const serviceSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2).max(120),
  type: z.enum(SERVICE_TYPES),
  nameEn: z.string().min(2).max(160),
  nameHi: z.string().min(1).max(160),
  taglineEn: z.string().max(200).optional().default(""),
  taglineHi: z.string().max(200).optional().default(""),
  descriptionEn: z.string().max(5000).optional().default(""),
  descriptionHi: z.string().max(5000).optional().default(""),
  benefitsEn: z.array(z.string().max(300)).max(20).default([]),
  benefitsHi: z.array(z.string().max(300)).max(20).default([]),
  processEn: z.array(z.string().max(300)).max(20).default([]),
  processHi: z.array(z.string().max(300)).max(20).default([]),
  faqEn: faqSchema.default([]),
  faqHi: faqSchema.default([]),
  deityEn: z.string().max(120).optional().default(""),
  deityHi: z.string().max(120).optional().default(""),
  images: z.array(z.string().max(400)).max(10).default([]),
  basePrice: z.number().int().min(0).max(10000000),
  compareAtPrice: z.number().int().min(0).max(10000000).nullable().optional(),
  durationMin: z.number().int().min(0).max(10080).nullable().optional(),
  categoryId: z.string().optional().nullable(),
  templeId: z.string().optional().nullable(),
  festivalId: z.string().optional().nullable(),
  availableFrom: z.string().max(10).optional().default(""),
  availableTo: z.string().max(10).optional().default(""),
  nextDate: z.string().max(10).optional().default(""),
  slots: z.array(z.string().max(10)).max(24).default([]),
  tags: z.array(z.string().max(40)).max(20).default([]),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  active: z.boolean().default(true),
  requiresPandit: z.boolean().default(true),
  ratingAvg: z.number().min(0).max(5).default(4.8),
  ratingCount: z.number().int().min(0).default(0),
  bookingCount: z.number().int().min(0).default(0),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  packages: z.array(packageSchema).max(8).default([]),
  addons: z.array(addonSchema).max(12).default([]),
});

export type ServiceInput = z.input<typeof serviceSchema>;

/**
 * Creates or updates a service together with its packages and addons.
 * Packages/addons are reconciled (update / create / delete) inside one
 * transaction; rows still referenced by a booking are never deleted.
 */
export async function saveServiceAction(input: ServiceInput): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
  }
  const d = parsed.data;
  const slug = slugify(d.slug || d.nameEn);
  if (!slug) return { ok: false, error: "admin.errSlugRequired" };

  const clash = await db.service.findUnique({ where: { slug } });
  if (clash && clash.id !== d.id) return { ok: false, error: "admin.errSlugTaken" };

  const data = {
    slug,
    type: d.type,
    nameEn: d.nameEn,
    nameHi: d.nameHi,
    taglineEn: d.taglineEn || null,
    taglineHi: d.taglineHi || null,
    descriptionEn: d.descriptionEn || null,
    descriptionHi: d.descriptionHi || null,
    benefitsEn: toJson(d.benefitsEn.filter(Boolean)),
    benefitsHi: toJson(d.benefitsHi.filter(Boolean)),
    processEn: toJson(d.processEn.filter(Boolean)),
    processHi: toJson(d.processHi.filter(Boolean)),
    faqEn: toJson(d.faqEn.filter((f) => f.q)),
    faqHi: toJson(d.faqHi.filter((f) => f.q)),
    deityEn: d.deityEn || null,
    deityHi: d.deityHi || null,
    images: toJson(d.images.filter(Boolean)),
    coverUrl: d.images.filter(Boolean)[0] ?? null,
    basePrice: d.basePrice,
    compareAtPrice: d.compareAtPrice ?? null,
    durationMin: d.durationMin ?? null,
    categoryId: d.categoryId || null,
    templeId: d.templeId || null,
    festivalId: d.festivalId || null,
    availableFrom: d.availableFrom || null,
    availableTo: d.availableTo || null,
    nextDate: d.nextDate || null,
    slots: toJson(d.slots.filter(Boolean)),
    tags: toJson(d.tags.filter(Boolean)),
    featured: d.featured,
    trending: d.trending,
    active: d.active,
    requiresPandit: d.requiresPandit,
    ratingAvg: d.ratingAvg,
    ratingCount: d.ratingCount,
    bookingCount: d.bookingCount,
    sortOrder: d.sortOrder,
  };

  const serviceId = await db.$transaction(async (tx) => {
    const service = d.id
      ? await tx.service.update({ where: { id: d.id }, data })
      : await tx.service.create({ data });

    // packages
    const existingPkgs = await tx.servicePackage.findMany({ where: { serviceId: service.id }, include: { _count: { select: { bookings: true } } } });
    const keptPkgIds = new Set(d.packages.map((p) => p.id).filter(Boolean) as string[]);
    for (const old of existingPkgs) {
      if (!keptPkgIds.has(old.id) && old._count.bookings === 0) await tx.servicePackage.delete({ where: { id: old.id } });
    }
    for (const [i, p] of d.packages.entries()) {
      const payload = {
        serviceId: service.id,
        slug: slugify(p.slug || p.nameEn) || `pkg-${i + 1}`,
        nameEn: p.nameEn,
        nameHi: p.nameHi,
        descriptionEn: p.descriptionEn || null,
        descriptionHi: p.descriptionHi || null,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        maxDevotees: p.maxDevotees,
        featuresEn: toJson(p.featuresEn.filter(Boolean)),
        featuresHi: toJson(p.featuresHi.filter(Boolean)),
        popular: p.popular,
        sortOrder: p.sortOrder || i,
      };
      if (p.id && existingPkgs.some((e) => e.id === p.id)) await tx.servicePackage.update({ where: { id: p.id }, data: payload });
      else await tx.servicePackage.create({ data: payload });
    }

    // addons (never referenced by FK — safe to replace)
    await tx.serviceAddon.deleteMany({ where: { serviceId: service.id } });
    for (const [i, a] of d.addons.entries()) {
      await tx.serviceAddon.create({
        data: {
          serviceId: service.id,
          slug: slugify(a.slug || a.nameEn) || `addon-${i + 1}`,
          nameEn: a.nameEn,
          nameHi: a.nameHi,
          price: a.price,
          imageUrl: a.imageUrl || null,
        },
      });
    }
    return service.id;
  });

  await audit(admin.id, d.id ? "service.update" : "service.create", "Service", serviceId, {
    slug,
    packages: d.packages.length,
    addons: d.addons.length,
  });
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${serviceId}`);
  revalidatePath(`/pooja/${slug}`);
  return { ok: true, id: serviceId };
}

const FLAGS = ["featured", "trending", "active"] as const;

export async function toggleServiceFlagAction(id: string, flag: (typeof FLAGS)[number], value: boolean): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = z.object({ flag: z.enum(FLAGS), value: z.boolean() }).safeParse({ flag, value });
  if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
  await db.service.update({ where: { id }, data: { [parsed.data.flag]: parsed.data.value } });
  await audit(admin.id, `service.flag.${parsed.data.flag}`, "Service", id, { value: parsed.data.value });
  revalidatePath("/admin/services");
  return { ok: true };
}

/** Deep-copies a service (packages + addons) as an inactive draft. */
export async function duplicateServiceAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  const source = await db.service.findUnique({ where: { id }, include: { packages: true, addons: true } });
  if (!source) return { ok: false, error: "admin.errNotFound" };

  let slug = `${source.slug}-copy`;
  for (let i = 2; await db.service.findUnique({ where: { slug } }); i++) slug = `${source.slug}-copy-${i}`;

  const { id: _omit, createdAt: _c, updatedAt: _u, ...rest } = source;
  const copy = await db.service.create({
    data: {
      ...rest,
      slug,
      nameEn: `${source.nameEn} (copy)`,
      nameHi: `${source.nameHi} (प्रति)`,
      active: false,
      featured: false,
      trending: false,
      bookingCount: 0,
      ratingCount: 0,
      packages: {
        create: source.packages.map(({ id: _pid, serviceId: _sid, ...p }) => p),
      },
      addons: {
        create: source.addons.map(({ id: _aid, serviceId: _asid, ...a }) => a),
      },
    },
  });
  await audit(admin.id, "service.duplicate", "Service", copy.id, { from: id });
  revalidatePath("/admin/services");
  return { ok: true, id: copy.id };
}

/** Deletes a service only when nothing references it; otherwise ask to deactivate. */
export async function deleteServiceAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  const service = await db.service.findUnique({ where: { id }, include: { _count: { select: { bookings: true } } } });
  if (!service) return { ok: false, error: "admin.errNotFound" };
  if (service._count.bookings > 0) return { ok: false, error: "admin.errServiceHasBookings" };

  await db.service.delete({ where: { id } });
  await audit(admin.id, "service.delete", "Service", id, { slug: service.slug });
  revalidatePath("/admin/services");
  return { ok: true };
}
