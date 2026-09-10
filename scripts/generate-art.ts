/**
 * DivyaDham artwork generator.
 *
 *   npx tsx scripts/generate-art.ts
 *
 * Reads the catalogue in `src/data/**` at run time and writes every SVG the app
 * expects under `public/images/**`, plus the PWA icons under `public/icons/**`.
 * Re-run it whenever services, temples, festivals or categories change — the
 * output is deterministic (seeded from each slug), so unchanged rows produce
 * byte-identical files and git stays quiet.
 *
 * This script owns `public/images/**` and `public/icons/**` only. It never
 * writes to `src/` or `prisma/`. See docs/IMAGES.md.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { document, plainTile, renderScene, type SceneSpec } from "./art/compose";
import { EMBLEMS } from "./art/emblems";
import { PALETTES, paletteFor } from "./art/palette";
import { makeRng } from "./art/rand";
import { bandFor, CATEGORY_ART, companionEmblem, emblemFor, festivalArtFor, paletteKeyFor } from "./art/mapping";
import type { BandKind } from "./art/decor";
import { circle, ellipse, g, path, poly, rect, ring, rot, sc, tr } from "./art/svg";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES = join(ROOT, "public", "images");
const ICONS = join(ROOT, "public", "icons");

/* ────────────────────────────── data loading ────────────────────────────── */

type ServiceLike = {
  slug: string;
  type: string;
  deityEn?: string;
  templeSlug?: string | null;
  categorySlug?: string;
  tags?: string[];
  imageNames: string[];
};

type TempleLike = { slug: string; deityEn?: string; city?: string; state?: string };
type CategoryLike = { slug: string };

function isServiceArray(v: unknown): v is Record<string, unknown>[] {
  return Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && "slug" in (v[0] as object) && "type" in (v[0] as object) && "categorySlug" in (v[0] as object);
}

function namesFromImages(images: unknown, slug: string): string[] {
  const out = new Set<string>([slug, `${slug}-alt`]);
  if (Array.isArray(images)) {
    for (const s of images) {
      if (typeof s !== "string") continue;
      const m = /\/images\/services\/([A-Za-z0-9_-]+)\.svg$/.exec(s);
      if (m) out.add(m[1]);
    }
  }
  return [...out];
}

/** Whatever the data module exports today — resilient to it not exporting yet. */
async function loadFromModule(): Promise<ServiceLike[]> {
  const out: ServiceLike[] = [];
  try {
    const mod: Record<string, unknown> = await import("@/data/services");
    for (const value of Object.values(mod)) {
      if (!isServiceArray(value)) continue;
      for (const row of value) {
        out.push({
          slug: String(row.slug),
          type: String(row.type ?? ""),
          deityEn: typeof row.deityEn === "string" ? row.deityEn : undefined,
          templeSlug: typeof row.templeSlug === "string" ? row.templeSlug : null,
          categorySlug: typeof row.categorySlug === "string" ? row.categorySlug : undefined,
          tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
          imageNames: namesFromImages(row.images, String(row.slug)),
        });
      }
    }
  } catch (err) {
    console.warn("  ! could not import src/data/services.ts:", (err as Error).message);
  }
  return out;
}

/**
 * Source scan fallback. The catalogue is authored as arrays of object literals
 * that may not be exported yet (another agent is still adding sections), so we
 * also read the file as text and pull out every top-level service block.
 */
