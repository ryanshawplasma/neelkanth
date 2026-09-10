/**
 * Scene decorations: skies, horizon silhouettes, mandala rings, marigold
 * garlands, gold filigree corners, floating sparks and the vignette.
 *
 * Every function returns a self-contained markup string (including its own
 * `<defs>` where it needs one), so `compose.ts` can stack them in any order.
 */
import type { Palette } from "./palette";
import type { Rng } from "./rand";
import { circle, ellipse, g, leaf, line, path, petal, poly, pt, rect, ring, rot, sc, star, tr } from "./svg";
import { FLOWER_UNIT, marigold } from "./emblems";

export type BandKind = "temple" | "ghat" | "hills" | "snow" | "sea" | "river" | "desert" | "forest" | "city" | "none";

export const BAND_KINDS: BandKind[] = ["temple", "ghat", "hills", "snow", "sea", "river", "desert", "forest", "city", "none"];

/* ───────────────────────── sky and atmosphere ───────────────────────── */

export function sky(w: number, h: number): string {
  return g({}, rect(0, 0, w, h, { fill: "url(#gSky)" }), rect(0, 0, w, h, { fill: "url(#gWash)" }));
}

/** A pool of light behind the emblem. */
export function glowOrb(cx: number, cy: number, r: number, colour: string, opacity = 0.55): string {
  return circle(cx, cy, r, { fill: colour, opacity, filter: "url(#fGlow)" });
}

/** Slanted god-rays fanning out from the emblem. */
export function rays(cx: number, cy: number, len: number, colour: string, count = 14): string {
  return g(
    { opacity: 0.13 },
    ring(count, (i, d) => poly([[-10, 0], [10, 0], [26, -len], [-26, -len]], { fill: colour, transform: tr(cx, cy) + " " + rot(d + (i % 2 ? 6 : 0)) })),
  );
}

export function stars(w: number, h: number, p: Palette, r: Rng, count = 54): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = r.range(8, w - 8);
    const y = r.range(8, h * 0.62);
    const s = r.range(0.7, 2.4);
    out.push(circle(x, y, s, { fill: p.spark, opacity: r.range(0.25, 0.85) }));
  }
  for (let i = 0; i < 5; i++) {
    out.push(path(star(r.range(40, w - 40), r.range(24, h * 0.4), r.range(5, 10), 2, 4), { fill: p.spark, opacity: r.range(0.4, 0.8) }));
  }
  return g({}, ...out);
}

/** Drifting embers / flower particles. */
export function sparks(w: number, h: number, p: Palette, r: Rng, kind: "sparks" | "petals" = "sparks", count = 26): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = r.range(10, w - 10);
    const y = r.range(30, h * 0.86);
    const s = r.range(1.6, 4.6);
    if (kind === "petals") {
      out.push(g({ transform: `${tr(x, y)} ${rot(r.range(0, 360))}` }, path(petal(s * 4, s * 2.4), { fill: r.chance(0.5) ? p.petalA : p.petalB, opacity: r.range(0.3, 0.75) })));
    } else {
      out.push(circle(x, y, s, { fill: p.gold, opacity: r.range(0.2, 0.7) }));
      if (r.chance(0.25)) out.push(circle(x, y, s * 3.2, { fill: p.gold, opacity: 0.12, filter: "url(#fSoft)" }));
    }
  }
  return g({}, ...out);
}

export function vignette(w: number, h: number): string {
  return rect(0, 0, w, h, { fill: "url(#gVig)" });
}

/* ───────────────────────── mandala / rangoli ───────────────────────── */

/**
 * Concentric rotating rings built from one reusable motif — cheap in bytes and
 * the classic rangoli geometry. `id` keeps the defs unique inside a file.
 */
