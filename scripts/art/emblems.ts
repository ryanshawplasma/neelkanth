/**
 * The emblem library.
 *
 * Every emblem is drawn centred on (0,0) inside a box of roughly +/-140, so the
 * composer can drop it anywhere and scale it. Emblems reference the gradients
 * and filters that `compose.ts` always emits:
 *
 *   url(#gEmb)   emblem body (light -> deep)
 *   url(#gGold)  gold leaf
 *   url(#gFlame) flame
 *   url(#gMetal) silver / stone
 *   url(#gPetA)  marigold, url(#gPetB) second flower
 *   filter="url(#fGlow)"  wide soft halo
 *   filter="url(#fSoft)"  tight blur
 */
import type { Palette } from "./palette";
import type { Rng } from "./rand";
import { arcPath, type Attrs, circle, ellipse, flame, g, leaf, line, path, petal, poly, pt, rect, ring, rot, sc, star, tr } from "./svg";

export type EmblemFn = (p: Palette, r: Rng) => string;

/* ────────────────────────── shared sub-shapes ────────────────────────── */

/** Warm halo disc placed behind an emblem. */
export function halo(r: number, colour: string, opacity = 0.5): string {
  return circle(0, 0, r, { fill: colour, opacity, filter: "url(#fGlow)" });
}

/** A single marigold: layered ruffled petals plus a seeded centre. */
export function marigold(radius: number, a: string, b: string, seedRot = 0): string {
  return g(
    { transform: rot(seedRot) },
    circle(0, 0, radius, { fill: b }),
    ring(9, (i, d) => circle(...pt(0, 0, radius * 0.62, d), radius * 0.42, { fill: a, opacity: 0.95 })),
    ring(7, (i, d) => circle(...pt(0, 0, radius * 0.3, d + 25), radius * 0.3, { fill: b, opacity: 0.9 })),
    circle(0, 0, radius * 0.26, { fill: a }),
    circle(0, 0, radius * 0.12, { fill: b, opacity: 0.8 }),
  );
}

/**
 * The radius the `#flA` / `#flB` symbols in `<defs>` are drawn at. Anything that
 * needs more than a couple of blossoms instances them instead of inlining.
 */
export const FLOWER_UNIT = 20;

/** Instance of a pre-defined marigold. */
export function flower(x: number, y: number, radius: number, variant: "A" | "B" = "A", deg = 0): string {
  const t = `${tr(x, y)}${deg ? " " + rot(deg) : ""} ${sc(radius / FLOWER_UNIT)}`;
  return `<use href="#fl${variant}" transform="${t}"/>`;
}

/** A bel-patra trefoil (three leaflets on a short stalk). */
export function belPatra(size: number, fill: string): string {
  const one = (deg: number, s: number) =>
    g({ transform: `${rot(deg)} ${sc(s)}` }, path(leaf(size, size * 0.62), { fill }), line(0, 0, 0, -size * 0.9, { stroke: "#000", "stroke-opacity": 0.16, "stroke-width": 1.4 }));
  return g({}, one(-38, 0.88), one(0, 1), one(38, 0.88));
}

/** Small rounded flame stack used by diyas, havan kunds and aartis. */
export function flameStack(h: number, w: number, p: Palette): string {
  return g(
    {},
    circle(0, -h * 0.45, h * 0.62, { fill: p.gold, opacity: 0.28, filter: "url(#fGlow)" }),
    path(flame(h, w), { fill: "url(#gFlame)" }),
    path(flame(h * 0.6, w * 0.5), { fill: p.goldSoft, opacity: 0.95 }),
    path(flame(h * 0.3, w * 0.26), { fill: "#fffdf5" }),
  );
}

/** Gold rim + inner line, used on plates, rings and shields. */
function goldRing(radius: number, w: number): string {
  return g(
    {},
    circle(0, 0, radius, { fill: "none", stroke: "url(#gGold)", "stroke-width": w }),
    circle(0, 0, radius - w * 0.9, { fill: "none", stroke: "#000", "stroke-opacity": 0.15, "stroke-width": 1 }),
  );
}

/** Swastik glyph, right-facing, centred, total span ~2*s. */
export function swastikGlyph(s: number, fill: string, dots = true): string {
  const t = s * 0.26;
  const L = s;
  const h = s * 0.62;
  const bar = (x: number, y: number, w: number, hh: number) => rect(x, y, w, hh, { fill, rx: t * 0.22 });
  return g(
    {},
    bar(-t / 2, -L, t, L * 2),
    bar(-L, -t / 2, L * 2, t),
    bar(t / 2 - t, -L, h, t), // top arm -> right
    bar(L - t, t / 2 - t + t, t, h), // right arm -> down
    bar(L - h - t + t - h, L - t, h, t), // bottom arm -> left
    bar(-L, -L, t, h), // left arm -> up
    dots &&
      g(
        { fill, opacity: 0.85 },
        circle(L * 0.55, -L * 0.55, t * 0.3),
        circle(-L * 0.55, L * 0.55, t * 0.3),
        circle(L * 0.55, L * 0.55, t * 0.3),
        circle(-L * 0.55, -L * 0.55, t * 0.3),
      ),
  );
}

/* ────────────────────────── emblems ────────────────────────── */

const om: EmblemFn = (p) => {
  const w = 16;
  const stroke = { fill: "none", stroke: "url(#gEmb)", "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" } as const;
  const shadow = { fill: "none", stroke: "#000", "stroke-opacity": 0.2, "stroke-width": w + 4, "stroke-linecap": "round" } as const;
  // The lower bowl and the upper curl are circular arcs with a gap at the top
  // right, where the long tail leaves the glyph and hooks back on itself.
  const bowl = arcPath(-34, 40, 54, 44, 332);
  const curl = arcPath(-40, -38, 30, 148, 388);
  const tail = "M-22-64C16-88 66-70 68-30C70 4 42 24 22 12C8 4 10-12 25-15";
  const chandra = "M16-92Q48-120 80-92Q48-105 16-92Z";
  const glyph = (a: Record<string, string | number>) => g({}, path(bowl, a), path(curl, a), path(tail, a));
  return g(
    {},
    halo(132, p.glow, 0.42),
    g({ transform: tr(3, 5) }, glyph(shadow)),
    glyph(stroke),
    // the same strokes, thinner and lighter, read as a polished highlight
    g({ opacity: 0.35, transform: tr(-2, -3) }, glyph({ fill: "none", stroke: "#fff", "stroke-width": w * 0.28, "stroke-linecap": "round" })),
    path(chandra, { fill: "url(#gGold)" }),
    circle(48, -116, 11, { fill: "url(#gGold)" }),
    circle(48, -116, 4.5, { fill: p.goldSoft }),
  );
};

const shivling: EmblemFn = (p) => {
  const linga = "M-40 44V-24A40 40 0 0 1 40-24V44Z";
  return g(
    {},
    halo(130, p.glow, 0.4),
    // jaladhari platform with its spout to the left
    path("M-118 62L-70 44H62Q92 44 92 66T62 88H-38Q-64 88-82 78Z", { fill: "url(#gMetal)" }),
    path("M-118 62L-70 44H62Q92 44 92 66H-96Z", { fill: p.emblem, opacity: 0.35 }),
    ellipse(0, 46, 62, 15, { fill: p.emblemDeep, opacity: 0.75 }),
    // the lingam
    path(linga, { fill: "url(#gMetal)" }),
    path("M-40 44V-24A40 40 0 0 1 0-64V44Z", { fill: "#fff", opacity: 0.16 }),
    // tripundra
    g({ stroke: p.accent, "stroke-linecap": "round", opacity: 0.92 }, line(-27, -30, 27, -30, { "stroke-width": 6 }), line(-31, -16, 31, -16, { "stroke-width": 6 }), line(-30, -2, 30, -2, { "stroke-width": 6 })),
    circle(0, 16, 7, { fill: p.petalB, opacity: 0.9 }),
    // bel patra resting on the platform
    g({ transform: `${tr(-66, 40)} ${rot(-28)}` }, belPatra(30, p.accent)),
    g({ transform: `${tr(64, 40)} ${rot(24)}` }, belPatra(26, p.accent)),
    // abhishek drops
    g({ fill: p.spark, opacity: 0.85 }, ellipse(0, -92, 4, 9), ellipse(-13, -114, 3, 7), ellipse(12, -128, 2.6, 6)),
  );
};

const trishul: EmblemFn = (p) => {
  const prong = (dir: number) =>
    path(`M${26 * dir}-42C${54 * dir}-52 ${60 * dir}-84 ${46 * dir}-124C${40 * dir}-104 ${32 * dir}-92 ${14 * dir}-84C${20 * dir}-66 ${20 * dir}-52 ${14 * dir}-42Z`, {
      fill: "url(#gMetal)",
    });
  return g(
    {},
    halo(126, p.glow, 0.38),
    rect(-5.5, -50, 11, 186, { fill: "url(#gEmb)", rx: 5 }),
    prong(1),
    prong(-1),
    path("M-7-56C-7-96-4-120 0-146C4-120 7-96 7-56Z", { fill: "url(#gMetal)" }),
    rect(-58, -56, 116, 15, { fill: "url(#gGold)", rx: 7 }),
    circle(0, -48.5, 9, { fill: p.accent }),
    // damru knotted to the shaft
    g(
      { transform: tr(0, 40) },
      path("M-34-30L34-30L9 0L34 30L-34 30L-9 0Z", { fill: "url(#gEmb)" }),
      rect(-11, -5, 22, 10, { fill: p.emblemDeep }),
      g({ stroke: "url(#gGold)", "stroke-width": 3, fill: "none" }, path("M-30-24H30"), path("M-30 24H30")),
      g({ fill: p.petalB }, circle(-40, 14, 6), circle(42, 12, 6)),
      g({ stroke: p.petalB, "stroke-width": 2.4, fill: "none" }, path("M-8 0Q-26 6-40 14"), path("M8 0Q26 4 42 12")),
    ),
    rect(-14, 126, 28, 12, { fill: "url(#gGold)", rx: 5 }),
  );
};

const chakra: EmblemFn = (p) => {
  const R = 108;
  return g(
    {},
    halo(134, p.glow, 0.45),
    // outer flame tongues
    ring(16, (i, d) => g({ transform: rot(d) }, path(flame(34, 22), { fill: "url(#gFlame)", transform: tr(0, -R + 2) + " " + rot(180) }))),
    circle(0, 0, R, { fill: "none", stroke: "url(#gGold)", "stroke-width": 14 }),
    path(star(0, 0, R - 14, R - 24, 24), { fill: "url(#gEmb)" }),
    circle(0, 0, R - 26, { fill: p.skyOut, opacity: 0.55 }),
    circle(0, 0, R - 26, { fill: "none", stroke: "url(#gGold)", "stroke-width": 5 }),
    // eight tapered spokes
    ring(8, (i, d) => path("M0-78L11-16L0 0L-11-16Z", { fill: "url(#gGold)", transform: rot(d) })),
    circle(0, 0, 26, { fill: "url(#gGold)" }),
    ring(8, (i, d) => path(petal(20, 13), { fill: p.emblem, opacity: 0.9, transform: rot(d) + " " + tr(0, 0) })),
    circle(0, 0, 10, { fill: p.accent }),
    circle(0, 0, 4, { fill: "#fff", opacity: 0.9 }),
  );
};

