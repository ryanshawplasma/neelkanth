/**
 * Deterministic pseudo-randomness.
 *
 * Every scene is seeded from its slug, so re-running `generate-art.ts` produces
 * byte-identical files. Nothing here ever touches `Math.random`.
 */

/** FNV-1a — the same hash the app's `fallbackImage` helper uses. */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type Rng = {
  /** Uniform in [0,1). */
  next(): number;
  /** Uniform in [a,b). */
  range(a: number, b: number): number;
  /** Integer in [a,b]. */
  int(a: number, b: number): number;
  /** Uniform pick. */
  pick<T>(items: readonly T[]): T;
  /** True with probability p. */
  chance(p: number): boolean;
  /** Deterministic Fisher-Yates shuffle. */
  shuffle<T>(items: readonly T[]): T[];
};

/** mulberry32, seeded from a slug. */
export function makeRng(seed: string | number): Rng {
  let a = typeof seed === "number" ? seed >>> 0 : hashSeed(seed);
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (lo, hi) => lo + next() * (hi - lo),
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (items) => items[Math.floor(next() * items.length)],
    chance: (p) => next() < p,
    shuffle: (items) => {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
      return out;
    },
  };
}