export function mandala(cx: number, cy: number, radius: number, p: Palette, id = "m"): string {
  // Outlined petals read as filigree; filled ones read as scattered darts.
  const motif = g(
    { transform: tr(0, -radius) },
    path(petal(radius * 0.26, radius * 0.16, 0.62), { fill: "none", stroke: p.line, "stroke-width": radius * 0.012, opacity: 0.4, transform: rot(180) }),
  );
  const motif2 = g({ transform: tr(0, -radius * 1.24) }, circle(0, 0, radius * 0.022, { fill: p.goldSoft, opacity: 0.55 }), path(`M${-radius * 0.05} 0Q0 ${radius * 0.05} ${radius * 0.05} 0Q0 ${-radius * 0.05} ${-radius * 0.05} 0Z`, { fill: p.line, opacity: 0.3 }));
  return g(
    { transform: tr(cx, cy) },
    `<defs><g id="${id}a">${motif}</g><g id="${id}b">${motif2}</g></defs>`,
    circle(0, 0, radius * 0.86, { fill: "none", stroke: p.line, "stroke-width": 1, opacity: 0.22 }),
    circle(0, 0, radius, { fill: "none", stroke: p.line, "stroke-width": 1.4, opacity: 0.3 }),
    circle(0, 0, radius * 1.12, { fill: "none", stroke: p.line, "stroke-width": 1, opacity: 0.2, "stroke-dasharray": "2 9" }),
    ring(18, (i, d) => `<use href="#${id}a" transform="${rot(d)}"/>`),
    ring(30, (i, d) => `<use href="#${id}b" transform="${rot(d)}"/>`),
  );
}

/** A softer halo ring used on simple category tiles. */
export function haloRing(cx: number, cy: number, radius: number, p: Palette): string {
  return g(
    { transform: tr(cx, cy) },
    circle(0, 0, radius, { fill: "none", stroke: p.line, "stroke-width": 2, opacity: 0.35 }),
    ring(20, (i, d) => circle(...pt(0, 0, radius, d), 2.6, { fill: p.goldSoft, opacity: 0.45 })),
  );
}

/* ───────────────────────── horizon silhouettes ───────────────────────── */

function shikhara(x: number, w: number, h: number, base: number): string {
  const xc = x + w / 2;
  const x1 = x + w;
  return (
    `M${x} ${base}C${x + w * 0.2} ${base - h * 0.45} ${x + w * 0.34} ${base - h * 0.82} ${xc} ${base - h}` +
    `C${xc + w * 0.16} ${base - h * 0.82} ${x1 - w * 0.2} ${base - h * 0.45} ${x1} ${base}Z`
  );
}

function finial(x: number, base: number, h: number, fill: string, full = true): string {
  if (!full) return circle(x, base - h - 6, 3, { fill, opacity: 0.75 });
  return g({}, line(x, base - h, x, base - h - 14, { stroke: fill, "stroke-width": 3 }), circle(x, base - h - 18, 5, { fill }), poly([[x, base - h - 32], [x + 4, base - h - 22], [x - 4, base - h - 22]], { fill }));
}

/** Layered temple skyline. */
function templeBand(w: number, base: number, p: Palette, r: Rng): string {
  const far: string[] = [];
  let x = -40;
  while (x < w + 40) {
    const bw = r.range(60, 130);
    const bh = r.range(70, 150);
    // A faint rim keeps the far towers legible without letting their gold
    // finials float free of an invisible silhouette.
    far.push(path(shikhara(x, bw, bh, base - 18), { fill: p.farBand, stroke: p.line, "stroke-opacity": 0.18, "stroke-width": 1.5 }));
    far.push(finial(x + bw / 2, base - 18, bh, p.gold, bh > 118));
    x += bw * r.range(0.72, 1.05);
  }
  const near: string[] = [];
  const mainW = 200;
  const mainX = w / 2 - mainW / 2;
  near.push(path(shikhara(mainX, mainW, 210, base + 30), { fill: p.nearBand }));
  near.push(finial(w / 2, base + 30, 210, p.gold));
  near.push(rect(mainX - 60, base + 6, mainW + 120, 30, { fill: p.nearBand, rx: 6 }));
  near.push(path(`M${w / 2 - 34} ${base + 36}V${base - 4}A34 34 0 0 1 ${w / 2 + 34} ${base - 4}V${base + 36}Z`, { fill: p.skyOut, opacity: 0.7 }));
  for (let i = 0; i < 6; i++) {
    const cx = mainX - 20 + i * 50;
    near.push(path(`M${cx - 22} ${base + 8}Q${cx} ${base - 12} ${cx + 22} ${base + 8}`, { fill: "none", stroke: p.gold, "stroke-width": 2, opacity: 0.35 }));
  }
  return g({}, ...far, ...near);
}