const shankh: EmblemFn = (p) => {
  const body = "M-78 52C-96 22-70-22-24-52C10-74 48-88 72-90C60-66 50-34 38-4C24 32-14 68-48 74C-62 76-72 66-78 52Z";
  return g(
    {},
    halo(124, p.glow, 0.4),
    path(body, { fill: "url(#gMetal)", transform: rot(-12) }),
    g(
      { transform: rot(-12), fill: "none", stroke: p.emblemDeep, "stroke-opacity": 0.55, "stroke-width": 3, "stroke-linecap": "round" },
      path("M-56 44C-64 22-44-14-8-38"),
      path("M-34 58C-44 34-24 0 10-26"),
      path("M-8 66C-20 44-2 14 28-14"),
    ),
    // flared lip
    path("M-78 52C-92 60-96 78-84 88C-64 104-24 96-6 76C-24 82-58 78-78 52Z", { fill: "url(#gGold)", transform: rot(-12) }),
    // spiral apex
    g({ transform: `${rot(-12)} ${tr(60, -76)}`, fill: "none", stroke: "url(#gGold)", "stroke-width": 5, "stroke-linecap": "round" }, path("M14 4C14-8 2-14-6-8S-12 8 0 10")),
    ellipse(-20, -30, 26, 9, { fill: "#fff", opacity: 0.35, transform: rot(-38) }),
    g({ fill: p.petalA, opacity: 0.9 }, circle(-86, 84, 7), circle(-66, 96, 5.5), circle(84, -78, 6)),
  );
};

const lotus: EmblemFn = (p) => {
  return g(
    {},
    halo(134, p.glow, 0.45),
    ring(14, (i, d) => path(petal(122, 44, 0.5), { fill: p.emblemDeep, opacity: 0.85, transform: rot(d + 12.8) })),
    ring(12, (i, d) => path(petal(104, 42, 0.55), { fill: "url(#gEmb)", transform: rot(d) })),
    ring(10, (i, d) => path(petal(78, 36, 0.6), { fill: "url(#gPetB)", opacity: 0.95, transform: rot(d + 18) })),
    ring(8, (i, d) => path(petal(50, 28, 0.65), { fill: "url(#gGold)", transform: rot(d) })),
    circle(0, 0, 22, { fill: p.goldSoft }),
    ring(8, (i, d) => circle(...pt(0, 0, 11, d), 3.2, { fill: p.emblemDeep, opacity: 0.7 })),
    circle(0, 0, 4, { fill: p.emblemDeep, opacity: 0.7 }),
  );
};

const kalash: EmblemFn = (p) => {
  return g(
    {},
    halo(128, p.glow, 0.4),
    // pot
    path("M-58-6C-72 22-66 62-40 84C-22 98 22 98 40 84C66 62 72 22 58-6Z", { fill: "url(#gGold)" }),
    path("M-58-6C-70 20-66 56-46 78C-42 42-46 14-34-6Z", { fill: "#fff", opacity: 0.22 }),
    rect(-48, 86, 96, 14, { fill: "url(#gEmb)", rx: 6 }),
    // neck + rim
    rect(-26, -30, 52, 26, { fill: "url(#gGold)" }),
    rect(-46, -42, 92, 16, { fill: "url(#gGold)", rx: 7 }),
    g({ stroke: p.petalB, "stroke-width": 3.5, opacity: 0.85 }, line(-52, 6, 52, 6), line(-56, 18, 56, 18)),
    g({ transform: tr(0, 44) }, swastikGlyph(20, p.petalB, false)),
    // mango leaves around the rim
    ring(7, (i, d) => {
      const a = -66 + i * 22;
      return g({ transform: `${tr(Math.sin((a * Math.PI) / 180) * 34, -44)} ${rot(a)}` }, path(leaf(56, 26), { fill: p.accent, opacity: 0.95 }), path(leaf(56, 26), { fill: "#000", opacity: 0.08, transform: sc(0.5, 1) }));
    }),
    // coconut and tuft
    ellipse(0, -74, 26, 30, { fill: p.emblemDeep }),
    ellipse(-8, -82, 10, 12, { fill: "#fff", opacity: 0.2 }),
    g({ stroke: p.accent, "stroke-width": 3, "stroke-linecap": "round" }, line(0, -102, -14, -122), line(0, -102, 0, -126), line(0, -102, 14, -122)),
    circle(0, -100, 6, { fill: "url(#gGold)" }),
  );
};

const diya: EmblemFn = (p) => {
  return g(
    {},
    halo(128, p.glow, 0.5),
    g({ transform: tr(0, 34) }, flameStack(104, 50, p)),
    // lamp body
    path("M-84 20C-88 52-46 72 0 72S88 52 84 20Z", { fill: "url(#gEmb)" }),
    path("M-84 20C-86 44-56 60-18 66C-42 52-58 38-62 20Z", { fill: "#fff", opacity: 0.18 }),
    ellipse(0, 20, 84, 20, { fill: p.emblemDeep }),
    ellipse(0, 20, 70, 14, { fill: p.gold, opacity: 0.9 }),
    // pinched wick spout
    path("M-84 20C-100 14-104 4-96 0C-88-4-76 6-72 16Z", { fill: "url(#gEmb)" }),
    ellipse(0, 74, 60, 12, { fill: p.emblemDeep, opacity: 0.55 }),
    g({ fill: p.petalA, opacity: 0.9 }, circle(-92, 60, 8), circle(96, 58, 7), circle(-70, 76, 6)),
  );
};

const swastik: EmblemFn = (p) => {
  return g(
    {},
    halo(126, p.glow, 0.42),
    ring(12, (i, d) => path(petal(120, 40, 0.5), { fill: p.emblemDeep, opacity: 0.4, transform: rot(d + 15) })),
    circle(0, 0, 96, { fill: p.skyOut, opacity: 0.25 }),
    circle(0, 0, 96, { fill: "none", stroke: "url(#gGold)", "stroke-width": 6 }),
    circle(0, 0, 84, { fill: "none", stroke: "url(#gGold)", "stroke-width": 2, "stroke-dasharray": "6 8" }),
    g({ transform: tr(-4, -4) }, swastikGlyph(58, "url(#gGold)")),
  );
};

const peacockFlute: EmblemFn = (p) => {
  const feather = g(
    { transform: `${tr(6, -22)} ${rot(-8)}` },
    line(0, 118, 0, -34, { stroke: "#2f9e7e", "stroke-width": 5, "stroke-linecap": "round" }),
    ...Array.from({ length: 22 }, (_, i) => {
      const t = i / 21;
      const y = 112 - t * 100;
      const len = 12 + t * 52;
      return g(
        { stroke: i % 2 ? "#3fbf94" : "#2f9e7e", "stroke-width": 2.4, opacity: 0.8, "stroke-linecap": "round" },
        line(0, y, -len, y - len * 0.62),
        line(0, y, len, y - len * 0.62),
      );
    }),
    ellipse(0, -58, 44, 54, { fill: "#3fbf94" }),
    ellipse(0, -58, 32, 40, { fill: "#1f6fa8" }),
    path("M0-92C22-92 32-72 25-54C18-36 5-28 0-20C-5-28-18-36-25-54C-32-72-22-92 0-92Z", { fill: "#102c58" }),
    ellipse(0, -64, 10, 14, { fill: "url(#gGold)", opacity: 0.95 }),
  );
  const flute = g(
    { transform: rot(-24) },
    rect(-118, -12, 236, 24, { fill: "url(#gEmb)", rx: 12 }),
    rect(-118, -12, 236, 9, { fill: "#fff", opacity: 0.22, rx: 6 }),
    g({ fill: p.emblemDeep }, ...[-70, -44, -18, 8, 34, 60, 86].map((x) => circle(x, 0, 5))),
    rect(-124, -15, 16, 30, { fill: "url(#gGold)", rx: 5 }),
    rect(108, -15, 16, 30, { fill: "url(#gGold)", rx: 5 }),
    g({ stroke: p.petalB, "stroke-width": 3, fill: "none" }, path("M112 14Q120 32 106 44")),
  );
  return g({}, halo(132, p.glow, 0.42), feather, g({ transform: tr(0, 44) }, flute), flower(-96, 92, 13, "A", 20));
};

const gada: EmblemFn = (p) => {
  return g(
    {},
    halo(128, p.glow, 0.4),
    // Dronagiri, the herb-bearing peak Hanuman carried
    g(
      { opacity: 0.85 },
      path("M-146 108L-70-40L-18 34L28-24L122 108Z", { fill: p.emblemDeep, opacity: 0.5 }),
      path("M-70-40L-46 8H-94Z", { fill: p.emblem, opacity: 0.55 }),
      path("M28-24L44 6H12Z", { fill: p.emblem, opacity: 0.4 }),
      g({ fill: p.accent, opacity: 0.5 }, circle(-104, 66, 12), circle(-84, 82, 9), circle(76, 70, 11), circle(96, 86, 8)),
    ),
    // handle
    g(
      { transform: rot(13) },
      rect(-12, -10, 24, 138, { fill: "url(#gEmb)", rx: 11 }),
      rect(-12, -10, 9, 138, { fill: "#fff", opacity: 0.18, rx: 5 }),
      rect(-16, 26, 32, 11, { fill: "url(#gGold)", rx: 5 }),
      rect(-16, 70, 32, 11, { fill: "url(#gGold)", rx: 5 }),
      circle(0, 128, 16, { fill: "url(#gGold)" }),
      circle(0, 128, 7, { fill: p.emblemDeep, opacity: 0.45 }),
    ),
    // mace head
    g(
      { transform: `${rot(13)} ${tr(0, -60)}` },
      rect(-30, 40, 60, 16, { fill: "url(#gGold)", rx: 7 }),
      ellipse(0, 0, 56, 64, { fill: "url(#gGold)" }),
      ellipse(-18, -18, 17, 24, { fill: "#fff", opacity: 0.3 }),
      g({ fill: "none", stroke: p.emblemDeep, "stroke-opacity": 0.45, "stroke-width": 3 }, path("M-52-16H52"), path("M-52 18H52"), path("M0-64V64"), path("M-30-58Q-42 0-30 58"), path("M30-58Q42 0 30 58")),
      rect(-34, -58, 68, 14, { fill: "url(#gGold)", rx: 6 }),
      path(star(0, -80, 17, 7, 5), { fill: p.accent }),
    ),
    g({ fill: p.petalB, opacity: 0.9 }, circle(-64, 92, 9), circle(-38, 104, 7), circle(62, 96, 8)),
  );
};

const bowArrow: EmblemFn = (p) => {
  return g(
    {},
    halo(128, p.glow, 0.4),
    // bow limb
    path("M42-128C-24-84-24 84 42 128", { fill: "none", stroke: "url(#gGold)", "stroke-width": 16, "stroke-linecap": "round" }),
    path("M42-128C-16-84-16 84 42 128", { fill: "none", stroke: "#fff", "stroke-opacity": 0.25, "stroke-width": 4 }),
    rect(-18, -26, 16, 52, { fill: p.emblemDeep, rx: 6 }),
    // string
    line(42, -128, 42, 128, { stroke: p.emblem, "stroke-width": 3, opacity: 0.85 }),
    // arrow
    g(
      { transform: tr(0, 0) },
      rect(-4, -4, 150, 8, { fill: "url(#gEmb)", rx: 4 }),
      poly([[146, -16], [186, 0], [146, 16]], { fill: "url(#gGold)" }),
      g({ fill: p.accent, opacity: 0.9 }, poly([[6, -6], [30, -20], [34, -6]]), poly([[6, 6], [30, 20], [34, 6]])),
    ),
    g({ fill: p.petalA, opacity: 0.9 }, circle(-58, 96, 8), circle(-34, 110, 6)),
  );
};

