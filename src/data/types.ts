/**
 * Local string-literal mirrors of the Prisma enums.
 *
 * The seed data files are plain TypeScript so they can be imported by scripts
 * (art generation, sanity checks) without pulling in `@prisma/client`. The seed
 * casts these to the real Prisma enums when writing rows.
 */

export type ServiceTypeName =
  | "ONLINE_POOJA"
  | "PANDIT_AT_HOME"
  | "CHADHAVA"
  | "ASTROLOGY"
  | "PRASAD"
  | "KATHA"
  | "LIVE_DARSHAN";

export type FestivalTypeName =
  | "FESTIVAL"
  | "VRAT"
  | "EKADASHI"
  | "PURNIMA"
  | "AMAVASYA"
  | "JAYANTI"
  | "SANKRANTI"
  | "PRADOSH"
  | "SPECIAL";

export type ContentTypeName = "AARTI" | "CHALISA" | "MANTRA" | "STOTRA" | "BHAJAN" | "KATHA" | "ARTICLE";

export type PanditClassificationName =
  | "VEDIC"
  | "PUROHIT"
  | "JYOTISHI"
  | "KARMAKANDI"
  | "TANTRIK"
  | "VASTU"
  | "KATHAVACHAK";

export type KycStatusName = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type KycDocTypeName =
  | "AADHAAR_FRONT"
  | "AADHAAR_BACK"
  | "PAN"
  | "PHOTO"
  | "CERTIFICATE"
  | "BANK_PROOF"
  | "ADDRESS_PROOF"
  | "OTHER";

export type BookingStatusName =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "FAILED";

export type PaymentStatusName = "CREATED" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type NotificationTypeName =
  | "FESTIVAL_REMINDER"
  | "BOOKING_UPDATE"
  | "PROMO"
  | "SYSTEM"
  | "KYC"
  | "PANCHANG";

/** A bilingual Q&A entry used by `Service.faqEn` / `faqHi`. */
export type Faq = { q: string; a: string };