/** Varanasi-style stepped ghats above a rippling river. */
function ghatBand(w: number, base: number, p: Palette, r: Rng): string {
  const steps: string[] = [];
  for (let i = 0; i < 7; i++) {
    steps.push(rect(-20 + i * 8, base + 6 + i * 15, w + 40 - i * 16, 16, { fill: i % 2 ? p.nearBand : p.farBand, opacity: 0.95 }));
  }
  const towers: string[] = [];
  let x = -30;
  while (x < w + 30) {
    const bw = r.range(46, 96);
    const bh = r.range(50, 120);
    towers.push(path(shikhara(x, bw, bh, base + 6), { fill: p.farBand, stroke: p.line, "stroke-opacity": 0.18, "stroke-width": 1.5 }));
    towers.push(finial(x + bw / 2, base + 6, bh, p.gold, bh > 96));
    x += bw * r.range(0.9, 1.3);
  }
  const boats = [0.18, 0.62, 0.85].map((t, i) =>
    g(
      { transform: `${tr(w * t, base + 130 + i * 12)} ${sc(0.7 + i * 0.15)}` },
      path("M-34 0Q0 16 34 0Q0 8-34 0Z", { fill: p.nearBand }),
      line(0, 0, 0, -22, { stroke: p.nearBand, "stroke-width": 3 }),
      circle(0, -26, 4, { fill: p.gold, opacity: 0.8 }),
    ),
  );
  return g({}, ...towers, ...steps, ...boats);
}

function hillsBand(w: number, base: number, p: Palette, r: Rng, snow = false): string {
  const out: string[] = [];
  const layer = (yOff: number, fill: string, peaks: number, amp: number) => {
    let d = `M-20 ${base + 200}L-20 ${base + yOff}`;
    const step = (w + 40) / peaks;
    for (let i = 0; i <= peaks; i++) {
      const x = -20 + i * step;
      const y = base + yOff - (i % 2 === 0 ? amp * r.range(0.7, 1.15) : amp * r.range(0.2, 0.45));
      d += `Q${x - step * 0.28} ${y - 12} ${x} ${y}`;
      d += `Q${x + step * 0.28} ${y + 14} ${x + step * 0.5} ${base + yOff - amp * 0.25}`;
    }
    d += `L${w + 20} ${base + 200}Z`;
    out.push(path(d, { fill }));
  };
  layer(10, p.farBand, 5, 150);
  layer(70, p.nearBand, 4, 110);
  if (snow) {
    out.push(g({ fill: p.emblem, opacity: 0.75 }, poly([[w * 0.22, base - 128], [w * 0.28, base - 92], [w * 0.16, base - 92]]), poly([[w * 0.62, base - 118], [w * 0.68, base - 84], [w * 0.56, base - 84]])));
  }
  return g({}, ...out);
}

function seaBand(w: number, base: number, p: Palette, r: Rng): string {
  const out: string[] = [rect(0, base + 20, w, 400, { fill: p.nearBand })];
  out.push(rect(0, base + 20, w, 400, { fill: "url(#gWater)", opacity: 0.6 }));
  for (let i = 0; i < 9; i++) {
    const y = base + 40 + i * 20;
    const off = r.range(-30, 30);
    out.push(path(`M-10 ${y}Q${w * 0.16 + off} ${y - 8} ${w * 0.33} ${y}T${w * 0.66} ${y}T${w + 10} ${y}`, { fill: "none", stroke: p.spark, "stroke-width": 2, opacity: 0.22 + i * 0.02 }));
  }
  out.push(path(`M-20 ${base + 24}Q${w * 0.3} ${base + 4} ${w * 0.55} ${base + 22}T${w + 20} ${base + 18}V${base - 2}H-20Z`, { fill: p.farBand }));
  out.push(g({ fill: p.farBand }, ellipse(w * 0.86, base + 40, 52, 18), ellipse(w * 0.12, base + 52, 40, 14)));
  return g({}, ...out);
}