const sun: EmblemFn = (p) => {
  return g(
    {},
    halo(140, p.glow, 0.55),
    ring(12, (i, d) => poly([[-9, -74], [0, -138], [9, -74]], { fill: "url(#gGold)", transform: rot(d) })),
    ring(12, (i, d) => poly([[-6, -72], [0, -104], [6, -72]], { fill: p.accent, opacity: 0.85, transform: rot(d + 15) })),
    circle(0, 0, 72, { fill: "url(#gFlame)" }),
    circle(0, 0, 72, { fill: "none", stroke: "url(#gGold)", "stroke-width": 6 }),
    circle(0, 0, 56, { fill: "none", stroke: p.emblemDeep, "stroke-opacity": 0.35, "stroke-width": 2, "stroke-dasharray": "4 7" }),
    ring(8, (i, d) => path(petal(40, 22), { fill: p.goldSoft, opacity: 0.55, transform: rot(d) })),
    circle(0, 0, 16, { fill: p.goldSoft }),
  );
};

const crescentMoon: EmblemFn = (p) => {
  return g(
    {},
    halo(134, p.glow, 0.5),
    path("M46-96A100 100 0 1 0 46 96A118 118 0 0 1 46-96Z", { fill: "url(#gMetal)" }),
    path("M22-78A82 82 0 1 0 22 78A96 96 0 0 1 22-78Z", { fill: "#fff", opacity: 0.16 }),
    g({ fill: p.spark, opacity: 0.9 }, path(star(78, -70, 15, 5, 4)), path(star(104, 6, 10, 3.4, 4)), path(star(66, 82, 12, 4, 4))),
  );
};

const mala: EmblemFn = (p) => {
  const R = 104;
  return g(
    {},
    halo(132, p.glow, 0.4),
    circle(0, 0, R, { fill: "none", stroke: p.emblemDeep, "stroke-width": 2, opacity: 0.6 }),
    ring(32, (i, d) => {
      const [x, y] = pt(0, 0, R, d);
      return g({ transform: tr(x, y) }, circle(0, 0, 12, { fill: "url(#gEmb)" }), circle(-3, -3, 4, { fill: "#fff", opacity: 0.3 }), g({ stroke: p.emblemDeep, "stroke-width": 1.2, opacity: 0.7, fill: "none" }, path("M-9-4Q0 0-9 4"), path("M9-4Q0 0 9 4")));
    }),
    // meru bead + tassel
    g(
      { transform: tr(0, R + 6) },
      ellipse(0, 0, 18, 22, { fill: "url(#gGold)" }),
      rect(-9, 18, 18, 12, { fill: p.emblemDeep, rx: 4 }),
      g({ stroke: p.petalB, "stroke-width": 3, "stroke-linecap": "round" }, line(0, 30, -12, 58), line(0, 30, -4, 62), line(0, 30, 5, 62), line(0, 30, 13, 56)),
    ),
    // a small rosette so the ring is not an empty hoop
    circle(0, 0, 62, { fill: "none", stroke: "url(#gGold)", "stroke-width": 1.4, "stroke-dasharray": "3 9", opacity: 0.55 }),
    ring(8, (i, d) => path(petal(46, 24, 0.6), { fill: "url(#gGold)", opacity: 0.55, transform: rot(d) })),
    ring(8, (i, d) => path(petal(28, 16, 0.65), { fill: p.goldSoft, opacity: 0.55, transform: rot(d + 22) })),
    circle(0, 0, 11, { fill: "url(#gGold)" }),
    circle(0, 0, 4, { fill: p.accent }),
  );
};

const bell: EmblemFn = (p) => {
  return g(
    {},
    halo(126, p.glow, 0.4),
    // handle with a small deity finial
    path("M0-118C-20-118-30-104-30-90C-30-78-22-70-12-66H12C22-70 30-78 30-90C30-104 20-118 0-118Z", { fill: "url(#gGold)" }),
    circle(0, -92, 13, { fill: p.skyOut, opacity: 0.45 }),
    path(star(0, -128, 13, 5, 5), { fill: p.accent }),
    // body
    path("M-16-64C-16-30-62-12-70 40H70C62-12 16-30 16-64Z", { fill: "url(#gGold)" }),
    path("M-16-64C-16-30-56-12-64 40H-38C-32-4-4-28-4-64Z", { fill: "#fff", opacity: 0.22 }),
    rect(-78, 38, 156, 20, { fill: "url(#gGold)", rx: 9 }),
    path("M-78 56Q-39 76 0 56T78 56V60Q39 82 0 60T-78 60Z", { fill: p.emblemDeep }),
    circle(0, 78, 13, { fill: "url(#gEmb)" }),
    // sound
    g({ fill: "none", stroke: p.spark, "stroke-width": 3, opacity: 0.5, "stroke-linecap": "round" }, path("M-100 6Q-116 26-100 46"), path("M100 6Q116 26 100 46"), path("M-120-4Q-142 26-120 56"), path("M120-4Q142 26 120 56")),
  );
};

const serpent: EmblemFn = (p) => {
  // A flat spiral coil: three shrinking turns, then the body rises to the hood.
  const coil =
    "M-40 128C-118 122-136 44-96 2C-58-38 12-34 34 4C54 38 30 76-6 76C-38 76-56 52-48 30C-41 12-20 6-8 18";
  const line3 = (colour: string, wide: number, extra: Attrs = {}) => path(coil, { fill: "none", stroke: colour, "stroke-width": wide, "stroke-linecap": "round", ...extra });
  return g(
    {},
    halo(130, p.glow, 0.38),
    line3(p.emblemDeep, 38),
    line3("url(#gEmb)", 29),
    line3("#fff", 9, { "stroke-opacity": 0.16 }),
    g({ fill: p.emblemDeep, opacity: 0.5 }, circle(-96, 92, 5.5), circle(-116, 40, 5.5), circle(-70, -18, 5.5), circle(4, -12, 5.5), circle(30, 34, 5.5), circle(-16, 62, 5.5)),
    // rising neck into the cobra hood
    path("M-8 18C24 12 54-14 62-56", { fill: "none", stroke: p.emblemDeep, "stroke-width": 32, "stroke-linecap": "round" }),
    path("M-8 18C24 12 54-14 62-56", { fill: "none", stroke: "url(#gEmb)", "stroke-width": 24, "stroke-linecap": "round" }),
    g(
      { transform: `${tr(66, -84)} ${rot(12)}` },
      path("M0 44C-52 34-70-16-52-52C-40-76-4-84 0-84S40-76 52-52C70-16 52 34 0 44Z", { fill: "url(#gEmb)" }),
      path("M0 30C-34 22-48-14-34-42C-26-58-10-64 0-64S26-58 34-42C48-14 34 22 0 30Z", { fill: p.emblemDeep, opacity: 0.4 }),
      // the trishul-like hood marking
      g({ fill: p.accent, opacity: 0.85 }, path("M0-46C10-30 10-8 0 6C-10-8-10-30 0-46Z"), circle(-22, -18, 7), circle(22, -18, 7)),
      // head
      path("M-24 34C-24 16 24 16 24 34C24 52 12 62 0 62S-24 52-24 34Z", { fill: "url(#gEmb)" }),
      g({ fill: p.petalB }, ellipse(-11, 40, 6, 5), ellipse(11, 40, 6, 5)),
      path("M0 62V76M0 76L-9 88M0 76L9 88", { stroke: p.petalB, "stroke-width": 3.4, fill: "none", "stroke-linecap": "round" }),
    ),
  );
};

const navgrah: EmblemFn = (p) => {
  const colours = ["#f0a020", "#e8eef6", "#e0492c", "#4fae5a", "#f0d060", "#f2f2f2", "#3c4a66", "#6a6f7d", "#8a6fd0"];
  return g(
    {},
    halo(134, p.glow, 0.42),
    circle(0, 0, 112, { fill: "none", stroke: "url(#gGold)", "stroke-width": 2, "stroke-dasharray": "4 8", opacity: 0.7 }),
    circle(0, 0, 76, { fill: "none", stroke: "url(#gGold)", "stroke-width": 1.5, opacity: 0.5 }),
    ring(8, (i, d) => {
      const [x, y] = pt(0, 0, 100, d);
      return g(
        { transform: tr(x, y) },
        circle(0, 0, 24, { fill: colours[i], opacity: 0.95 }),
        circle(-7, -7, 8, { fill: "#fff", opacity: 0.3 }),
        circle(0, 0, 24, { fill: "none", stroke: "url(#gGold)", "stroke-width": 3 }),
      );
    }),
    circle(0, 0, 40, { fill: "url(#gFlame)" }),
    circle(0, 0, 40, { fill: "none", stroke: "url(#gGold)", "stroke-width": 5 }),
    ring(12, (i, d) => poly([[-4, -42], [0, -60], [4, -42]], { fill: p.gold, opacity: 0.8, transform: rot(d) })),
    circle(0, 0, 12, { fill: p.goldSoft }),
  );
};

const chunri: EmblemFn = (p) => {
  return g(
    {},
    halo(126, p.glow, 0.4),
    // draped cloth
    path("M-96-84H96L108 46Q54 76 0 60T-108 46Z", { fill: "url(#gPetB)" }),
    path("M-96-84H-20L-16 62Q-64 62-108 46Z", { fill: "#fff", opacity: 0.14 }),
    rect(-100, -92, 200, 20, { fill: "url(#gGold)", rx: 6 }),
    path("M-108 40Q-54 70 0 54T108 40L112 62Q54 92 0 76T-112 62Z", { fill: "url(#gGold)", opacity: 0.95 }),
    // bandhani dots
    g({ fill: p.goldSoft, opacity: 0.75 }, ...Array.from({ length: 30 }, (_, i) => circle(-80 + (i % 6) * 32, -50 + Math.floor(i / 6) * 22, 4))),
    // coconut with mauli thread
    g(
      { transform: tr(0, 74) },
      ellipse(0, 0, 30, 34, { fill: p.emblemDeep }),
      ellipse(-9, -10, 11, 13, { fill: "#fff", opacity: 0.18 }),
      g({ stroke: p.petalB, "stroke-width": 4 }, line(-28, -6, 28, -6), line(-30, 6, 30, 6)),
      g({ stroke: p.accent, "stroke-width": 3, "stroke-linecap": "round" }, line(0, -32, -14, -52), line(0, -32, 0, -56), line(0, -32, 14, -52)),
    ),
  );
};

const garlandHeap: EmblemFn = (p, r) => {
  const flowers: string[] = [];
  const spots: number[][] = [
    [-72, -6, 26], [-30, -30, 30], [16, -34, 28], [58, -8, 26], [-52, 22, 24],
    [-8, 12, 27], [36, 22, 24], [76, 24, 20], [-84, 28, 19], [4, 46, 22], [-40, 52, 18], [46, 50, 18],
  ];
  for (const [x, y, s] of spots) {
    const swap = r.chance(0.4);
    flowers.push(flower(x, y, s, swap ? "B" : "A", r.int(0, 40)));
  }
  return g(
    {},
    halo(128, p.glow, 0.4),
    // basket
    path("M-104 34H104L86 118Q0 138-86 118Z", { fill: "url(#gEmb)" }),
    g({ stroke: p.emblemDeep, "stroke-width": 3, opacity: 0.5, fill: "none" }, path("M-96 58Q0 74 96 58"), path("M-92 82Q0 98 92 82"), path("M-60 36L-52 128"), path("M0 36V134"), path("M60 36L52 128")),
    rect(-112, 22, 224, 20, { fill: "url(#gGold)", rx: 9 }),
    g({ fill: p.accent, opacity: 0.9 }, g({ transform: `${tr(-96, 2)} ${rot(-40)}` }, path(leaf(40, 20))), g({ transform: `${tr(96, 4)} ${rot(38)}` }, path(leaf(38, 19)))),
    ...flowers,
  );
};