async function loadFromSource(): Promise<ServiceLike[]> {
  const file = join(ROOT, "src", "data", "services.ts");
  if (!existsSync(file)) return [];
  const src = (await readFile(file, "utf8")).replace(/\r\n/g, "\n");
  const head = /\n {2}\{\n {4}slug: "([A-Za-z0-9_-]+)",\n {4}type: "([A-Z_]+)"/g;
  const marks: { slug: string; type: string; at: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = head.exec(src))) marks.push({ slug: m[1], type: m[2], at: m.index });

  return marks.map((mark, i) => {
    const block = src.slice(mark.at, i + 1 < marks.length ? marks[i + 1].at : src.length);
    const one = (re: RegExp) => re.exec(block)?.[1];
    const tagsRaw = /tags: \[([^\]]*)\]/.exec(block)?.[1] ?? "";
    const tags = [...tagsRaw.matchAll(/"([^"]+)"/g)].map((t) => t[1]);
    const names = new Set<string>([mark.slug, `${mark.slug}-alt`]);
    for (const t of block.matchAll(/\/images\/services\/([A-Za-z0-9_-]+)\.svg/g)) names.add(t[1]);
    for (const t of block.matchAll(/\bimg\("([A-Za-z0-9_-]+)"\)/g)) {
      names.add(t[1]);
      names.add(`${t[1]}-alt`);
    }
    return {
      slug: mark.slug,
      type: mark.type,
      deityEn: one(/deityEn: "([^"]*)"/),
      templeSlug: one(/templeSlug: "([^"]*)"/) ?? null,
      categorySlug: one(/categorySlug: "([^"]*)"/),
      tags,
      imageNames: [...names],
    };
  });
}