function riverBand(w: number, base: number, p: Palette, r: Rng): string {
  const out: string[] = [];
  out.push(path(`M-20 ${base + 6}Q${w * 0.25} ${base - 14} ${w * 0.5} ${base + 4}T${w + 20} ${base}V${base - 40}H-20Z`, { fill: p.farBand }));
  out.push(rect(0, base + 4, w, 400, { fill: p.nearBand }));
  out.push(rect(0, base + 4, w, 400, { fill: "url(#gWater)", opacity: 0.55 }));
  for (let i = 0; i < 8; i++) {
    const y = base + 26 + i * 22;
    const off = r.range(-40, 40);
    out.push(path(`M${-10 + off} ${y}q40 -9 80 0t80 0t80 0t80 0t80 0t80 0t80 0t80 0`, { fill: "none", stroke: p.spark, "stroke-width": 2, opacity: 0.2 + i * 0.02 }));
  }
  return g({}, ...out);
}

function desertBand(w: number, base: number, p: Palette, r: Rng): string {
  const out: string[] = [];
  out.push(path(`M-20 ${base + 300}V${base + 30}Q${w * 0.3} ${base - 20} ${w * 0.62} ${base + 26}T${w + 20} ${base + 10}V${base + 300}Z`, { fill: p.farBand }));
  out.push(path(`M-20 ${base + 300}V${base + 90}Q${w * 0.24} ${base + 40} ${w * 0.55} ${base + 86}T${w + 20} ${base + 70}V${base + 300}Z`, { fill: p.nearBand }));
  for (let i = 0; i < 4; i++) {
    const x = r.range(40, w - 40);
    out.push(g({ transform: tr(x, base + 54) }, line(0, 0, 0, -26, { stroke: p.nearBand, "stroke-width": 4 }), ring(6, (j, d) => path(leaf(24, 9), { fill: p.nearBand, transform: rot(d * 0.5 - 130) + " " + tr(0, -26) }))));
  }
  return g({}, ...out);
}

function forestBand(w: number, base: number, p: Palette, r: Rng): string {
  const out: string[] = [rect(0, base + 40, w, 300, { fill: p.nearBand })];
  let x = -20;
  while (x < w + 20) {
    const s = r.range(0.6, 1.25);
    out.push(
      g(
        { transform: `${tr(x, base + 46)} ${sc(s)}` },
        line(0, 0, 0, -30, { stroke: p.farBand, "stroke-width": 6 }),
        circle(0, -44, 26, { fill: p.farBand }),
        circle(-20, -30, 18, { fill: p.farBand }),
        circle(20, -32, 17, { fill: p.farBand }),
      ),
    );
    x += r.range(40, 76);
  }
  return g({}, ...out);
}

function cityBand(w: number, base: number, p: Palette, r: Rng): string {
  const out: string[] = [];
  let x = -20;
  while (x < w + 20) {
    const bw = r.range(50, 96);
    const bh = r.range(40, 120);
    out.push(rect(x, base + 20 - bh, bw, bh + 40, { fill: p.farBand }));
    if (r.chance(0.4)) out.push(path(`M${x} ${base + 20 - bh}A${bw / 2} ${bw / 2} 0 0 1 ${x + bw} ${base + 20 - bh}Z`, { fill: p.farBand }));
    for (let i = 0; i < 3; i++) {
      if (r.chance(0.55)) out.push(rect(x + 10 + i * (bw / 3.4), base + 40 - bh + 16, 12, 16, { fill: p.gold, opacity: 0.35 }));
    }
    x += bw * r.range(0.85, 1.15);
  }
  out.push(rect(0, base + 56, w, 200, { fill: p.nearBand }));
  return g({}, ...out);
}