const sweetPlate: EmblemFn = (p) => {
  const laddoo = (x: number, y: number, s: number) =>
    g(
      { transform: `${tr(x, y)} ${sc(s)}` },
      circle(0, 0, 28, { fill: "url(#gGold)" }),
      circle(-9, -9, 10, { fill: "#fff", opacity: 0.3 }),
      g({ fill: p.emblemDeep, opacity: 0.3 }, ...Array.from({ length: 9 }, (_, i) => circle(...pt(0, 0, 17, i * 40), 3.2))),
      ...Array.from({ length: 5 }, (_, i) => circle(...pt(0, 0, 8, i * 72 + 20), 2.6, { fill: p.emblemDeep, opacity: 0.25 })),
    );
  return g(
    {},
    halo(128, p.glow, 0.42),
    ellipse(0, 60, 122, 34, { fill: "url(#gEmb)" }),
    ellipse(0, 54, 122, 34, { fill: "url(#gGold)" }),
    ellipse(0, 54, 98, 25, { fill: p.emblem }),
    ellipse(0, 54, 98, 25, { fill: "none", stroke: p.emblemDeep, "stroke-opacity": 0.35, "stroke-width": 2 }),
    laddoo(-56, 30, 1), laddoo(0, 34, 1.05), laddoo(56, 30, 1),
    laddoo(-28, -10, 0.95), laddoo(28, -10, 0.95),
    laddoo(0, -50, 0.9),
    g({ transform: `${tr(-96, 16)} ${rot(-30)}` }, path(leaf(40, 22), { fill: p.accent })),
    g({ transform: `${tr(96, 16)} ${rot(28)}` }, path(leaf(36, 20), { fill: p.accent })),
    g({ transform: tr(0, -84) }, path(star(0, 0, 12, 5, 5), { fill: p.goldSoft, opacity: 0.9 })),
  );
};

const bookDiya: EmblemFn = (p) => {
  const lines = (x0: number, dir: number) =>
    g(
      { stroke: p.emblemDeep, "stroke-opacity": 0.4, "stroke-width": 2.6, "stroke-linecap": "round" },
      ...Array.from({ length: 7 }, (_, i) => line(x0, -34 + i * 13, x0 + dir * (46 - Math.abs(3 - i) * 4), -38 + i * 13 + dir * 2)),
    );
  return g(
    {},
    halo(128, p.glow, 0.42),
    // rehal legs
    g({ stroke: "url(#gEmb)", "stroke-width": 12, "stroke-linecap": "round" }, line(-58, 66, -18, 118), line(58, 66, 18, 118), line(-58, 118, 58, 118)),
    // open book
    path("M0-52C-26-68-66-72-96-66V54C-66 48-26 52 0 68Z", { fill: p.emblem }),
    path("M0-52C26-68 66-72 96-66V54C66 48 26 52 0 68Z", { fill: p.emblem }),
    path("M0-52C-26-68-66-72-96-66V-52C-66-58-26-54 0-38Z", { fill: p.goldSoft }),
    path("M0-52C26-68 66-72 96-66V-52C66-58 26-54 0-38Z", { fill: p.goldSoft }),
    rect(-6, -52, 12, 120, { fill: "url(#gGold)", rx: 4 }),
    lines(-84, 1),
    lines(84, -1),
    path("M-96-66V54M96-66V54", { stroke: "url(#gGold)", "stroke-width": 5, fill: "none", "stroke-linecap": "round" }),
    // diya at the side
    g(
      { transform: `${tr(96, 74)} ${sc(0.5)}` },
      g({ transform: tr(0, 34) }, flameStack(96, 46, p)),
      path("M-84 20C-88 52-46 72 0 72S88 52 84 20Z", { fill: "url(#gEmb)" }),
      ellipse(0, 20, 84, 20, { fill: p.emblemDeep }),
    ),
    flower(-96, 84, 16, "A", 15),
  );
};

const kundli: EmblemFn = (p) => {
  const S = 96;
  const glyph = (x: number, y: number, i: number) =>
    g({ transform: tr(x, y) }, circle(0, 0, 7, { fill: i % 3 === 0 ? p.accent : p.gold, opacity: 0.9 }), circle(0, 0, 11, { fill: "none", stroke: p.goldSoft, "stroke-width": 1.4, opacity: 0.6 }));
  return g(
    {},
    halo(132, p.glow, 0.42),
    // zodiac ring
    circle(0, 0, 134, { fill: "none", stroke: "url(#gGold)", "stroke-width": 2, opacity: 0.55 }),
    ring(12, (i, d) => g({ transform: rot(d) }, line(0, -134, 0, -120, { stroke: p.goldSoft, "stroke-width": 2, opacity: 0.7 }), path(star(0, -127, 4.5, 2, 4), { fill: p.spark, opacity: 0.75 }))),
    // north-indian chart
    rect(-S, -S, S * 2, S * 2, { fill: p.skyOut, opacity: 0.35 }),
    rect(-S, -S, S * 2, S * 2, { fill: "none", stroke: "url(#gGold)", "stroke-width": 6 }),
    path(`M${-S} ${-S}L${S} ${S}M${S} ${-S}L${-S} ${S}`, { stroke: "url(#gGold)", "stroke-width": 3, fill: "none", opacity: 0.9 }),
    path(`M0 ${-S}L${S} 0L0 ${S}L${-S} 0Z`, { fill: "none", stroke: "url(#gGold)", "stroke-width": 4 }),
    glyph(0, -52, 0), glyph(52, 0, 1), glyph(0, 52, 2), glyph(-52, 0, 3),
    glyph(-58, -58, 4), glyph(58, -58, 5), glyph(58, 58, 6), glyph(-58, 58, 7),
    circle(0, 0, 15, { fill: "url(#gGold)" }),
    circle(0, 0, 6, { fill: p.skyOut, opacity: 0.7 }),
  );
};

const mandapRing: EmblemFn = (p) => {
  return g(
    {},
    halo(128, p.glow, 0.42),
    // mandap arch
    g(
      { opacity: 0.9 },
      rect(-118, -34, 18, 150, { fill: "url(#gEmb)", rx: 6 }),
      rect(118 - 18, -34, 18, 150, { fill: "url(#gEmb)", rx: 6 }),
      path("M-118-34Q0-124 118-34", { fill: "none", stroke: "url(#gGold)", "stroke-width": 12 }),
      ...Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        const x = -118 + t * 236;
        const y = -34 - Math.sin(Math.PI * t) * 88 + 10;
        return g({ transform: tr(x, y) }, path(leaf(26, 14), { fill: p.accent, transform: rot(180) }), circle(0, 30, 7, { fill: p.petalA }));
      }),
      g({ fill: "url(#gGold)" }, path("M-118-40h18l-9-18Z"), path("M100-40h18l-9-18Z")),
    ),
    // interlocked rings
    g(
      { transform: tr(0, 30) },
      circle(-30, 0, 44, { fill: "none", stroke: "url(#gGold)", "stroke-width": 12 }),
      circle(30, 0, 44, { fill: "none", stroke: "url(#gGold)", "stroke-width": 12 }),
      circle(-30, 0, 44, { fill: "none", stroke: "#fff", "stroke-opacity": 0.25, "stroke-width": 3 }),
      path(star(30, -44, 12, 5, 5), { fill: p.accent }),
    ),
    flower(-96, 104, 15, "A", 10),
    flower(98, 106, 13, "B", 30),
  );
};

const houseKalash: EmblemFn = (p) => {
  return g(
    {},
    halo(128, p.glow, 0.4),
    // house
    path("M-108 4L0-84L108 4V112H-108Z", { fill: "url(#gEmb)" }),
    path("M-108 4L0-84L108 4L96 16L0-66L-96 16Z", { fill: "url(#gGold)" }),
    rect(-108, 108, 216, 14, { fill: "url(#gGold)", rx: 5 }),
    // door with a toran
    path("M-34 112V44A34 34 0 0 1 34 44V112Z", { fill: p.skyOut, opacity: 0.55 }),
    path("M-34 112V44A34 34 0 0 1 34 44V112Z", { fill: "none", stroke: "url(#gGold)", "stroke-width": 5 }),
    path("M-52 30Q0 56 52 30", { fill: "none", stroke: p.accent, "stroke-width": 4 }),
    ...Array.from({ length: 7 }, (_, i) => {
      const t = i / 6;
      const x = -52 + t * 104;
      const y = 30 + Math.sin(Math.PI * t) * 24;
      return circle(x, y + 10, 6, { fill: i % 2 ? p.petalA : p.petalB });
    }),
    // windows
    g({ fill: p.goldSoft, opacity: 0.85 }, rect(-88, 40, 34, 32, { rx: 5 }), rect(54, 40, 34, 32, { rx: 5 })),
    // kalash on the ridge
    g(
      { transform: `${tr(0, -92)} ${sc(0.42)}` },
      path("M-58-6C-72 22-66 62-40 84C-22 98 22 98 40 84C66 62 72 22 58-6Z", { fill: "url(#gGold)" }),
      rect(-46, -42, 92, 16, { fill: "url(#gGold)", rx: 7 }),
      ellipse(0, -74, 26, 30, { fill: p.emblemDeep }),
      ring(5, (i) => g({ transform: `${tr((i - 2) * 22, -44)} ${rot(-50 + i * 25)}` }, path(leaf(54, 26), { fill: p.accent }))),
    ),
    // rangoli at the threshold
    ring(8, (i, d) => circle(...pt(0, 126, 26, d), 4, { fill: i % 2 ? p.petalA : p.petalB, opacity: 0.9 })),
  );
};

const carTilak: EmblemFn = (p) => {
  return g(
    {},
    halo(126, p.glow, 0.4),
    path("M-126 40C-126 18-108 8-88 6L-58-30C-50-40-38-46-24-46H34C50-46 62-40 72-28L96 2C114 6 126 18 126 40V62H-126Z", { fill: "url(#gEmb)" }),
    path("M-52-26H-6V2H-72Z", { fill: p.skyOut, opacity: 0.5 }),
    path("M6-26H32C42-26 50-22 56-14L70 2H6Z", { fill: p.skyOut, opacity: 0.5 }),
    rect(-126, 44, 252, 18, { fill: p.emblemDeep, rx: 8 }),
    g({ fill: p.goldSoft, opacity: 0.9 }, rect(-124, 18, 22, 12, { rx: 5 }), rect(102, 18, 22, 12, { rx: 5 })),
    g({ fill: p.emblemDeep }, circle(-72, 62, 28), circle(74, 62, 28)),
    g({ fill: p.emblem }, circle(-72, 62, 12), circle(74, 62, 12)),
    // garland across the bonnet
    path("M-118 16Q-60 62 8 34", { fill: "none", stroke: p.petalA, "stroke-width": 3, opacity: 0.7 }),
    ...Array.from({ length: 8 }, (_, i) => {
      const t = i / 7;
      const x = -118 + t * 126;
      const y = 16 + Math.sin(Math.PI * t) * 34;
      return circle(x, y, 8, { fill: i % 2 ? p.petalA : p.petalB });
    }),
    // tilak on the windscreen post
    g({ transform: tr(0, -14) }, swastikGlyph(15, p.petalB, false)),
    // lemon-and-chilli charm
    g({ transform: tr(-134, 66) }, line(0, -22, 0, 26, { stroke: p.emblemDeep, "stroke-width": 2 }), circle(0, -12, 8, { fill: p.accent }), path("M0 0Q10 12 4 26Q-2 14 0 0Z", { fill: p.petalB })),
  );
};

