/**
 * Devotional colour themes.
 *
 * Each palette is a complete scene: a three-stop sky, a halo, two silhouette
 * tones for the horizon band, an emblem duo, gold, garland flowers and sparks.
 * Themes are chosen per deity / temple / festival in `scripts/generate-art.ts`.
 */

export type Palette = {
  key: string;
  /** Radial sky: bright core, mid, deep edge. */
  skyIn: string;
  skyMid: string;
  skyOut: string;
  /** Halo behind the central emblem. */
  glow: string;
  /** Horizon silhouettes, far and near. */
  farBand: string;
  nearBand: string;
  /** Emblem body and its shadow side. */
  emblem: string;
  emblemDeep: string;
  /** Highlight used for rims, flames, jewels. */
  accent: string;
  gold: string;
  goldSoft: string;
  /** Marigold garland tones. */
  petalA: string;
  petalB: string;
  /** Floating particles / stars. */
  spark: string;
  /** Mandala and filigree line colour (a warm gold in most themes). */
  line: string;
  /** Night scenes get stars and a cooler garland. */
  night?: boolean;
};

export const PALETTES: Record<string, Palette> = {
  /* Shiva: deep indigo night over ash blue, silver linga, bel green */
  shiva: {
    key: "shiva",
    skyIn: "#4a5c8f",
    skyMid: "#2a3260",
    skyOut: "#141733",
    glow: "#9fb6e8",
    farBand: "#232a52",
    nearBand: "#121531",
    emblem: "#dfe6f2",
    emblemDeep: "#8c9bc0",
    accent: "#8fd6a8",
    gold: "#e8c266",
    goldSoft: "#f7e3a8",
    petalA: "#f2a93b",
    petalB: "#d9542a",
    spark: "#cfe0ff",
    line: "#c9b070",
    night: true,
  },

  /* Vishnu: peacock blue-teal into gold */
  vishnu: {
    key: "vishnu",
    skyIn: "#2f8fa8",
    skyMid: "#175d78",
    skyOut: "#0a3145",
    glow: "#8fe3ea",
    farBand: "#0f4358",
    nearBand: "#062432",
    emblem: "#f6ecd2",
    emblemDeep: "#c2a35e",
    accent: "#ffd86b",
    gold: "#e9bf52",
    goldSoft: "#fbe9b0",
    petalA: "#f9c440",
    petalB: "#e8722d",
    spark: "#c9f4f7",
    line: "#e0bd63",
  },

  /* Krishna: moonlit Yamuna blue */
  krishna: {
    key: "krishna",
    skyIn: "#3f7fbe",
    skyMid: "#20486f",
    skyOut: "#0d203c",
    glow: "#a8d8ff",
    farBand: "#153455",
    nearBand: "#081a30",
    emblem: "#ffe9a8",
    emblemDeep: "#c48f3a",
    accent: "#57c9b4",
    gold: "#f0c95c",
    goldSoft: "#fdeeb8",
    petalA: "#f6b93b",
    petalB: "#e05a3a",
    spark: "#d6ecff",
    line: "#dcb95f",
    night: true,
  },

  /* Ram: dawn over the Sarayu, saffron banner and Kaushal blue */
  ram: {
    key: "ram",
    skyIn: "#f5c86b",
    skyMid: "#c8752f",
    skyOut: "#5d2a2c",
    glow: "#ffe6a6",
    farBand: "#7a3a2c",
    nearBand: "#3d1a1e",
    emblem: "#fff2d2",
    emblemDeep: "#c98a3c",
    accent: "#3f8fbe",
    gold: "#f0c14a",
    goldSoft: "#fdeab4",
    petalA: "#f7b32b",
    petalB: "#d94f2a",
    spark: "#ffe9bd",
    line: "#e6bb5c",
  },

  /* Devi / Durga / Kali / Kamakhya: crimson into maroon */
  devi: {
    key: "devi",
    skyIn: "#d1443f",
    skyMid: "#8e1c2f",
    skyOut: "#43070f",
    glow: "#ffb2a0",
    farBand: "#6e1424",
    nearBand: "#2c0509",
    emblem: "#ffe7c6",
    emblemDeep: "#c07a3e",
    accent: "#ffd25e",
    gold: "#f0c14a",
    goldSoft: "#fce7a6",
    petalA: "#ffbf3c",
    petalB: "#e6402f",
    spark: "#ffd9c8",
    line: "#e8bb58",
  },

  /* Lakshmi: magenta-rose into gold, lotus pink */
  lakshmi: {
    key: "lakshmi",
    skyIn: "#e0619a",
    skyMid: "#a52a6d",
    skyOut: "#4c0f3c",
    glow: "#ffc6de",
    farBand: "#7d1c53",
    nearBand: "#380a2b",
    emblem: "#fff0d4",
    emblemDeep: "#cf8f52",
    accent: "#ffd97a",
    gold: "#f4c95a",
    goldSoft: "#fdeebb",
    petalA: "#ffc94d",
    petalB: "#f06292",
    spark: "#ffdcec",
    line: "#f0c469",
  },

  /* Hanuman: sindoor orange into deep red */
  hanuman: {
    key: "hanuman",
    skyIn: "#f78a2e",
    skyMid: "#c33c17",
    skyOut: "#5d1408",
    glow: "#ffcf8f",
    farBand: "#93290f",
    nearBand: "#420d05",
    emblem: "#ffe8c4",
    emblemDeep: "#c26a2a",
    accent: "#ffd35c",
    gold: "#f2bd45",
    goldSoft: "#fde5a8",
    petalA: "#ffc142",
    petalB: "#e8451f",
    spark: "#ffdca8",
    line: "#eeb955",
  },

  /* Ganesh: vermilion into marigold yellow */
  ganesh: {
    key: "ganesh",
    skyIn: "#ffb43f",
    skyMid: "#e2542a",
    skyOut: "#7a1a1e",
    glow: "#ffe1a0",
    farBand: "#a52c1e",
    nearBand: "#4f0f13",
    emblem: "#ffeccb",
    emblemDeep: "#cd7c34",
    accent: "#ffd75e",
    gold: "#f5c443",
    goldSoft: "#ffeeb4",
    petalA: "#ffc93c",
    petalB: "#ef5a26",
    spark: "#ffe6b8",
    line: "#f0c052",
  },

  /* Shani / Bhairav: near-black indigo, steel blue, dim gold */
  shani: {
    key: "shani",
    skyIn: "#3b4a63",
    skyMid: "#1c2436",
    skyOut: "#080b14",
    glow: "#7f95b8",
    farBand: "#161d2c",
    nearBand: "#05070d",
    emblem: "#c6d2e4",
    emblemDeep: "#6b7a95",
    accent: "#5f8fc4",
    gold: "#b99640",
    goldSoft: "#dcc07a",
    petalA: "#c98a2f",
    petalB: "#8a3a5f",
    spark: "#9fb4d6",
    line: "#96803f",
    night: true,
  },

  /* Surya: amber into saffron */
  surya: {
    key: "surya",
    skyIn: "#ffd971",
    skyMid: "#f08b2a",
    skyOut: "#a03412",
    glow: "#fff0b8",
    farBand: "#b4451a",
    nearBand: "#68200c",
    emblem: "#fff6d8",
    emblemDeep: "#d9922f",
    accent: "#ff8a3d",
    gold: "#f7c93f",
    goldSoft: "#fff0ae",
    petalA: "#ffcb3d",
    petalB: "#ef6c22",
    spark: "#fff2c2",
    line: "#f3c34e",
  },

  /* Sai Baba: saffron into cream */
  sai: {
    key: "sai",
    skyIn: "#ffe6b8",
    skyMid: "#e79a3c",
    skyOut: "#8c4415",
    glow: "#fff6dd",
    farBand: "#a85e20",
    nearBand: "#5c2b0d",
    emblem: "#fffaef",
    emblemDeep: "#d0994c",
    accent: "#ff9f3c",
    gold: "#e8b545",
    goldSoft: "#fbe7b4",
    petalA: "#ffc957",
    petalB: "#f28030",
    spark: "#fff4d8",
    line: "#dcae55",
  },

  /* Pitru / Gaya: dusk purple into river blue */
  pitru: {
    key: "pitru",
    skyIn: "#8f7ab5",
    skyMid: "#4c4478",
    skyOut: "#1b1c3a",
    glow: "#c8bce8",
    farBand: "#39355f",
    nearBand: "#171634",
    emblem: "#eae4f7",
    emblemDeep: "#9a8fc0",
    accent: "#7fb8d8",
    gold: "#d9bd6e",
    goldSoft: "#f0dfae",
    petalA: "#e0a94a",
    petalB: "#b8607e",
    spark: "#dcd2f5",
    line: "#bda468",
    night: true,
  },

  /* Khatu Shyam / Salasar: blue-violet into saffron */
  shyam: {
    key: "shyam",
    skyIn: "#7a72d6",
    skyMid: "#40388f",
    skyOut: "#1a1445",
    glow: "#bdb8ff",
    farBand: "#312a70",
    nearBand: "#130f34",
    emblem: "#ffeec9",
    emblemDeep: "#c79a45",
    accent: "#ff9f3c",
    gold: "#f2c451",
    goldSoft: "#fde9b2",
    petalA: "#ffc247",
    petalB: "#e0543f",
    spark: "#d6d2ff",
    line: "#e3b95d",
    night: true,
  },

  /* Generic temple: warm saffron into maroon, the app's own palette */
  temple: {
    key: "temple",
    skyIn: "#ffb765",
    skyMid: "#e0642a",
    skyOut: "#6d1622",
    glow: "#ffe2b0",
    farBand: "#9a2b26",
    nearBand: "#4a0d19",
    emblem: "#fff0d5",
    emblemDeep: "#cf8a3c",
    accent: "#ffd469",
    gold: "#efc04a",
    goldSoft: "#fdeab6",
    petalA: "#ffc63f",
    petalB: "#e2542a",
    spark: "#ffe7bd",
    line: "#eebd5a",
  },

  /* Astrology: midnight violet, star charts */
  astro: {
    key: "astro",
    skyIn: "#4b3f8f",
    skyMid: "#241d54",
    skyOut: "#0b0820",
    glow: "#b6a6ff",
    farBand: "#1d1747",
    nearBand: "#08061c",
    emblem: "#efe6ff",
    emblemDeep: "#9b8ad0",
    accent: "#6fd8e8",
    gold: "#e5c25f",
    goldSoft: "#f7e4a6",
    petalA: "#e8a83c",
    petalB: "#a44ba0",
    spark: "#d9ccff",
    line: "#d3b25e",
    night: true,
  },

  /* Prasad: cream, ghee gold, leaf green */
  prasad: {
    key: "prasad",
    skyIn: "#fff2d4",
    skyMid: "#eeb95f",
    skyOut: "#a45f22",
    glow: "#fffaea",
    farBand: "#bd7f33",
    nearBand: "#6f3e14",
    emblem: "#fffaf0",
    emblemDeep: "#d29a4d",
    accent: "#5fa85f",
    gold: "#dfae4a",
    goldSoft: "#f8e5b2",
    petalA: "#ffc85a",
    petalB: "#ef8b3a",
    spark: "#fff6de",
    line: "#cfa14e",
  },

  /* Sanskar (vivah, naamkaran, mundan): rose-gold ceremony */
  sanskar: {
    key: "sanskar",
    skyIn: "#ffc9a8",
    skyMid: "#e4736e",
    skyOut: "#78203f",
    glow: "#ffe0cd",
    farBand: "#a33a51",
    nearBand: "#4e1029",
    emblem: "#fff2e0",
    emblemDeep: "#d08f5f",
    accent: "#ffd06b",
    gold: "#eebd5c",
    goldSoft: "#fbe6bb",
    petalA: "#ffcb55",
    petalB: "#e8586b",
    spark: "#ffe4d4",
    line: "#e9b96a",
  },

  /* Holi: bright daylight for colour play */
  holi: {
    key: "holi",
    skyIn: "#fff6e0",
    skyMid: "#ffd08a",
    skyOut: "#c9503c",
    glow: "#ffffff",
    farBand: "#a83c2d",
    nearBand: "#661a18",
    emblem: "#fff8ec",
    emblemDeep: "#d98f4a",
    accent: "#3fb0a8",
    gold: "#f2c249",
    goldSoft: "#fde9ae",
    petalA: "#f857a6",
    petalB: "#6a5ae0",
    spark: "#ffffff",
    line: "#e8b756",
  },

  /* Diwali: warm night, lamp glow */
  diwali: {
    key: "diwali",
    skyIn: "#6b3a86",
    skyMid: "#3a1c53",
    skyOut: "#120a24",
    glow: "#ffd98f",
    farBand: "#2c1442",
    nearBand: "#0d0619",
    emblem: "#ffeec4",
    emblemDeep: "#cd9440",
    accent: "#ff9f3c",
    gold: "#f5cb56",
    goldSoft: "#ffeeb8",
    petalA: "#ffc63f",
    petalB: "#e94f2c",
    spark: "#ffe9b8",
    line: "#e9bd5d",
    night: true,
  },

  /* Sankranti: kite-flying winter sky */
  sankranti: {
    key: "sankranti",
    skyIn: "#bfe8ff",
    skyMid: "#5fa8dd",
    skyOut: "#1f4f86",
    glow: "#ffffff",
    farBand: "#2b5c92",
    nearBand: "#11304f",
    emblem: "#fff6dc",
    emblemDeep: "#d5a044",
    accent: "#ff8a3d",
    gold: "#f4c74f",
    goldSoft: "#fdeab2",
    petalA: "#ffc93f",
    petalB: "#e85f2c",
    spark: "#ffffff",
    line: "#eec25c",
  },
};

export const PALETTE_KEYS = Object.keys(PALETTES);

export function paletteFor(key: string | undefined): Palette {
  return (key && PALETTES[key]) || PALETTES.temple;
}