export function band(kind: BandKind, w: number, h: number, p: Palette, r: Rng, baseFrac = 0.72): string {
  const base = h * baseFrac;
  switch (kind) {
    case "temple":
      return templeBand(w, base, p, r);
    case "ghat":
      return ghatBand(w, base - 30, p, r);
    case "hills":
      return hillsBand(w, base, p, r);
    case "snow":
      return hillsBand(w, base, p, r, true);
    case "sea":
      return seaBand(w, base, p, r);
    case "river":
      return riverBand(w, base, p, r);
    case "desert":
      return desertBand(w, base, p, r);
    case "forest":
      return forestBand(w, base, p, r);
    case "city":
      return cityBand(w, base, p, r);
    default:
      return "";
  }
}

/* ───────────────────────── garlands and frames ───────────────────────── */

/**
 * Reusable flower symbols. A garland is a hundred-odd blossoms, so they are
 * defined once and instanced with `<use>` — inlining each one blew the file
 * size past 150 KB.
 */
export { FLOWER_UNIT } from "./emblems";
export function flowerDefs(p: Palette): string {
  return (
    `<g id="flA">${marigold(FLOWER_UNIT, p.petalA, p.petalB)}</g>` +
    `<g id="flB">${marigold(FLOWER_UNIT, p.petalB, p.petalA)}</g>` +
    `<g id="flL">${path(leaf(FLOWER_UNIT * 2.1, FLOWER_UNIT * 1.1), { fill: p.spark, opacity: 0.38 })}</g>`
  );
}

/** A hanging marigold swag across the given span. */
export function garland(w: number, yTop: number, sag: number, p: Palette, r: Rng, gap = 26, radius = 13): string {
  const out: string[] = [];
  const pts: number[][] = [];
  const count = Math.ceil(w / gap) + 2;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = -gap + t * (w + gap * 2);
    const y = yTop + Math.sin(Math.PI * t) * sag;
    pts.push([x, y]);
  }
  out.push(path(`M${pts[0][0]} ${pts[0][1]}` + pts.slice(1).map(([x, y]) => `L${x} ${y}`).join(""), { fill: "none", stroke: p.petalB, "stroke-width": 3, opacity: 0.55 }));
  pts.forEach(([x, y], i) => {
    if (i % 4 === 2) out.push(`<use href="#flL" transform="${tr(x, y - 2)} ${rot(r.range(-20, 20))} ${sc((radius * 0.85) / FLOWER_UNIT)}"/>`);
    const s = (radius * (i % 2 ? 0.86 : 1)) / FLOWER_UNIT;
    out.push(`<use href="#${i % 3 === 0 ? "flB" : "flA"}" transform="${tr(x, y)} ${sc(s)}"/>`);
  });
  return g({}, ...out);
}

/** Dense marigold border running along the bottom edge. */
export function bottomGarland(w: number, h: number, p: Palette, r: Rng): string {
  return g(
    {},
    rect(0, h - 74, w, 74, { fill: "url(#gFoot)" }),
    garland(w, h - 56, 16, p, r, Math.max(32, w / 25), 16),
    garland(w, h - 26, 10, p, r, Math.max(27, w / 30), 13),
  );
}

/** Two garlands hanging in from the top corners. */
export function topGarland(w: number, p: Palette, r: Rng): string {
  return g({ opacity: 0.95 }, garland(w, 8, 46, p, r, 34, 13));
}

/** Gold scrollwork in the four corners. */
export function filigree(w: number, h: number, p: Palette): string {
  const corner =
    "M0 0H108C86 8 70 22 62 44C54 66 40 82 18 90V108C-2 96-8 74-2 54C4 34 20 22 44 18C24 16 8 10 0 0Z";
  const one = (x: number, y: number, sx: number, sy: number) =>
    g({ transform: `${tr(x, y)} ${sc(sx * 0.82, sy * 0.82)}` }, path(corner, { fill: p.line, opacity: 0.2 }), path("M6 6H86C60 18 44 40 34 74", { fill: "none", stroke: p.goldSoft, "stroke-width": 2, opacity: 0.3 }));
  return g({}, one(16, 16, 1, 1), one(w - 16, 16, -1, 1), one(16, h - 16, 1, -1), one(w - 16, h - 16, -1, -1));
}