const havanKund: EmblemFn = (p) => {
  return g(
    {},
    halo(130, p.glow, 0.5),
    g({ transform: tr(0, -6) }, flameStack(120, 62, p)),
    g({ transform: tr(-38, 6) }, flameStack(74, 38, p)),
    g({ transform: tr(38, 4) }, flameStack(80, 40, p)),
    // samidha
    g({ stroke: p.emblemDeep, "stroke-width": 9, "stroke-linecap": "round" }, line(-56, 24, 56, 4), line(-56, 4, 56, 24)),
    // stepped kund
    path("M-84 30H84L96 62H-96Z", { fill: "url(#gEmb)" }),
    path("M-96 62H96L108 94H-108Z", { fill: "url(#gGold)" }),
    path("M-108 94H108L120 122H-120Z", { fill: "url(#gEmb)" }),
    g({ stroke: p.emblemDeep, "stroke-opacity": 0.4, "stroke-width": 2.5, fill: "none" }, line(-60, 62, -54, 94), line(0, 62, 0, 94), line(60, 62, 54, 94), line(-100, 78, 100, 78)),
    g({ fill: p.petalA, opacity: 0.9 }, circle(-118, 128, 9), circle(-92, 138, 7), circle(116, 128, 9), circle(92, 138, 7)),
  );
};

const cradle: EmblemFn = (p) => {
  return g(
    {},
    halo(126, p.glow, 0.42),
    // stand
    g({ stroke: "url(#gEmb)", "stroke-width": 12, "stroke-linecap": "round", fill: "none" }, path("M-96 124L-70-84"), path("M96 124L70-84"), path("M-78-84H78")),
    circle(0, -84, 12, { fill: "url(#gGold)" }),
    // ropes
    g({ stroke: "url(#gGold)", "stroke-width": 4 }, line(-52, -78, -52, 4), line(52, -78, 52, 4)),
    // canopy
    path("M-64-52Q0-96 64-52Q0-70-64-52Z", { fill: "url(#gPetB)" }),
    // cradle basket
    path("M-72 2H72Q80 76 0 92T-80 2Z", { fill: "url(#gEmb)" }),
    path("M-72 2H72V18H-72Z", { fill: "url(#gGold)" }),
    g({ stroke: p.emblemDeep, "stroke-opacity": 0.4, "stroke-width": 2.5, fill: "none" }, path("M-70 34Q0 52 70 34"), path("M-58 58Q0 74 58 58"), path("M-36 6L-30 84"), path("M0 6V90"), path("M36 6L30 84")),
    // little quilt and a crescent above
    path("M-46 6H46Q52 34 0 40T-52 6Z", { fill: p.goldSoft, opacity: 0.85 }),
    g({ transform: tr(0, -122) }, path("M14-16A22 22 0 1 0 14 16A26 26 0 0 1 14-16Z", { fill: p.spark, opacity: 0.9 }), path(star(30, -18, 7, 3, 4), { fill: p.spark, opacity: 0.8 })),
  );
};

const scissors: EmblemFn = (p) => {
  const blade = (dir: number) =>
    g(
      { transform: sc(dir, 1) },
      path("M6-6L96-96C104-104 116-102 118-92C120-84 114-78 106-74L14 4Z", { fill: "url(#gMetal)" }),
      circle(-34, 66, 26, { fill: "none", stroke: "url(#gGold)", "stroke-width": 11 }),
      line(2, 4, -26, 44, { stroke: "url(#gGold)", "stroke-width": 11, "stroke-linecap": "round" }),
    );
  return g(
    {},
    halo(126, p.glow, 0.4),
    g({ transform: `${tr(-6, -14)} ${rot(6)}` }, blade(1), blade(-1), circle(0, 0, 9, { fill: "url(#gGold)" })),
    // shorn lock of hair
    g({ transform: tr(78, 74), stroke: p.emblemDeep, "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, path("M-20-18Q0 8-14 34"), path("M-4-22Q16 6 2 36"), path("M12-20Q30 8 16 36")),
    // thali with tilak
    g(
      { transform: tr(-70, 92) },
      ellipse(0, 0, 56, 17, { fill: "url(#gGold)" }),
      ellipse(0, -3, 44, 12, { fill: p.emblem }),
      circle(-16, -4, 7, { fill: p.petalB }),
      circle(2, -4, 7, { fill: p.goldSoft }),
      circle(20, -5, 7, { fill: p.accent }),
    ),
  );
};

const shriYantra: EmblemFn = (p) => {
  const tri = (w: number, h: number, y: number, up: boolean) =>
    poly(up ? [[0, y - h], [w, y + h * 0.6], [-w, y + h * 0.6]] : [[0, y + h], [w, y - h * 0.6], [-w, y - h * 0.6]], {
      fill: "none",
      stroke: "url(#gGold)",
      "stroke-width": 2.6,
    });
  return g(
    {},
    halo(132, p.glow, 0.42),
    rect(-136, -136, 272, 272, { fill: "none", stroke: "url(#gGold)", "stroke-width": 5 }),
    rect(-124, -124, 248, 248, { fill: "none", stroke: "url(#gGold)", "stroke-width": 2, opacity: 0.7 }),
    ...[0, 90, 180, 270].map((d) => g({ transform: rot(d) }, rect(-16, -140, 32, 16, { fill: "url(#gGold)" }))),
    circle(0, 0, 112, { fill: p.skyOut, opacity: 0.3 }),
    ring(16, (i, d) => path(petal(34, 20), { fill: "url(#gPetB)", opacity: 0.7, transform: rot(d) + " " + tr(0, -112) + " " + rot(180) })),
    circle(0, 0, 96, { fill: "none", stroke: "url(#gGold)", "stroke-width": 3 }),
    ring(8, (i, d) => path(petal(30, 22), { fill: p.gold, opacity: 0.55, transform: rot(d) + " " + tr(0, -96) + " " + rot(180) })),
    circle(0, 0, 74, { fill: "none", stroke: "url(#gGold)", "stroke-width": 3 }),
    tri(66, 74, -4, true), tri(52, 58, 6, true), tri(38, 42, 16, true), tri(24, 28, 24, true),
    tri(70, 78, 2, false), tri(56, 62, -6, false), tri(42, 46, -16, false), tri(28, 32, -24, false),
    circle(0, 0, 8, { fill: p.accent }),
  );
};

const paduka: EmblemFn = (p) => {
  const foot = (dir: number) =>
    g(
      { transform: `${tr(dir * 42, 0)} ${rot(dir * 6)}` },
      path("M0-72C20-72 30-54 30-32C30-8 22 10 22 34C22 56 12 68-2 68C-18 68-28 54-28 34C-28 10-30-8-30-32C-30-56-18-72 0-72Z", { fill: "url(#gEmb)" }),
      circle(0, -50, 11, { fill: "url(#gGold)" }),
      g({ fill: p.emblemDeep, opacity: 0.4 }, circle(-14, -30, 5), circle(0, -34, 5), circle(14, -30, 5), circle(-8, 34, 8), circle(8, 36, 6)),
    );
  return g(
    {},
    halo(126, p.glow, 0.42),
    ellipse(0, 96, 118, 26, { fill: "url(#gGold)" }),
    ellipse(0, 88, 118, 26, { fill: "url(#gEmb)" }),
    foot(-1),
    foot(1),
    flower(-96, 62, 17, "A", 12),
    flower(98, 66, 15, "B", 30),
    g({ transform: tr(0, -104) }, path(star(0, 0, 18, 7, 6), { fill: p.goldSoft, opacity: 0.85 })),
  );
};

const tulsiPot: EmblemFn = (p) => {
  const sprig = (x: number, y: number, s: number, d: number) =>
    g({ transform: `${tr(x, y)} ${rot(d)} ${sc(s)}` }, line(0, 0, 0, -56, { stroke: p.accent, "stroke-width": 4 }), ...[0, 1, 2, 3].map((i) => g({ transform: tr(0, -14 - i * 13) }, path(leaf(22, 12), { fill: p.accent, transform: rot(-60) }), path(leaf(22, 12), { fill: p.accent, transform: rot(60) }))));
  return g(
    {},
    halo(126, p.glow, 0.4),
    sprig(0, 4, 1.15, 0),
    sprig(-34, 12, 0.9, -20),
    sprig(34, 14, 0.9, 18),
    path("M-72 16H72L84 122H-84Z", { fill: "url(#gEmb)" }),
    rect(-84, 4, 168, 22, { fill: "url(#gGold)", rx: 6 }),
    rect(-92, 116, 184, 18, { fill: "url(#gGold)", rx: 6 }),
    // niche for the lamp
    path("M-22 122V78A22 22 0 0 1 22 78V122Z", { fill: p.skyOut, opacity: 0.55 }),
    g({ transform: `${tr(0, 106)} ${sc(0.26)}` }, g({ transform: tr(0, 34) }, flameStack(100, 48, p)), path("M-84 20C-88 52-46 72 0 72S88 52 84 20Z", { fill: "url(#gGold)" })),
    g({ stroke: p.petalB, "stroke-width": 4, fill: "none" }, line(-80, 44, 80, 44), line(-82, 60, 82, 60)),
  );
};

const kites: EmblemFn = (p) => {
  const kite = (x: number, y: number, s: number, d: number, a: string, b: string) =>
    g(
      { transform: `${tr(x, y)} ${rot(d)} ${sc(s)}` },
      poly([[0, -48], [36, 0], [0, 48], [-36, 0]], { fill: a }),
      poly([[0, -48], [36, 0], [0, 0], [-36, 0]], { fill: b, opacity: 0.85 }),
      path("M0-48V48M-36 0H36", { stroke: "#000", "stroke-opacity": 0.2, "stroke-width": 2, fill: "none" }),
      path("M0 48Q10 72-4 92T4 132", { fill: "none", stroke: b, "stroke-width": 3 }),
      ...[0, 1, 2].map((i) => path(`M-8 ${62 + i * 24}h16`, { stroke: a, "stroke-width": 4, fill: "none" })),
    );
  return g(
    {},
    halo(132, p.glow, 0.5),
    circle(46, -74, 44, { fill: "url(#gFlame)", opacity: 0.9 }),
    ring(12, (i, d) => poly([[-4, -48], [0, -70], [4, -48]], { fill: p.gold, opacity: 0.7, transform: tr(46, -74) + " " + rot(d) })),
    kite(-58, -22, 1.05, -18, p.petalB, p.petalA),
    kite(56, 30, 0.85, 22, p.accent, p.goldSoft),
    kite(-14, 74, 0.7, 6, p.gold, p.petalB),
    g({ fill: "none", stroke: p.emblem, "stroke-width": 1.6, opacity: 0.5 }, path("M-58 26Q-110 70-138 138"), path("M56 68Q90 104 108 140")),
  );
};

const rakhi: EmblemFn = (p) => {
  return g(
    {},
    halo(126, p.glow, 0.45),
    g({ stroke: "url(#gPetB)", "stroke-width": 9, fill: "none", "stroke-linecap": "round" }, path("M-40-14Q-104 6-136 68"), path("M40-14Q104 6 136 68")),
    g({ stroke: p.gold, "stroke-width": 3, fill: "none" }, path("M-40-6Q-100 14-130 72"), path("M40-6Q100 14 130 72")),
    ...[[-136, 68], [136, 68]].map(([x, y]) => g({ transform: tr(x, y) }, circle(0, 0, 9, { fill: "url(#gGold)" }), g({ stroke: p.petalB, "stroke-width": 3, "stroke-linecap": "round" }, line(0, 8, -8, 34), line(0, 8, 0, 38), line(0, 8, 8, 34)))),
    ring(12, (i, d) => path(petal(58, 26), { fill: "url(#gPetA)", transform: rot(d) })),
    ring(10, (i, d) => path(petal(40, 22), { fill: "url(#gPetB)", transform: rot(d + 18) })),
    circle(0, 0, 26, { fill: "url(#gGold)" }),
    ring(8, (i, d) => circle(...pt(0, 0, 18, d), 4.5, { fill: p.goldSoft })),
    circle(0, 0, 13, { fill: p.accent }),
    circle(0, 0, 5, { fill: "#fff", opacity: 0.85 }),
  );
};

const matki: EmblemFn = (p) => {
  return g(
    {},
    halo(126, p.glow, 0.42),
    g({ stroke: "url(#gGold)", "stroke-width": 5, fill: "none" }, line(0, -136, 0, -66), path("M-46-66Q0-84 46-66")),
    path("M-46-66H46C74-40 80 6 58 40C40 68-40 68-58 40C-80 6-74-40-46-66Z", { fill: "url(#gEmb)" }),
    path("M-46-66H-6C-30-30-32 8-18 46C-40 42-52 24-58 40C-80 6-74-40-46-66Z", { fill: "#fff", opacity: 0.16 }),
    rect(-56, -76, 112, 20, { fill: "url(#gGold)", rx: 8 }),
    g({ stroke: p.petalB, "stroke-width": 4, fill: "none" }, path("M-70-16Q0 6 70-16"), path("M-72 4Q0 26 72 4")),
    // butter spilling over the rim
    path("M-30-56Q-8-30-28-6Q-46-30-30-56Z", { fill: p.goldSoft, opacity: 0.95 }),
    circle(-27, 4, 8, { fill: p.goldSoft, opacity: 0.9 }),
    circle(-24, 26, 5, { fill: p.goldSoft, opacity: 0.8 }),
    // flute leaning against it
    g({ transform: `${tr(66, 40)} ${rot(-64)}` }, rect(-84, -8, 168, 16, { fill: "url(#gGold)", rx: 8 }), g({ fill: p.emblemDeep }, ...[-46, -24, -2, 20, 42].map((x) => circle(x, 0, 3.4)))),
    g({ transform: `${tr(-84, 56)} ${rot(-24)}` }, ellipse(0, 0, 16, 22, { fill: p.accent, opacity: 0.9 }), ellipse(0, 0, 10, 15, { fill: "#1f6fa8" }), ellipse(0, -2, 5, 8, { fill: "#12305e" })),
  );
};

const colorSplash: EmblemFn = (p, r) => {
  const cols = ["#f857a6", "#6a5ae0", "#3fb0a8", "#f7c948", "#ef5a3c", "#7bc043"];
  const splash = (x: number, y: number, s: number, c: string, seed: number) => {
    const rr = makeRadii(seed, s);
    return g({ transform: tr(x, y) }, path(blobPath(rr), { fill: c, opacity: 0.88 }), ...Array.from({ length: 5 }, (_, i) => circle(...pt(0, 0, s * (1.25 + i * 0.16), seed * 47 + i * 71), s * 0.14, { fill: c, opacity: 0.7 })));
  };
  return g(
    {},
    halo(134, p.glow, 0.45),
    splash(-56, -44, 44, cols[0], 3),
    splash(52, -34, 38, cols[1], 7),
    splash(-30, 46, 40, cols[2], 11),
    splash(62, 52, 32, cols[3], 5),
    splash(2, -6, 34, cols[4], 13),
    splash(-104, 26, 24, cols[5], 17),
    // pichkari
    g(
      { transform: `${tr(58, 90)} ${rot(-32)}` },
      rect(-70, -9, 122, 18, { fill: "url(#gEmb)", rx: 8 }),
      rect(52, -13, 20, 26, { fill: "url(#gGold)", rx: 5 }),
      rect(-92, -16, 26, 32, { fill: "url(#gGold)", rx: 6 }),
      line(-92, 0, -122, 0, { stroke: p.emblemDeep, "stroke-width": 7, "stroke-linecap": "round" }),
    ),
    void r,
  );
};

function makeRadii(seed: number, s: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 9; i++) {
    const t = Math.sin(seed * 12.9898 + i * 4.1414) * 43758.5453;
    out.push(s * (0.78 + (t - Math.floor(t)) * 0.5));
  }
  return out;
}
function blobPath(radii: number[]): string {
  const k = radii.length;
  const pts = radii.map((rr, i) => pt(0, 0, rr, (i * 360) / k));
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < k; i++) {
    const b = pts[(i + 1) % k];
    const c = pt(0, 0, ((radii[i] + radii[(i + 1) % k]) / 2) * 1.14, ((i + 0.5) * 360) / k);
    d += `Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`;
  }
  return d + "Z";
}

