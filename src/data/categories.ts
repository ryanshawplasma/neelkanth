/**
 * Service categories shown on the devotee home screen.
 * `icon` is a lucide-react icon name; `imageUrl` points at generated art
 * (`scripts/generate-art.ts` writes /public/images/categories/<slug>.svg).
 */
import type { ServiceTypeName } from "./types";

export type CategorySeed = {
  slug: string;
  nameEn: string;
  nameHi: string;
  icon: string;
  type: ServiceTypeName | null;
  sortOrder: number;
  imageUrl: string;
};

const img = (slug: string) => `/images/categories/${slug}.svg`;

export const CATEGORIES: CategorySeed[] = [
  {
    slug: "online-pooja",
    nameEn: "Online Pooja",
    nameHi: "ऑनलाइन पूजा",
    icon: "Flame",
    type: "ONLINE_POOJA",
    sortOrder: 1,
    imageUrl: img("online-pooja"),
  },
  {
    slug: "chadhava",
    nameEn: "Chadhava",
    nameHi: "चढ़ावा",
    icon: "Gift",
    type: "CHADHAVA",
    sortOrder: 2,
    imageUrl: img("chadhava"),
  },
  {
    slug: "pandit-at-home",
    nameEn: "Pandit at Home",
    nameHi: "घर पर पंडित",
    icon: "Home",
    type: "PANDIT_AT_HOME",
    sortOrder: 3,
    imageUrl: img("pandit-at-home"),
  },
  {
    slug: "astrology",
    nameEn: "Astrology",
    nameHi: "ज्योतिष",
    icon: "Sparkles",
    type: "ASTROLOGY",
    sortOrder: 4,
    imageUrl: img("astrology"),
  },
  {
    slug: "prasad",
    nameEn: "Prasad Delivery",
    nameHi: "प्रसाद वितरण",
    icon: "Package",
    type: "PRASAD",
    sortOrder: 5,
    imageUrl: img("prasad"),
  },
  {
    slug: "katha-path",
    nameEn: "Katha & Path",
    nameHi: "कथा एवं पाठ",
    icon: "BookOpen",
    type: "KATHA",
    sortOrder: 6,
    imageUrl: img("katha-path"),
  },
  {
    slug: "live-darshan",
    nameEn: "Live Darshan",
    nameHi: "लाइव दर्शन",
    icon: "Video",
    type: "LIVE_DARSHAN",
    sortOrder: 7,
    imageUrl: img("live-darshan"),
  },
  {
    slug: "dosh-nivaran",
    nameEn: "Dosh Nivaran",
    nameHi: "दोष निवारण",
    icon: "ShieldCheck",
    type: "ONLINE_POOJA",
    sortOrder: 8,
    imageUrl: img("dosh-nivaran"),
  },
  {
    slug: "festival-specials",
    nameEn: "Festival Specials",
    nameHi: "पर्व विशेष",
    icon: "PartyPopper",
    type: null,
    sortOrder: 9,
    imageUrl: img("festival-specials"),
  },
  {
    slug: "sanskar",
    nameEn: "Sanskar",
    nameHi: "संस्कार",
    icon: "HeartHandshake",
    type: "PANDIT_AT_HOME",
    sortOrder: 10,
    imageUrl: img("sanskar"),
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);
