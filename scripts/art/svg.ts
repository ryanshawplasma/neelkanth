/**
 * Tiny SVG construction primitives shared by every emblem and decoration.
 *
 * Everything is plain string building — no DOM, no dependencies — so the
 * generator runs anywhere `tsx` runs. Numbers are rounded aggressively to keep
 * the emitted files small (every file must stay well under 45 KB).
 */

export type Attrs = Record<string, string | number | undefined | null | false>;

/**
 * Round to one decimal. That is plenty of precision at these canvas sizes and
 * it keeps the emitted files comfortably small.
 */
export function n(v: number): number {
  return Math.round(v * 10) / 10;
}

/** Round a whole list of numbers. */
export function nn(...v: number[]): number[] {
  return v.map(n);
}

export function attrs(a: Attrs): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(a)) {
    if (v === undefined || v === null || v === false || v === "") continue;
    parts.push(`${k}="${typeof v === "number" ? n(v) : v}"`);
  }
  return parts.length ? " " + parts.join(" ") : "";
}

export function el(tag: string, a: Attrs = {}, children?: string): string {
  return children === undefined || children === ""
    ? `<${tag}${attrs(a)}/>`
    : `<${tag}${attrs(a)}>${children}</${tag}>`;
}

export function g(a: Attrs, ...children: (string | false | undefined | null)[]): string {
  return el("g", a, children.filter(Boolean).join(""));
}

export const rect = (x: number, y: number, w: number, h: number, a: Attrs = {}) =>
  el("rect", { x, y, width: w, height: h, ...a });

export const circle = (cx: number, cy: number, r: number, a: Attrs = {}) => el("circle", { cx, cy, r, ...a });

export const ellipse = (cx: number, cy: number, rx: number, ry: number, a: Attrs = {}) =>
  el("ellipse", { cx, cy, rx, ry, ...a });

export const path = (d: string, a: Attrs = {}) => el("path", { d, ...a });

export const line = (x1: number, y1: number, x2: number, y2: number, a: Attrs = {}) =>
  el("line", { x1, y1, x2, y2, ...a });

export const poly = (pts: number[][], a: Attrs = {}) =>
  el("polygon", { points: pts.map(([x, y]) => `${n(x)},${n(y)}`).join(" "), ...a });

export const polyline = (pts: number[][], a: Attrs = {}) =>
  el("polyline", { points: pts.map(([x, y]) => `${n(x)},${n(y)}`).join(" "), ...a });

/** Degrees → cartesian offset (0deg = up, clockwise positive). */
export function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [n(r * Math.cos(a)), n(r * Math.sin(a))];
}

/** Absolute point on a circle. */
export function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const [dx, dy] = polar(r, deg);
  return [n(cx + dx), n(cy + dy)];
}

/** Arc path along a circle from a0 to a1 degrees (clockwise when a1 > a0). */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number, move = true): string {
  const [x0, y0] = pt(cx, cy, r, a0);
  const [x1, y1] = pt(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `${move ? `M${x0} ${y0}` : `L${x0} ${y0}`}A${n(r)} ${n(r)} 0 ${large} ${sweep} ${x1} ${y1}`;
}

/** A closed star / cog outline. */
export function starPath(points: number[][], close = true): string {
  const [f, ...rest] = points;
  return `M${n(f[0])} ${n(f[1])}` + rest.map(([x, y]) => `L${n(x)} ${n(y)}`).join("") + (close ? "Z" : "");
}

/** N-pointed star with alternating radii. */
export function star(cx: number, cy: number, rOut: number, rIn: number, spikes: number, rot = 0): string {
  const p: number[][] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? rOut : rIn;
    p.push(pt(cx, cy, r, rot + (i * 180) / spikes));
  }
  return starPath(p);
}

/**
 * A single petal pointing "up" from the origin: base at (0,0), tip at (0,-len).
 * `bulge` (0..1) controls how round the belly is.
 */
export function petal(len: number, width: number, bulge = 0.55): string {
  const w = width / 2;
  const cy1 = -len * bulge;
  return `M0 0C${n(-w)} ${n(cy1)} ${n(-w * 0.55)} ${n(-len * 0.92)} 0 ${n(-len)}C${n(w * 0.55)} ${n(-len * 0.92)} ${n(w)} ${n(cy1)} 0 0Z`;
}

/** A leaf with a pointed tip at both ends (mango leaf, bel leaflet, tulsi). */
export function leaf(len: number, width: number): string {
  const w = width / 2;
  return `M0 0C${n(-w)} ${n(-len * 0.3)} ${n(-w)} ${n(-len * 0.7)} 0 ${n(-len)}C${n(w)} ${n(-len * 0.7)} ${n(w)} ${n(-len * 0.3)} 0 0Z`;
}

/** A teardrop flame pointing up from (0,0). */
export function flame(h: number, w: number, wobble = 0): string {
  const half = w / 2;
  return (
    `M0 0C${n(-half)} ${n(-h * 0.18)} ${n(-half * 1.05)} ${n(-h * 0.5)} ${n(-half * 0.25 + wobble)} ${n(-h * 0.76)}` +
    `C${n(-half * 0.05 + wobble)} ${n(-h * 0.9)} ${n(half * 0.1 + wobble)} ${n(-h * 0.95)} 0 ${n(-h)}` +
    `C${n(half * 0.5)} ${n(-h * 0.82)} ${n(half * 1.05)} ${n(-h * 0.5)} ${n(half)} ${n(-h * 0.18)}` +
    `C${n(half * 0.7)} ${n(-h * 0.05)} ${n(half * 0.35)} 0 0 0Z`
  );
}

/** Repeat `fn` around a circle; returns concatenated markup. */
export function ring(count: number, fn: (i: number, deg: number) => string): string {
  let out = "";
  for (let i = 0; i < count; i++) out += fn(i, (i * 360) / count);
  return out;
}

/** `rotate(deg cx cy)` transform string. */
export const rot = (deg: number, cx = 0, cy = 0) => `rotate(${n(deg)} ${n(cx)} ${n(cy)})`;
export const tr = (x: number, y: number) => `translate(${n(x)} ${n(y)})`;
export const sc = (x: number, y = x) => `scale(${n(x)} ${n(y)})`;

/** Smooth closed blob through polar radii — used for clouds, splashes, hills. */
export function blob(cx: number, cy: number, radii: number[], rotate = 0): string {
  const k = radii.length;
  const pts = radii.map((r, i) => pt(cx, cy, r, rotate + (i * 360) / k));
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < k; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % k];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const c = pt(cx, cy, ((radii[i] + radii[(i + 1) % k]) / 2) * 1.12, rotate + ((i + 0.5) * 360) / k);
    void mx;
    void my;
    d += `Q${n(c[0])} ${n(c[1])} ${n(b[0])} ${n(b[1])}`;
  }
  return d + "Z";
}

/** XML-escape text destined for a <text> node. */
export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