const fireworks: EmblemFn = (p) => {
  const burst = (x: number, y: number, s: number, c: string, spokes: number) =>
    g(
      { transform: `${tr(x, y)} ${sc(s)}` },
      ring(spokes, (i, d) => g({ transform: rot(d) }, line(0, -14, 0, -52, { stroke: c, "stroke-width": 3, "stroke-linecap": "round", opacity: 0.9 }), circle(0, -58, 4.5, { fill: c }))),
      circle(0, 0, 9, { fill: "#fff", opacity: 0.9 }),
    );
  const lamp = (x: number, s: number) =>
    g(
      { transform: `${tr(x, 96)} ${sc(s)}` },
      g({ transform: tr(0, 14) }, flameStack(56, 28, p)),
      path("M-42 12C-44 30-22 40 0 40S44 30 42 12Z", { fill: "url(#gEmb)" }),
      ellipse(0, 12, 42, 10, { fill: p.emblemDeep }),
    );
  return g(
    {},
    halo(134, p.glow, 0.5),
    burst(-76, -78, 1, p.gold, 10),
    burst(72, -88, 0.78, p.accent, 8),
    burst(100, -16, 0.6, p.petalB, 8),
    burst(0, -48, 1.15, p.petalA, 12),
    lamp(-104, 0.85), lamp(-52, 1), lamp(0, 1.1), lamp(52, 1), lamp(104, 0.85),
    ring(10, (i, d) => circle(...pt(0, 118, 118, 250 + i * 6), 4, { fill: p.gold, opacity: 0.55 })),
  );
};

const dandiya: EmblemFn = (p) => {
  const stick = (d: number) =>
    g(
      { transform: rot(d) },
      rect(-9, -112, 18, 224, { fill: "url(#gEmb)", rx: 9 }),
      g({ fill: "url(#gGold)" }, rect(-11, -108, 22, 14, { rx: 5 }), rect(-11, -74, 22, 10, { rx: 4 }), rect(-11, 64, 22, 10, { rx: 4 }), rect(-11, 94, 22, 14, { rx: 5 })),
      g({ stroke: p.petalB, "stroke-width": 3, "stroke-linecap": "round" }, line(0, -112, -12, -136), line(0, -112, 0, -140), line(0, -112, 12, -136)),
    );
  return g(
    {},
    halo(130, p.glow, 0.42),
    // devi trident behind
    g({ opacity: 0.55, transform: sc(0.72) }, path("M-6-70V150H6V-70Z", { fill: p.gold }), path("M26-70C52-80 58-108 46-146C40-126 32-114 14-108C20-90 20-78 14-70Z", { fill: p.gold }), path("M-26-70C-52-80-58-108-46-146C-40-126-32-114-14-108C-20-90-20-78-14-70Z", { fill: p.gold }), path("M-7-76C-7-112-4-136 0-160C4-136 7-112 7-76Z", { fill: p.gold })),
    g({ transform: rot(6) }, stick(24), stick(-24)),
    circle(0, 0, 16, { fill: "url(#gGold)" }),
    flower(-108, 96, 16, "A", 12),
    flower(110, 98, 14, "B", 28),
  );
};

const poojaThali: EmblemFn = (p) => {
  return g(
    {},
    halo(130, p.glow, 0.45),
    ellipse(0, 34, 132, 44, { fill: "url(#gEmb)" }),
    ellipse(0, 24, 132, 44, { fill: "url(#gGold)" }),
    ellipse(0, 24, 112, 36, { fill: p.emblem }),
    ellipse(0, 24, 112, 36, { fill: "none", stroke: p.emblemDeep, "stroke-opacity": 0.3, "stroke-width": 2 }),
    ring(20, (i, d) => circle(...pt(0, 24, 122, d), 3, { fill: p.goldSoft, opacity: 0.6, transform: `translate(0 0) scale(1 0.34) translate(0 ${24 / 0.34 - 24})` })),
    // heaps of roli, haldi, akshat
    ellipse(-62, 22, 20, 9, { fill: p.petalB }),
    ellipse(-20, 30, 20, 9, { fill: p.gold }),
    ellipse(22, 30, 20, 9, { fill: p.emblem }),
    ellipse(64, 20, 18, 8, { fill: p.accent }),
    // a lit diya sitting on the plate
    g(
      { transform: `${tr(0, -8)} ${sc(0.55)}` },
      g({ transform: tr(0, 20) }, flameStack(96, 46, p)),
      path("M-84 20C-88 52-46 72 0 72S88 52 84 20Z", { fill: "url(#gEmb)" }),
      ellipse(0, 20, 84, 20, { fill: p.emblemDeep }),
    ),
    flower(-104, -8, 16, "A", 8),
    flower(104, -12, 14, "B", 34),
  );
};

const chalniMoon: EmblemFn = (p) => {
  return g(
    {},
    halo(132, p.glow, 0.45),
    circle(46, -52, 62, { fill: p.spark, opacity: 0.92 }),
    circle(30, -66, 16, { fill: p.emblemDeep, opacity: 0.12 }),
    // the sieve
    g(
      { transform: tr(-14, 14) },
      circle(0, 0, 96, { fill: "url(#gGold)" }),
      circle(0, 0, 82, { fill: p.skyOut, opacity: 0.35 }),
      g({ stroke: p.goldSoft, "stroke-width": 2, opacity: 0.75 }, ...Array.from({ length: 11 }, (_, i) => line(-80, -80 + i * 16, 80, -80 + i * 16)), ...Array.from({ length: 11 }, (_, i) => line(-80 + i * 16, -80, -80 + i * 16, 80))),
      circle(0, 0, 82, { fill: "none", stroke: "url(#gGold)", "stroke-width": 8 }),
      ring(12, (i, d) => circle(...pt(0, 0, 90, d), 4, { fill: p.petalB, opacity: 0.9 })),
    ),
    // karwa pot
    g({ transform: `${tr(94, 82)} ${sc(0.42)}` }, path("M-58-6C-72 22-66 62-40 84C-22 98 22 98 40 84C66 62 72 22 58-6Z", { fill: "url(#gEmb)" }), rect(-46, -42, 92, 16, { fill: "url(#gGold)", rx: 7 }), path("M40 12Q78 6 84 34", { fill: "none", stroke: "url(#gGold)", "stroke-width": 12 })),
  );
};