async function loadServices(): Promise<ServiceLike[]> {
  const byModule = await loadFromModule();
  const bySource = await loadFromSource();
  const merged = new Map<string, ServiceLike>();
  for (const s of bySource) merged.set(s.slug, s);
  for (const s of byModule) {
    const prev = merged.get(s.slug);
    merged.set(s.slug, prev ? { ...prev, ...s, imageNames: [...new Set([...prev.imageNames, ...s.imageNames])] } : s);
  }
  return [...merged.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

async function loadTemples(): Promise<TempleLike[]> {
  try {
    const mod = (await import("@/data/temples")) as { TEMPLES?: TempleLike[] };
    return mod.TEMPLES ?? [];
  } catch {
    return [];
  }
}

async function loadCategories(): Promise<CategoryLike[]> {
  try {
    const mod = (await import("@/data/categories")) as { CATEGORIES?: CategoryLike[] };
    return mod.CATEGORIES ?? [];
  } catch {
    return [];
  }
}

async function loadFestivalKeys(): Promise<string[]> {
  const keys = new Set<string>(["vinayaka"]);
  try {
    const mod = (await import("@/data/festivals")) as { FESTIVAL_ART_KEYS?: string[]; OBSERVANCE_ART_KEYS?: string[] };
    for (const k of mod.FESTIVAL_ART_KEYS ?? []) keys.add(k.toLowerCase());
    for (const k of mod.OBSERVANCE_ART_KEYS ?? []) keys.add(k.toLowerCase());
  } catch (err) {
    console.warn("  ! could not import src/data/festivals.ts:", (err as Error).message);
  }
  return [...keys].sort();
}

/* ────────────────────────────── writing ────────────────────────────── */

const written: Record<string, { count: number; min: number; max: number }> = {};

async function write(folder: string, name: string, svg: string) {
  const dir = join(IMAGES, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${name}.svg`), svg, "utf8");
  const size = Buffer.byteLength(svg, "utf8");
  const bucket = (written[folder] ??= { count: 0, min: Infinity, max: 0 });
  bucket.count++;
  bucket.min = Math.min(bucket.min, size);
  bucket.max = Math.max(bucket.max, size);
  if (size > 45_000) console.warn(`  ! ${folder}/${name}.svg is ${(size / 1024).toFixed(1)} KB (over the 45 KB budget)`);
}

/* ────────────────────────────── scene builders ────────────────────────────── */

function serviceScene(s: ServiceLike, variant: number): SceneSpec {
  // The slug decides the picture, then the deity, then the tags.
  const slug = s.slug.replace(/-/g, " ");
  const deity = (s.deityEn ?? "").toLowerCase();
  const strong = `${slug} ${deity}`;
  const weak = `${(s.tags ?? []).join(" ")} ${s.templeSlug ?? ""} ${s.categorySlug ?? ""}`.toLowerCase();
  const paletteKey = paletteKeyFor(strong, weak);
  const primary = emblemFor(slug, deity, weak, s.type);
  const emblem = variant === 0 ? primary : companionEmblem(primary);
  const rng = makeRng(`${s.slug}#${variant}`);
  const band = bandFor(`${s.templeSlug ?? ""} ${strong}`, s.type === "PRASAD" ? "city" : "temple");
  const hay = `${strong} ${weak}`;
  return {
    seed: `${s.slug}#${variant}`,
    palette: paletteFor(paletteKey),
    emblem,
    band: variant === 0 ? band : altBand(band, rng.next()),
    arch: variant === 1,
    garlandTop: variant === 0 && rng.chance(0.45),
    lamps: band === "temple" || band === "ghat",
    moon: PALETTES[paletteKey]?.night && rng.chance(0.35) ? "crescent" : undefined,
    cy: variant === 0 ? 0.435 : 0.46,
    zoom: variant === 0 ? 1 : 0.92,
    particles: /flower|phool|garland|holi|petal/.test(hay) ? "petals" : "auto",
  };
}

/** Give the second image a different horizon so the pair does not look cloned. */
function altBand(band: BandKind, roll: number): BandKind {
  const swaps: Record<string, BandKind[]> = {
    temple: ["city", "hills", "forest"],
    ghat: ["river", "temple"],
    river: ["ghat", "forest"],
    sea: ["temple", "sea"],
    hills: ["snow", "forest"],
    snow: ["hills", "temple"],
    desert: ["city", "temple"],
    forest: ["hills", "river"],
    city: ["temple", "hills"],
    none: ["temple"],
  };
  const options = swaps[band] ?? ["temple"];
  return options[Math.floor(roll * options.length) % options.length];
}

function templeScene(t: TempleLike, variant: number): SceneSpec {
  const hay = [t.slug, t.deityEn ?? "", t.city ?? "", t.state ?? ""].join(" ").toLowerCase();
  const paletteKey = paletteKeyFor(hay);
  const found = bandFor(hay, "city");
  // The gopuram is already a skyline — put it against the city's real setting
  // (ghats, sea, hills, dunes) rather than a second row of shikharas.
  const band: BandKind = found === "temple" ? "city" : found;
  const rng = makeRng(`${t.slug}#t${variant}`);
  return {
    seed: `${t.slug}#t${variant}`,
    palette: paletteFor(paletteKey),
    emblem: variant === 0 ? "templeGopuram" : emblemFor(hay, "", undefined),
    band: variant === 0 ? band : altBand(band, rng.next()),
    bandBase: variant === 0 ? 0.63 : 0.7,
    lamps: true,
    mandala: variant !== 0,
    arch: variant !== 0,
    garlandTop: variant === 0,
    cy: variant === 0 ? 0.41 : 0.44,
    zoom: variant === 0 ? 0.72 : 0.95,
    moon: PALETTES[paletteKey]?.night ? "crescent" : undefined,
  };
}

function festivalScene(key: string): SceneSpec {
  const art = festivalArtFor(key);
  const rng = makeRng(`fest:${key}`);
  return {
    seed: `fest:${key}`,
    palette: paletteFor(art.palette),
    emblem: art.emblem,
    band: art.band,
    moon: art.moon,
    lamps: art.lamps ?? art.band === "ghat",
    garlandTop: rng.chance(0.5),
    particles: art.particles ?? "auto",
    cy: 0.435,
  };
}

function categoryScene(slug: string): SceneSpec {
  const art = CATEGORY_ART[slug] ?? { palette: paletteKeyFor(slug.replace(/-/g, " ")), emblem: emblemFor(slug.replace(/-/g, " ")) };
  return {
    seed: `cat:${slug}`,
    palette: paletteFor(art.palette),
    emblem: art.emblem,
    band: "none",
    simple: true,
    godRays: false,
    cy: 0.5,
    zoom: 1,
  };
}

/* ────────────────────────────── icons ────────────────────────────── */

/** Maskable PWA icon: full-bleed saffron with the mark inside the safe circle. */
function iconSvg(size: number): string {
  const p = paletteFor("temple");
  const body =
    `<defs>` +
    `<linearGradient id="ib" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0%" stop-color="#ffb765"/><stop offset="48%" stop-color="#f0642a"/><stop offset="100%" stop-color="#8b1e2d"/></linearGradient>` +
    `<radialGradient id="ig" cx="50%" cy="42%" r="60%"><stop offset="0%" stop-color="#ffe2b0" stop-opacity="0.55"/><stop offset="100%" stop-color="#ffe2b0" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="igold" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0%" stop-color="#fdeab6"/><stop offset="45%" stop-color="#efc04a"/><stop offset="100%" stop-color="#a8801f"/></linearGradient>` +
    `<radialGradient id="iflame" cx="50%" cy="72%" r="70%"><stop offset="0%" stop-color="#fffdf2"/><stop offset="40%" stop-color="#fdeab6"/><stop offset="100%" stop-color="#f0642a"/></radialGradient>` +
    `</defs>` +
    rect(0, 0, 512, 512, { fill: "url(#ib)" }) +
    circle(256, 226, 200, { fill: "url(#ig)" }) +
    // safe-zone content: shikhara + mandapa + diya, all within the central 80%
    g(
      { transform: tr(256, 258) },
      ring(24, (i, d) => circle(0, -150, 3, { fill: "#fdeab6", opacity: 0.35, transform: rot(d) })),
      path("M0-152C24-100 37-40 43 12H-43C-37-40-24-100 0-152Z", { fill: "url(#igold)" }),
      ...[0, 1, 2, 3].map((i) => path(`M${-(14 + i * 7)} ${-104 + i * 26}Q0 ${-118 + i * 26} ${14 + i * 7} ${-104 + i * 26}`, { fill: "none", stroke: "#8b1e2d", "stroke-opacity": 0.35, "stroke-width": 4 })),
      circle(0, -166, 11, { fill: "url(#igold)" }),
      poly([[0, -190], [7, -174], [-7, -174]], { fill: "url(#igold)" }),
      ...[-1, 1].map((d) => g({ transform: `${tr(d * 78, 30)} ${sc(0.56)}` }, path("M0-152C24-100 37-40 43 12H-43C-37-40-24-100 0-152Z", { fill: "url(#igold)", opacity: 0.85 }), circle(0, -164, 10, { fill: "url(#igold)" }))),
      rect(-124, 12, 248, 24, { fill: "url(#igold)", rx: 9 }),
      rect(-106, 36, 212, 74, { fill: "#fdeab6", opacity: 0.92 }),
      path("M-30 110V64A30 30 0 0 1 30 64V110Z", { fill: "#8b1e2d", opacity: 0.75 }),
      ...[-76, -54, 54, 76].map((x) => rect(x - 6, 40, 12, 66, { fill: "#c98a3c", opacity: 0.55, rx: 4 })),
      rect(-134, 108, 268, 22, { fill: "url(#igold)", rx: 9 }),
      // diya
      g(
        { transform: tr(0, 152) },
        circle(0, -30, 54, { fill: "#ffd469", opacity: 0.4 }),
        path("M0-64C-20-38-26-18-15-4C-6 6 6 6 15-4C26-18 20-38 0-64Z", { fill: "url(#iflame)" }),
        path("M-70 0C-74 22-40 36 0 36S74 22 70 0Z", { fill: "url(#igold)" }),
        ellipse(0, 0, 70, 15, { fill: "#8b1e2d", opacity: 0.55 }),
      ),
    );
  void p;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" role="img">${body}</svg>\n`;
}

/** Monochrome white glyph on transparency, for the Android notification badge. */
function badgeSvg(size: number): string {
  const body = g(
    { transform: `${tr(48, 50)} ${sc(0.26)}`, fill: "#ffffff" },
    path("M0-152C24-100 37-40 43 12H-43C-37-40-24-100 0-152Z"),
    circle(0, -166, 11),
    poly([[0, -190], [7, -174], [-7, -174]]),
    ...[-1, 1].map((d) => g({ transform: `${tr(d * 80, 30)} ${sc(0.56)}` }, path("M0-152C24-100 37-40 43 12H-43C-37-40-24-100 0-152Z"), circle(0, -164, 10))),
    rect(-128, 12, 256, 26, { rx: 10 }),
    rect(-108, 42, 216, 76),
    rect(-140, 112, 280, 24, { rx: 10 }),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="${size}" height="${size}" role="img">${body}</svg>\n`;
}

async function writeIcons() {
  await mkdir(ICONS, { recursive: true });
  await writeFile(join(ICONS, "icon.svg"), iconSvg(512), "utf8");

  const sharp = await import("sharp")
    .then((m) => m.default)
    .catch(() => null);
  if (!sharp) {
    console.warn("  ! sharp is unavailable — PNG icons were not regenerated");
    return 1;
  }
  const jobs: [string, number, string][] = [
    ["icon-192.png", 192, iconSvg(192)],
    ["icon-512.png", 512, iconSvg(512)],
    ["apple-touch-icon.png", 180, iconSvg(180)],
    ["badge.png", 96, badgeSvg(96)],
  ];
  for (const [name, size, svg] of jobs) {
    await sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(join(ICONS, name));
  }
  return jobs.length + 1;
}

/* ────────────────────────────── main ────────────────────────────── */

async function main() {
  console.log("DivyaDham artwork generator");

  const [services, temples, categories, festivalKeys] = await Promise.all([loadServices(), loadTemples(), loadCategories(), loadFestivalKeys()]);
  console.log(`  services ${services.length} · temples ${temples.length} · festivals ${festivalKeys.length} · categories ${categories.length}`);

  // services (+ every filename their `images` array references)
  for (const s of services) {
    const names = s.imageNames.length ? s.imageNames : [s.slug, `${s.slug}-alt`];
    for (const name of names) {
      const variant = name === s.slug ? 0 : 1;
      await write("services", name, renderScene({ ...serviceScene(s, variant), seed: name }));
    }
  }

  // type-level fallbacks for any slug that has no art of its own
  const types = [...new Set(services.map((s) => s.type))].filter(Boolean);
  for (const type of types.length ? types : ["ONLINE_POOJA", "PANDIT_AT_HOME", "CHADHAVA", "ASTROLOGY", "PRASAD", "KATHA", "LIVE_DARSHAN"]) {
    const key = type.toLowerCase().replace(/_/g, "-");
    const hay = key.replace(/-/g, " ");
    await write(
      "services",
      `_fallback-${key}`,
      renderScene({
        seed: `fallback:${key}`,
        palette: paletteFor(paletteKeyFor(hay)),
        emblem: emblemFor(hay, "", type),
        band: "temple",
        lamps: true,
        cy: 0.435,
      }),
    );
  }

  // temples
  for (const t of temples) {
    await write("temples", t.slug, renderScene(templeScene(t, 0)));
    const alt = renderScene(templeScene(t, 1));
    await write("temples", `${t.slug}-2`, alt);
    await write("temples", `${t.slug}-alt`, alt);
  }

  // festivals and recurring observances
  for (const key of festivalKeys) await write("festivals", key, renderScene(festivalScene(key)));

  // category tiles
  for (const c of categories) await write("categories", c.slug, renderScene(categoryScene(c.slug)));

  // shared art
  await write(
    ".",
    "placeholder",
    renderScene({ seed: "placeholder", palette: paletteFor("temple"), emblem: "om", band: "temple", lamps: true, cy: 0.435 }),
  );
  await write(
    ".",
    "hero",
    renderScene({
      seed: "hero",
      palette: paletteFor("temple"),
      emblem: "om",
      band: "ghat",
      width: 1600,
      height: 700,
      lamps: true,
      garlandTop: true,
      cy: 0.42,
      zoom: 0.92,
    }),
  );
  await write(
    ".",
    "og",
    renderScene({
      seed: "og",
      palette: paletteFor("temple"),
      emblem: "templeGopuram",
      band: "temple",
      width: 1200,
      height: 630,
      lamps: true,
      cy: 0.36,
      zoom: 0.78,
      garlandBottom: false,
      title: "DivyaDham",
      subtitle: "Online Pooja · Chadhava · Panchang",
    }),
  );
  // absolute last resort, if even the emblem library fails to resolve
  if (!EMBLEMS.om) await write(".", "placeholder", plainTile(800, 600, paletteFor("temple")));

  const iconCount = await writeIcons();

  console.log("\n  written:");
  for (const [folder, s] of Object.entries(written)) {
    console.log(`    public/images/${folder === "." ? "" : folder + "/"}  ${String(s.count).padStart(4)} files   ${(s.min / 1024).toFixed(1)}–${(s.max / 1024).toFixed(1)} KB`);
  }
  console.log(`    public/icons/            ${String(iconCount).padStart(4)} files`);
  console.log(`  emblems available: ${Object.keys(EMBLEMS).length} · palettes: ${Object.keys(PALETTES).length}`);
  void document;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
