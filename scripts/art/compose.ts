/**
 * Scene composition: stacks sky, mandala, horizon band, emblem, garland and
 * frame into a finished SVG document.
 *
 * Everything is deterministic — the same `seed` always yields the same bytes.
 */
import { EMBLEMS } from "./emblems";
import type { Palette } from "./palette";
import { makeRng } from "./rand";
import type { BandKind } from "./decor";
import { archFrame, band, borderFrame, bottomGarland, filigree, flowerDefs, glowOrb, haloRing, lampRow, mandala, rays, sky, skyMoon, sparks, stars, topGarland, vignette } from "./decor";
import { circle, esc, g, n, rect, sc, tr } from "./svg";

/* ───────────────────────── colour helpers ───────────────────────── */

function hex(c: string): [number, number, number] {
  const s = c.replace("#", "");
  const f = s.length === 3 ? s.split("").map((x) => x + x).join("") : s;
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
}
function toHex(rgb: number[]): string {
  return "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
/** amount > 0 lightens toward white, < 0 darkens toward black. */
export function shade(c: string, amount: number): string {
  const [r, gr, b] = hex(c);
  const t = amount > 0 ? 255 : 0;
  const p = Math.abs(amount);
  return toHex([r + (t - r) * p, gr + (t - gr) * p, b + (t - b) * p]);
}
export function mix(a: string, b: string, t: number): string {
  const A = hex(a);
  const B = hex(b);
  return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}

/* ───────────────────────── shared defs ───────────────────────── */

const stop = (o: number | string, c: string, a?: number) =>
  `<stop offset="${o}" stop-color="${c}"${a === undefined ? "" : ` stop-opacity="${a}"`}/>`;

function defs(p: Palette, cxPct: number, cyPct: number): string {
  const goldDark = shade(p.gold, -0.35);
  return (
    "<defs>" +
    `<radialGradient id="gSky" cx="${n(cxPct)}%" cy="${n(cyPct)}%" r="88%">${stop("0%", p.skyIn)}${stop("46%", p.skyMid)}${stop("100%", p.skyOut)}</radialGradient>` +
    `<linearGradient id="gWash" x1="0" y1="0" x2="0" y2="1">${stop("0%", p.skyOut, 0.35)}${stop("40%", p.skyMid, 0)}${stop("100%", p.skyOut, 0.55)}</linearGradient>` +
    `<linearGradient id="gEmb" x1="0" y1="0" x2="0.35" y2="1">${stop("0%", shade(p.emblem, 0.25))}${stop("48%", p.emblem)}${stop("100%", p.emblemDeep)}</linearGradient>` +
    `<linearGradient id="gGold" x1="0" y1="0" x2="0.5" y2="1">${stop("0%", p.goldSoft)}${stop("34%", p.gold)}${stop("58%", shade(p.goldSoft, 0.2))}${stop("100%", goldDark)}</linearGradient>` +
    `<linearGradient id="gMetal" x1="0.1" y1="0" x2="0.9" y2="1">${stop("0%", shade(p.emblem, 0.3))}${stop("32%", p.emblem)}${stop("62%", mix(p.emblem, p.emblemDeep, 0.55))}${stop("100%", p.emblemDeep)}</linearGradient>` +
    `<radialGradient id="gFlame" cx="50%" cy="72%" r="70%">${stop("0%", "#fffdf2")}${stop("34%", p.goldSoft)}${stop("70%", p.gold)}${stop("100%", p.petalB)}</radialGradient>` +
    `<radialGradient id="gPetA" cx="42%" cy="38%" r="70%">${stop("0%", shade(p.petalA, 0.3))}${stop("100%", shade(p.petalA, -0.12))}</radialGradient>` +
    `<radialGradient id="gPetB" cx="42%" cy="38%" r="70%">${stop("0%", shade(p.petalB, 0.28))}${stop("100%", shade(p.petalB, -0.16))}</radialGradient>` +
    `<linearGradient id="gWater" x1="0" y1="0" x2="0" y2="1">${stop("0%", p.glow, 0.35)}${stop("100%", p.skyOut, 0.1)}</linearGradient>` +
    `<linearGradient id="gFoot" x1="0" y1="0" x2="0" y2="1">${stop("0%", p.skyOut, 0)}${stop("100%", p.skyOut, 0.55)}</linearGradient>` +
    `<radialGradient id="gVig" cx="50%" cy="46%" r="76%">${stop("55%", "#000", 0)}${stop("100%", "#000", 0.42)}</radialGradient>` +
    `<filter id="fGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="24"/></filter>` +
    `<filter id="fSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>` +
    flowerDefs(p) +
    "</defs>"
  );
}

/* ───────────────────────── scene spec ───────────────────────── */

export type SceneSpec = {
  seed: string;
  palette: Palette;
  emblem: string;
  /** Optional second emblem tucked behind, at reduced scale. */
  band: BandKind;
  width?: number;
  height?: number;
  mandala?: boolean;
  garlandBottom?: boolean;
  garlandTop?: boolean;
  arch?: boolean;
  filigreeCorners?: boolean;
  border?: boolean;
  particles?: "sparks" | "petals" | "stars" | "auto" | "none";
  godRays?: boolean;
  lamps?: boolean;
  /** Emblem centre as a fraction of the canvas. */
  cx?: number;
  cy?: number;
  /** Multiplier on the default emblem scale. */
  zoom?: number;
  /** Simplified icon-style tile (used by category art). */
  simple?: boolean;
  /** Where the horizon sits, as a fraction of the canvas height. */
  bandBase?: number;
  /** A moon hung in the upper sky. */
  moon?: "full" | "crescent";
  title?: string;
  subtitle?: string;
};

const DEFAULT_W = 800;
const DEFAULT_H = 600;

export function renderScene(spec: SceneSpec): string {
  const W = spec.width ?? DEFAULT_W;
  const H = spec.height ?? DEFAULT_H;
  const p = spec.palette;
  const r = makeRng(spec.seed);
  const cx = W * (spec.cx ?? 0.5);
  const cy = H * (spec.cy ?? 0.44);
  const draw = EMBLEMS[spec.emblem] ?? EMBLEMS.om;

  // The emblem library is authored inside a +/-140 box.
  const fit = Math.min(W, H) / (spec.simple ? 420 : 640);
  const zoom = (spec.zoom ?? 1) * fit * (spec.simple ? 1.25 : 1.5);

  const particles = spec.particles ?? "auto";
  const wantsStars = particles === "stars" || (particles === "auto" && p.night);
  const wantsSparks = particles === "sparks" || particles === "petals" || (particles === "auto" && !p.night);

  const layers: string[] = [
    sky(W, H),
    spec.godRays !== false && !spec.simple ? rays(cx, cy, Math.max(W, H) * 0.95, p.glow, 16) : "",
    wantsStars ? stars(W, H, p, r, spec.simple ? 22 : 54) : "",
    spec.moon ? skyMoon(W * 0.845, H * 0.155, Math.min(W, H) * 0.075, p, spec.moon) : "",
    spec.mandala === false ? "" : spec.simple ? haloRing(cx, cy, Math.min(W, H) * 0.36, p) : mandala(cx, cy, Math.min(W, H) * 0.3, p, "md"),
    spec.simple ? "" : band(spec.band, W, H, p, r, spec.bandBase),
    spec.lamps && !spec.simple ? lampRow(W, H * ((spec.bandBase ?? 0.72) + 0.015), p, 7) : "",
    glowOrb(cx, cy, Math.min(W, H) * 0.3, p.glow, p.night ? 0.42 : 0.34),
    glowOrb(cx, cy, Math.min(W, H) * 0.17, p.goldSoft, 0.3),
    spec.arch ? archFrame(cx, cy - H * 0.02, Math.min(W, H) * 0.3, Math.min(W, H) * 0.34, p) : "",
    g({ transform: `${tr(cx, cy)} ${sc(zoom)}` }, draw(p, r)),
    wantsSparks ? sparks(W, H, p, r, particles === "petals" ? "petals" : "sparks", spec.simple ? 12 : 26) : "",
    spec.garlandTop ? topGarland(W, p, r) : "",
    spec.garlandBottom === false || spec.simple ? "" : bottomGarland(W, H, p, r),
    spec.filigreeCorners === false ? "" : filigree(W, H, p),
    spec.border === false ? "" : borderFrame(W, H, p, spec.simple ? 12 : 16),
    vignette(W, H),
  ];

  if (spec.title) layers.push(titleBlock(W, H, p, spec.title, spec.subtitle));

  return document(W, H, defs(p, (cx / W) * 100, (cy / H) * 100) + layers.filter(Boolean).join(""));
}

function titleBlock(W: number, H: number, p: Palette, title: string, subtitle?: string): string {
  const family = "Georgia, 'Times New Roman', serif";
  const sans = "'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";
  return g(
    { transform: tr(W / 2, H * 0.8) },
    rect(-W * 0.42, -74, W * 0.84, 132, { fill: "#000", opacity: 0.22, rx: 24 }),
    `<text x="0" y="-14" text-anchor="middle" font-family="${family}" font-size="${n(H * 0.115)}" font-weight="700" fill="${p.goldSoft}" letter-spacing="2">${esc(title)}</text>`,
    subtitle
      ? `<text x="0" y="${n(H * 0.055)}" text-anchor="middle" font-family="${sans}" font-size="${n(H * 0.042)}" fill="${p.emblem}" opacity="0.92" letter-spacing="1">${esc(subtitle)}</text>`
      : "",
  );
}

export function document(W: number, H: number, body: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">` +
    body +
    "</svg>\n"
  );
}

/** Flat colour block used as the very last resort placeholder. */
export function plainTile(W: number, H: number, p: Palette): string {
  return document(W, H, defs(p, 50, 44) + sky(W, H) + circle(W / 2, H / 2, Math.min(W, H) * 0.2, { fill: p.glow, opacity: 0.4 }));
}