/** Thin double border just inside the canvas edge. */
export function borderFrame(w: number, h: number, p: Palette, inset = 16): string {
  return g(
    { fill: "none" },
    rect(inset, inset, w - inset * 2, h - inset * 2, { stroke: p.line, "stroke-width": 2.4, opacity: 0.45, rx: 8 }),
    rect(inset + 7, inset + 7, w - (inset + 7) * 2, h - (inset + 7) * 2, { stroke: p.goldSoft, "stroke-width": 1, opacity: 0.3, rx: 5 }),
  );
}

/** A temple arch framing the emblem, with a toran of leaves and bells. */
export function archFrame(cx: number, cy: number, rx: number, ry: number, p: Palette): string {
  const top = cy - ry;
  return g(
    {},
    path(`M${cx - rx} ${cy + ry}V${cy}A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}V${cy + ry}`, { fill: "none", stroke: p.line, "stroke-width": 5, opacity: 0.5 }),
    path(`M${cx - rx + 12} ${cy + ry}V${cy}A${rx - 12} ${ry - 12} 0 0 1 ${cx + rx - 12} ${cy}V${cy + ry}`, { fill: "none", stroke: p.goldSoft, "stroke-width": 1.6, opacity: 0.35 }),
    ...Array.from({ length: 11 }, (_, i) => {
      const t = i / 10;
      const a = Math.PI * (1 - t);
      const x = cx + Math.cos(a) * (rx - 4);
      const y = cy - Math.sin(a) * (ry - 4);
      return g({ transform: tr(x, y) }, path(leaf(18, 10), { fill: p.line, opacity: 0.45, transform: rot(180) }), circle(0, 22, 4, { fill: p.goldSoft, opacity: 0.5 }));
    }),
    circle(cx, top - 4, 8, { fill: p.goldSoft, opacity: 0.6 }),
  );
}

/** A moon hanging in the upper sky (behind the emblem). */
export function skyMoon(x: number, y: number, radius: number, p: Palette, phase: "full" | "crescent"): string {
  return g(
    {},
    circle(x, y, radius * 2.1, { fill: p.spark, opacity: 0.18, filter: "url(#fGlow)" }),
    phase === "full"
      ? g({}, circle(x, y, radius, { fill: p.spark, opacity: 0.9 }), g({ fill: p.emblemDeep, opacity: 0.12 }, circle(x - radius * 0.34, y - radius * 0.3, radius * 0.22), circle(x + radius * 0.26, y + radius * 0.1, radius * 0.27), circle(x - radius * 0.1, y + radius * 0.4, radius * 0.15)))
      : path(`M${x + radius * 0.42} ${y - radius * 0.9}A${radius} ${radius} 0 1 0 ${x + radius * 0.42} ${y + radius * 0.9}A${radius * 1.2} ${radius * 1.2} 0 0 1 ${x + radius * 0.42} ${y - radius * 0.9}Z`, { fill: p.spark, opacity: 0.9 }),
  );
}

/** A row of small lamps standing on the horizon line. */
export function lampRow(w: number, y: number, p: Palette, count = 7): string {
  return g(
    {},
    ...Array.from({ length: count }, (_, i) => {
      const x = (w / (count + 1)) * (i + 1);
      const s = i % 2 ? 0.24 : 0.3;
      return g(
        { transform: `${tr(x, y)} ${sc(s)}` },
        circle(0, -30, 70, { fill: p.gold, opacity: 0.22, filter: "url(#fGlow)" }),
        path("M-84 20C-88 52-46 72 0 72S88 52 84 20Z", { fill: p.nearBand }),
        ellipse(0, 20, 84, 20, { fill: p.gold, opacity: 0.85 }),
        path("M0-70C-24-40-30-18-18-2C-8 10 8 10 18-2C30-18 24-40 0-70Z", { fill: "url(#gFlame)" }),
      );
    }),
  );
}
