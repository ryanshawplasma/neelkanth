/**
 * Adds the launch city's temples and starter offerings to a database, without touching anything
 * else (unlike `prisma/seed.ts`, which resets demo data). Safe to re-run.
 *
 *   npx tsx scripts/db/add-local-catalog.ts                 # the database in DATABASE_URL
 *   npx tsx scripts/db/add-local-catalog.ts --launch        # …and switch the app to local mode
 *
 * It also rolls weekly service dates that have passed forward (the daily cron does this too).
 * Set PRISMA_CLIENT_PATH to use a Prisma client generated for another provider (e.g. Postgres
 * when the project's own client is generated for SQLite).
 */
import { LOCAL_TEMPLES } from "@/data/local-temples";
import { SERVICES, type ServiceSeed } from "@/data/services";
import { rollForwardWeekly, toDateKey } from "@/lib/utils";

const LAUNCH_CITY = "bahadurgarh";
const J = (v: unknown) => JSON.stringify(v);

async function main() {
  const clientPath = process.env.PRISMA_CLIENT_PATH;
  const mod = (clientPath ? await import(clientPath) : await import("@prisma/client")) as typeof import("@prisma/client");
  const db = new mod.PrismaClient();
  const launch = process.argv.includes("--launch");

  try {
    // ── temples ──
    for (const t of LOCAL_TEMPLES) {
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
        latitude: t.latitude,
        longitude: t.longitude,
        timings: t.timings,
        liveDarshanUrl: t.liveDarshanUrl,
        featured: t.featured,
      };
      const existing = await db.temple.findUnique({ where: { slug: t.slug }, select: { id: true } });
      if (existing) {
        // Keep anything an admin has since edited in the console (images, active flag).
        await db.temple.update({ where: { slug: t.slug }, data });
      } else {
        await db.temple.create({
          data: { slug: t.slug, ...data, images: J([cover, `/images/temples/${t.slug}-alt.svg`]), coverUrl: cover, active: true },
        });
      }
      console.log(`${existing ? "updated" : "added  "} temple  ${t.slug}`);
    }

    // ── services at those temples ──
    const localSlugs = new Set(LOCAL_TEMPLES.map((t) => t.slug));
    const services = (SERVICES as ServiceSeed[]).filter((s) => s.templeSlug && localSlugs.has(s.templeSlug));
    const temples = new Map((await db.temple.findMany({ select: { id: true, slug: true } })).map((t) => [t.slug, t.id]));
    const categories = new Map((await db.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]));
    const maxSort = (await db.service.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? 0;

    let order = maxSort;
    for (const s of services) {
      const existing = await db.service.findUnique({ where: { slug: s.slug }, select: { id: true } });
      if (existing) {
        console.log(`kept     service ${s.slug} (already there; edit it in Admin → Services)`);
        continue;
      }
      order += 1;
      const created = await db.service.create({
        data: {
          slug: s.slug,
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
          categoryId: categories.get(s.categorySlug) ?? null,
          templeId: temples.get(s.templeSlug!)!,
          festivalId: null,
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
          sortOrder: order,
        },
        select: { id: true },
      });
      await db.servicePackage.createMany({
        data: s.packages.map((p, i) => ({
          serviceId: created.id,
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
      if (s.addons.length) {
        await db.serviceAddon.createMany({
          data: s.addons.map((a) => ({ serviceId: created.id, slug: a.slug, nameEn: a.nameEn, nameHi: a.nameHi, price: a.price })),
        });
      }
      console.log(`added    service ${s.slug} (${s.packages.length} packages, ${s.addons.length} add-ons)`);
    }

    // ── weekly dates that have passed ──
    const today = toDateKey();
    const stale = await db.service.findMany({ where: { nextDate: { lt: today }, festivalId: null }, select: { id: true, nextDate: true } });
    for (const s of stale) await db.service.update({ where: { id: s.id }, data: { nextDate: rollForwardWeekly(s.nextDate, today) } });
    console.log(`rolled   ${stale.length} weekly service dates forward to ${today} or later`);

    // ── launch city ──
    if (launch) {
      for (const [key, value] of [
        ["launch_city", LAUNCH_CITY],
        ["launch_city_only", "1"],
      ] as const) {
        await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
      }
      console.log(`launch   local mode on for ${LAUNCH_CITY}`);
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