const pindDaan: EmblemFn = (p) => {
  return g(
    {},
    halo(126, p.glow, 0.4),
    // banana leaf
    path("M-132 46C-90 8-40-8 0-8S90 8 132 46C90 84 40 96 0 96S-90 84-132 46Z", { fill: p.accent, opacity: 0.85 }),
    line(-132, 46, 132, 46, { stroke: "#000", "stroke-opacity": 0.18, "stroke-width": 3 }),
    g({ stroke: "#000", "stroke-opacity": 0.12, "stroke-width": 1.6 }, ...Array.from({ length: 9 }, (_, i) => line(-108 + i * 27, 46, -96 + i * 27, 10)), ...Array.from({ length: 9 }, (_, i) => line(-108 + i * 27, 46, -120 + i * 27, 82))),
    // three pinds
    ...[[-52, 24, 1], [0, 18, 1.12], [52, 24, 1]].map(([x, y, s]) => g({ transform: `${tr(x, y)} ${sc(s)}` }, circle(0, 0, 26, { fill: p.emblem }), circle(-8, -9, 9, { fill: "#fff", opacity: 0.35 }), ...Array.from({ length: 7 }, (_, i) => circle(...pt(0, 0, 15, i * 51), 2.6, { fill: p.emblemDeep, opacity: 0.35 })))),
    // kush grass
    g({ stroke: p.accent, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, path("M-96 34Q-116-12-96-56"), path("M-84 34Q-96-16-70-58"), path("M96 34Q116-12 96-56"), path("M84 34Q96-16 70-58")),
    // copper lota pouring tarpan water
    g(
      { transform: `${tr(-88, -74)} ${rot(28)} ${sc(0.42)}` },
      path("M-58-6C-72 22-66 62-40 84C-22 98 22 98 40 84C66 62 72 22 58-6Z", { fill: "url(#gGold)" }),
      rect(-46, -42, 92, 16, { fill: "url(#gGold)", rx: 7 }),
    ),
    g({ fill: p.spark, opacity: 0.8 }, ellipse(-52, -34, 4, 10), ellipse(-44, -12, 3.4, 8), ellipse(-38, 6, 2.8, 6)),
    g({ fill: p.petalA, opacity: 0.9 }, circle(-16, 66, 8), circle(18, 68, 7), circle(0, 76, 6)),
  );
};

const saturnPlanet: EmblemFn = (p) => {
  return g(
    {},
    halo(132, p.glow, 0.4),
    g({ transform: rot(-22) }, ellipse(0, 0, 132, 34, { fill: "none", stroke: "url(#gGold)", "stroke-width": 12, opacity: 0.9 }), ellipse(0, 0, 112, 27, { fill: "none", stroke: p.accent, "stroke-width": 4, opacity: 0.7 })),
    circle(0, 0, 66, { fill: "url(#gEmb)" }),
    circle(-20, -20, 26, { fill: "#fff", opacity: 0.16 }),
    g({ fill: p.emblemDeep, opacity: 0.35 }, ellipse(0, -26, 52, 8), ellipse(0, 0, 62, 9), ellipse(0, 26, 52, 8)),
    g({ transform: rot(-22) }, path("M-132 0A132 34 0 0 0 132 0", { fill: "none", stroke: "url(#gGold)", "stroke-width": 12 })),
    g({ fill: p.spark, opacity: 0.8 }, path(star(-108, -74, 9, 3.4, 4)), path(star(102, -86, 7, 2.6, 4)), path(star(118, 72, 8, 3, 4))),
    // oil lamp of Shani beneath
    g(
      { transform: `${tr(0, 116)} ${sc(0.42)}` },
      g({ transform: tr(0, 20) }, flameStack(84, 42, p)),
      path("M-84 20C-88 52-46 72 0 72S88 52 84 20Z", { fill: "url(#gEmb)" }),
      ellipse(0, 20, 84, 20, { fill: p.emblemDeep }),
    ),
  );
};

const ganeshMukh: EmblemFn = (p) => {
  return g(
    {},
    halo(132, p.glow, 0.45),
    // mukut
    path("M-58-72L-44-124L-18-96L0-136L18-96L44-124L58-72Z", { fill: "url(#gGold)" }),
    ...[-44, 0, 44].map((x) => circle(x, -126, 8, { fill: p.accent })),
    rect(-64, -76, 128, 18, { fill: "url(#gGold)", rx: 8 }),
    // ears
    path("M-58-46C-108-58-140-30-134 6C-128 44-92 60-56 46Z", { fill: "url(#gEmb)" }),
    path("M58-46C108-58 140-30 134 6C128 44 92 60 56 46Z", { fill: "url(#gEmb)" }),
    path("M-62-32C-98-40-120-20-116 4C-112 30-88 42-62 34Z", { fill: p.emblemDeep, opacity: 0.45 }),
    path("M62-32C98-40 120-20 116 4C112 30 88 42 62 34Z", { fill: p.emblemDeep, opacity: 0.45 }),
    // head
    path("M-62-58C-62-24-64 8-56 34C-46 66-24 84 0 84S46 66 56 34C64 8 62-24 62-58Z", { fill: "url(#gEmb)" }),
    // trunk curling to the left
    path("M6 44C10 74 4 100-18 112C-42 124-62 112-64 92C-66 76-54 66-42 70C-32 74-30 86-38 90", {
      fill: "none",
      stroke: "url(#gEmb)",
      "stroke-width": 30,
      "stroke-linecap": "round",
    }),
    path("M6 44C10 74 4 100-18 112C-42 124-62 112-64 92", { fill: "none", stroke: p.emblemDeep, "stroke-opacity": 0.35, "stroke-width": 3, "stroke-dasharray": "2 16" }),
    // tusk
    path("M40 52C58 60 64 76 58 90C50 82 44 68 34 62Z", { fill: p.goldSoft }),
    // eyes and tilak
    g({ fill: p.emblemDeep }, ellipse(-28, 4, 12, 8), ellipse(28, 4, 12, 8)),
    g({ fill: "#fff", opacity: 0.7 }, circle(-30, 2, 3.4), circle(26, 2, 3.4)),
    path("M0-52V-12", { stroke: p.petalB, "stroke-width": 7, "stroke-linecap": "round", fill: "none" }),
    circle(0, -58, 8, { fill: p.petalB }),
    // modak
    g({ transform: tr(96, 92) }, path("M0-26C16-14 24 6 22 20H-22C-24 6-16-14 0-26Z", { fill: p.goldSoft }), circle(0, -26, 6, { fill: p.accent })),
  );
};

const flag: EmblemFn = (p) => {
  return g(
    {},
    halo(126, p.glow, 0.4),
    rect(-96, -128, 13, 260, { fill: "url(#gEmb)", rx: 6 }),
    rect(-108, 124, 38, 14, { fill: "url(#gGold)", rx: 5 }),
    path("M-90-148C-90-166-78-176-84-190C-70-182-64-166-70-148Z", { fill: "url(#gGold)" }),
    circle(-89.5, -134, 11, { fill: "url(#gGold)" }),
    // fluttering triangular nishan
    path("M-83-122L118-70Q96-52 118-34L-83 18Z", { fill: "url(#gPetA)" }),
    path("M-83-122L118-70Q96-52 118-34L-83 18Z", { fill: "none", stroke: "url(#gGold)", "stroke-width": 6 }),
    path("M-83-92L96-46", { stroke: "url(#gGold)", "stroke-width": 3, fill: "none", opacity: 0.7 }),
    g({ transform: `${tr(-10, -56)} ${rot(14)}` }, swastikGlyph(24, "url(#gGold)", false)),
    g({ fill: p.goldSoft, opacity: 0.8 }, circle(60, -62, 5), circle(76, -38, 5), circle(40, -22, 5)),
    flower(-96, 132, 15, "A", 20),
  );
};

const chariot: EmblemFn = (p) => {
  return g(
    {},
    halo(130, p.glow, 0.42),
    // canopy
    path("M-88-28Q0-124 88-28Z", { fill: "url(#gPetA)" }),
    path("M-88-28Q0-124 88-28", { fill: "none", stroke: "url(#gGold)", "stroke-width": 7 }),
    ring(7, (i) => circle(-72 + i * 24, -30 + Math.abs(i - 3) * 9, 6, { fill: p.petalB })),
    line(0, -122, 0, -160, { stroke: "url(#gGold)", "stroke-width": 5 }),
    path("M2-160L54-146L2-132Z", { fill: p.accent }),
    // body
    rect(-96, -26, 192, 62, { fill: "url(#gEmb)", rx: 10 }),
    g({ stroke: "url(#gGold)", "stroke-width": 4, fill: "none" }, rect(-84, -16, 60, 40, { rx: 6 }), rect(24, -16, 60, 40, { rx: 6 })),
    rect(-104, 32, 208, 16, { fill: "url(#gGold)", rx: 7 }),
    // wheel
    g(
      { transform: tr(0, 76) },
      circle(0, 0, 54, { fill: "none", stroke: "url(#gGold)", "stroke-width": 12 }),
      ring(12, (i, d) => line(0, -44, 0, 44, { stroke: p.emblemDeep, "stroke-width": 3, transform: rot(d), opacity: 0.85 })),
      circle(0, 0, 14, { fill: "url(#gGold)" }),
    ),
    g({ fill: p.emblemDeep }, circle(-92, 76, 22), circle(92, 76, 22)),
    g({ fill: p.gold }, circle(-92, 76, 8), circle(92, 76, 8)),
  );
};

const soopSun: EmblemFn = (p) => {
  return g(
    {},
    halo(134, p.glow, 0.5),
    circle(0, -66, 54, { fill: "url(#gFlame)" }),
    ring(16, (i, d) => poly([[-4, -58], [0, -92], [4, -58]], { fill: p.gold, opacity: 0.85, transform: tr(0, -66) + " " + rot(d) })),
    // river
    g({ stroke: p.spark, "stroke-width": 3, fill: "none", opacity: 0.55 }, path("M-140 24Q-100 12-60 24T20 24T100 24T140 18"), path("M-140 44Q-96 32-52 44T28 44T108 44T140 40")),
    // soop (winnow) with offerings
    g(
      { transform: tr(0, 62) },
      path("M-108-30H108Q96 54 0 54T-108-30Z", { fill: "url(#gEmb)" }),
      path("M-108-30H108V-14H-108Z", { fill: "url(#gGold)" }),
      g({ stroke: p.emblemDeep, "stroke-opacity": 0.35, "stroke-width": 2, fill: "none" }, path("M-98 2Q0 18 98 2"), path("M-84 26Q0 42 84 26")),
      g({ fill: p.gold }, circle(-56, -2, 15), circle(-22, 4, 17), circle(16, 0, 15)),
      g({ fill: p.accent }, circle(54, 2, 15), circle(-70, 20, 11)),
      circle(-22, 4, 6, { fill: p.goldSoft, opacity: 0.7 }),
    ),
    // sugarcane crossing behind
    g({ stroke: p.accent, "stroke-width": 8, "stroke-linecap": "round", opacity: 0.85 }, line(-118, 116, -60, -18), line(118, 116, 60, -18)),
  );
};

const govardhanHill: EmblemFn = (p) => {
  return g(
    {},
    halo(128, p.glow, 0.4),
    path("M-140 42C-118-12-80-52-30-70C18-88 74-72 106-36C122-18 132 10 138 42Z", { fill: "url(#gEmb)" }),
    path("M-140 42C-118-12-80-52-30-70C-8-78 14-78 34-72C-16-46-58-8-84 42Z", { fill: "#fff", opacity: 0.14 }),
    g({ stroke: p.emblemDeep, "stroke-opacity": 0.4, "stroke-width": 2.6, fill: "none" }, path("M-110 30Q-60-4-6-24"), path("M-70 42Q-14 4 52-14"), path("M4 42Q52 18 110 20")),
    // trees on the ridge
    ...[[-64, -34], [-16, -56], [34, -52], [78, -26]].map(([x, y], i) => g({ transform: tr(x, y) }, line(0, 0, 0, 18, { stroke: p.emblemDeep, "stroke-width": 4 }), circle(0, -8, 13 - i, { fill: p.accent, opacity: 0.9 }), circle(-9, 0, 9, { fill: p.accent, opacity: 0.8 }), circle(9, 0, 9, { fill: p.accent, opacity: 0.8 }))),
    // the little finger holding it up
    path("M-2 42C-2 74 2 100 10 122H-42C-34 100-30 74-30 42Z", { fill: "url(#gGold)" }),
    path("M-30 60H-2", { stroke: p.emblemDeep, "stroke-opacity": 0.4, "stroke-width": 3, fill: "none" }),
    rect(-54, 118, 76, 18, { fill: "url(#gGold)", rx: 8 }),
    g({ fill: p.petalA, opacity: 0.9 }, circle(84, 60, 10), circle(108, 78, 8), circle(60, 82, 7)),
  );
};

const screenArch: EmblemFn = (p) => {
  return g(
    {},
    halo(128, p.glow, 0.42),
    rect(-136, -100, 272, 196, { fill: "url(#gEmb)", rx: 18 }),
    rect(-124, -88, 248, 154, { fill: p.skyOut, opacity: 0.55, rx: 10 }),
    // temple arch inside the frame
    path("M-64 66V-6A64 64 0 0 1 64-6V66Z", { fill: "url(#gGold)", opacity: 0.9 }),
    path("M-46 66V-2A46 46 0 0 1 46-2V66Z", { fill: p.skyOut, opacity: 0.65 }),
    path("M0-92L26-56H-26Z", { fill: "url(#gGold)" }),
    g({ transform: `${tr(0, 40)} ${sc(0.34)}` }, g({ transform: tr(0, 24) }, flameStack(96, 46, p)), path("M-84 20C-88 52-46 72 0 72S88 52 84 20Z", { fill: "url(#gGold)" })),
    rect(-60, 82, 120, 12, { fill: "url(#gGold)", rx: 5 }),
    // live indicator
    g({ transform: tr(-96, -70) }, circle(0, 0, 10, { fill: p.petalB }), circle(0, 0, 17, { fill: "none", stroke: p.petalB, "stroke-width": 3, opacity: 0.6 }), circle(0, 0, 24, { fill: "none", stroke: p.petalB, "stroke-width": 2, opacity: 0.3 })),
    rect(-30, 100, 60, 12, { fill: "url(#gGold)", rx: 6 }),
    rect(-64, 112, 128, 14, { fill: "url(#gEmb)", rx: 7 }),
  );
};

const shankhChakra: EmblemFn = (p) => {
  return g(
    {},
    halo(134, p.glow, 0.42),
    g({ transform: `${tr(-72, 6)} ${sc(0.66)}` }, shankh(p, dummyRng)),
    g({ transform: `${tr(74, -4)} ${sc(0.62)}` }, chakra(p, dummyRng)),
    g({ transform: tr(0, 116) }, path(leaf(46, 26), { fill: p.accent }), path(leaf(36, 20), { fill: p.accent, transform: rot(-52) }), path(leaf(36, 20), { fill: p.accent, transform: rot(52) })),
    g({ transform: tr(0, -108) }, path("M0-24L8-6L28-4L13 9L18 28L0 18L-18 28L-13 9L-28-4L-8-6Z", { fill: "url(#gGold)" })),
  );
};

const templeGopuram: EmblemFn = (p) => {
  return g(
    {},
    halo(130, p.glow, 0.42),
    // shikhara
    path("M0-146C22-96 34-40 40 10H-40C-34-40-22-96 0-146Z", { fill: "url(#gEmb)" }),
    ...Array.from({ length: 5 }, (_, i) => {
      const w = 14 + i * 6.5;
      const y = -104 + i * 24;
      return path(`M${-w} ${y}Q0 ${y - 14} ${w} ${y}`, { fill: "none", stroke: "url(#gGold)", "stroke-width": 3.4, opacity: 0.85 });
    }),
    circle(0, -158, 11, { fill: "url(#gGold)" }),
    path("M0-176L6-160H-6Z", { fill: "url(#gGold)" }),
    // side towers
    ...[-1, 1].map((d) => g({ transform: `${tr(d * 74, 34)} ${sc(0.62)}` }, path("M0-146C22-96 34-40 40 10H-40C-34-40-22-96 0-146Z", { fill: "url(#gEmb)", opacity: 0.85 }), circle(0, -156, 10, { fill: "url(#gGold)" }))),
    // mandapa
    rect(-116, 10, 232, 22, { fill: "url(#gGold)", rx: 8 }),
    rect(-100, 32, 200, 68, { fill: "url(#gEmb)" }),
    path("M-30 100V52A30 30 0 0 1 30 52V100Z", { fill: p.skyOut, opacity: 0.6 }),
    path("M-30 100V52A30 30 0 0 1 30 52V100Z", { fill: "none", stroke: "url(#gGold)", "stroke-width": 5 }),
    ...[-72, -52, 52, 72].map((x) => rect(x - 6, 36, 12, 62, { fill: "url(#gGold)", opacity: 0.85, rx: 4 })),
    rect(-124, 98, 248, 18, { fill: "url(#gGold)", rx: 7 }),
    g({ transform: `${tr(-96, 74)} ${sc(0.28)}` }, g({ transform: tr(0, 24) }, flameStack(96, 46, p)), path("M-84 20C-88 52-46 72 0 72S88 52 84 20Z", { fill: "url(#gGold)" })),
    g({ transform: `${tr(96, 74)} ${sc(0.28)}` }, g({ transform: tr(0, 24) }, flameStack(96, 46, p)), path("M-84 20C-88 52-46 72 0 72S88 52 84 20Z", { fill: "url(#gGold)" })),
  );
};

const eyeNazar: EmblemFn = (p) => {
  return g(
    {},
    halo(126, p.glow, 0.42),
    path("M-130 0C-80-62 80-62 130 0C80 62-80 62-130 0Z", { fill: p.emblem }),
    path("M-130 0C-80-62 80-62 130 0C80 62-80 62-130 0Z", { fill: "none", stroke: "url(#gGold)", "stroke-width": 6 }),
    circle(0, 0, 50, { fill: p.accent }),
    circle(0, 0, 30, { fill: p.skyOut, opacity: 0.85 }),
    circle(-10, -12, 10, { fill: "#fff", opacity: 0.75 }),
    ring(14, (i, d) => line(0, -66, 0, -88, { stroke: "url(#gGold)", "stroke-width": 3, "stroke-linecap": "round", transform: rot(d * 0.5 - 130), opacity: 0.8 })),
  );
};

const fullMoon: EmblemFn = (p) => {
  return g(
    {},
    halo(140, p.glow, 0.55),
    circle(0, -18, 96, { fill: p.spark, opacity: 0.95 }),
    circle(0, -18, 96, { fill: "url(#gMetal)", opacity: 0.35 }),
    g({ fill: p.emblemDeep, opacity: 0.14 }, circle(-34, -46, 20), circle(24, -6, 26), circle(-14, 22, 14), circle(46, -58, 11), circle(-56, 6, 9)),
    circle(0, -18, 96, { fill: "none", stroke: p.goldSoft, "stroke-width": 2, opacity: 0.5 }),
    // reflection on still water
    g({ opacity: 0.4 }, ...Array.from({ length: 7 }, (_, i) => ellipse(0, 96 + i * 14, 70 - i * 8, 3.5, { fill: p.spark, opacity: 0.8 - i * 0.09 }))),
    g({ fill: p.spark, opacity: 0.85 }, path(star(-118, -84, 10, 3.6, 4)), path(star(120, -66, 8, 3, 4)), path(star(104, -120, 7, 2.6, 4))),
  );
};

const kumbhRiver: EmblemFn = (p) => {
  return g(
    {},
    halo(130, p.glow, 0.42),
    g({ stroke: p.spark, "stroke-width": 4, fill: "none", opacity: 0.5 }, path("M-140 74Q-100 60-60 74T20 74T100 74T140 68"), path("M-140 100Q-96 86-52 100T28 100T108 100T140 94")),
    // floating leaf-boat lamps
    ...[[-88, 58, 0.5], [0, 44, 0.62], [86, 62, 0.46]].map(([x, y, s]) =>
      g(
        { transform: `${tr(x, y)} ${sc(s)}` },
        g({ transform: tr(0, 18) }, flameStack(78, 40, p)),
        path("M-72 16C-76 46-40 64 0 64S76 46 72 16Z", { fill: "url(#gEmb)" }),
        ellipse(0, 16, 72, 17, { fill: p.emblemDeep }),
      ),
    ),
    // ganga kalash above
    g(
      { transform: `${tr(0, -66)} ${sc(0.72)}` },
      path("M-58-6C-72 22-66 62-40 84C-22 98 22 98 40 84C66 62 72 22 58-6Z", { fill: "url(#gGold)" }),
      rect(-46, -42, 92, 16, { fill: "url(#gGold)", rx: 7 }),
      ring(5, (i) => g({ transform: `${tr((i - 2) * 22, -44)} ${rot(-46 + i * 23)}` }, path(leaf(50, 24), { fill: p.accent }))),
      ellipse(0, -72, 24, 28, { fill: p.emblemDeep }),
    ),
  );
};

/** A throwaway rng for emblems that compose other emblems. */
const dummyRng: Rng = {
  next: () => 0.5,
  range: (a, b) => (a + b) / 2,
  int: (a, b) => Math.floor((a + b) / 2),
  pick: (i) => i[0],
  chance: () => false,
  shuffle: (i) => i.slice(),
};

export const EMBLEMS: Record<string, EmblemFn> = {
  om,
  shivling,
  trishul,
  chakra,
  shankh,
  shankhChakra,
  lotus,
  kalash,
  diya,
  swastik,
  peacockFlute,
  gada,
  bowArrow,
  sun,
  crescentMoon,
  mala,
  bell,
  serpent,
  navgrah,
  chunri,
  garlandHeap,
  sweetPlate,
  bookDiya,
  kundli,
  mandapRing,
  houseKalash,
  carTilak,
  havanKund,
  cradle,
  scissors,
  shriYantra,
  paduka,
  tulsiPot,
  kites,
  rakhi,
  matki,
  colorSplash,
  fireworks,
  dandiya,
  poojaThali,
  chalniMoon,
  pindDaan,
  saturnPlanet,
  ganeshMukh,
  flag,
  chariot,
  soopSun,
  govardhanHill,
  screenArch,
  templeGopuram,
  eyeNazar,
  fullMoon,
  kumbhRiver,
};

export const EMBLEM_KEYS = Object.keys(EMBLEMS);
