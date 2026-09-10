/**
 * Plain, serializable shapes passed from server components into the devotee-app client
 * components. Structurally compatible with the Prisma selects in `queries.ts` but free of
 * any `server-only` import, so client components can use them safely.
 */

export type ServiceCardData = {
  id: string;
  slug: string;
  type: string;
  nameEn: string;
  nameHi: string;
  taglineEn: string | null;
  taglineHi: string | null;
  deityEn: string | null;
  deityHi: string | null;
  coverUrl: string | null;
  images: string;
  basePrice: number;
  compareAtPrice: number | null;
  nextDate: string | null;
  slots: string;
  ratingAvg: number;
  ratingCount: number;
  bookingCount: number;
  durationMin: number | null;
  featured: boolean;
  trending: boolean;
  temple: { slug: string; nameEn: string; nameHi: string; city: string; state: string } | null;
  category: { slug: string; nameEn: string; nameHi: string } | null;
  festival: { slug: string; nameEn: string; nameHi: string; date: string } | null;
};

export type TempleCardData = {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  city: string;
  state: string;
  coverUrl: string | null;
  images: string;
  deityEn: string | null;
  deityHi: string | null;
  liveDarshanUrl: string | null;
};

export type FestivalCardData = {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  type: string;
  date: string;
  endDate?: string | null;
  deityEn?: string | null;
  deityHi?: string | null;
  imageUrl: string | null;
  major: boolean;
  descriptionEn?: string | null;
  descriptionHi?: string | null;
};

export type ContentCardData = {
  id: string;
  slug: string;
  type: string;
  titleEn: string;
  titleHi: string;
  deityEn: string | null;
  deityHi: string | null;
  imageUrl: string | null;
  audioUrl?: string | null;
  views?: number;
};

export type PanditCardData = {
  id: string;
  displayName: string;
  displayNameHi: string | null;
  photoUrl: string | null;
  classification: string;
  verified: boolean;
  experienceYears: number;
  ratingAvg: number;
  ratingCount: number;
  city: string | null;
  state?: string | null;
  languages?: string;
  specialities?: string;
  servesAtHome?: boolean;
  servesOnline?: boolean;
  completedCount?: number;
};

export type CategoryData = {
  slug: string;
  nameEn: string;
  nameHi: string;
  icon: string | null;
  imageUrl: string | null;
  type?: string | null;
};

export type BannerData = {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string | null;
  subtitleHi: string | null;
  imageUrl: string | null;
  href: string | null;
};

/** A devotee row stored in `Booking.devotees` (JSON). */
export type BookingDevotee = { name: string; gotra?: string | null; relation?: string | null };
/** An add-on row stored in `Booking.addons` (JSON). */
export type BookingAddon = { slug: string; nameEn: string; nameHi: string; price: number };
