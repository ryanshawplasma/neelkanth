import { Badge, type Tone } from "@/components/ui/badge";
import { BOOKING_STATUSES, KYC_STATUSES, labelOf } from "@/lib/constants";
import type { Locale } from "@/i18n/config";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_TONE,
  CONSULT_STATUS_LABELS,
  CONSULT_STATUS_TONE,
  DOC_STATUS_LABELS,
  KYC_DOC_STATUS_TONE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  PAYOUT_STATUS_LABELS,
  PAYOUT_STATUS_TONE,
  bookingTone,
  kycTone,
  labelFrom,
} from "@/lib/admin/util";

export type StatusKind = "booking" | "kyc" | "payment" | "payout" | "consult" | "campaign" | "doc";

/**
 * One badge for every status enum in the console. Pure props (no hooks) so it
 * renders in both server pages and client editors.
 */
export function StatusBadge({ kind, value, locale, className }: { kind: StatusKind; value: string | null | undefined; locale: Locale; className?: string }) {
  if (!value) return <span className="text-xs text-muted">—</span>;
  let label = value;
  let tone: Tone = "muted";
  switch (kind) {
    case "booking":
      label = labelOf(BOOKING_STATUSES, value, locale);
      tone = bookingTone(value);
      break;
    case "kyc":
      label = labelOf(KYC_STATUSES, value, locale);
      tone = kycTone(value);
      break;
    case "payment":
      label = labelFrom(PAYMENT_STATUS_LABELS, value, locale);
      tone = PAYMENT_STATUS_TONE[value] ?? "muted";
      break;
    case "payout":
      label = labelFrom(PAYOUT_STATUS_LABELS, value, locale);
      tone = PAYOUT_STATUS_TONE[value] ?? "muted";
      break;
    case "consult":
      label = labelFrom(CONSULT_STATUS_LABELS, value, locale);
      tone = CONSULT_STATUS_TONE[value] ?? "muted";
      break;
    case "campaign":
      label = labelFrom(CAMPAIGN_STATUS_LABELS, value, locale);
      tone = CAMPAIGN_STATUS_TONE[value] ?? "muted";
      break;
    case "doc":
      label = labelFrom(DOC_STATUS_LABELS, value, locale);
      tone = KYC_DOC_STATUS_TONE[value] ?? "muted";
      break;
  }
  return (
    <Badge tone={tone} dot className={className}>
      {label}
    </Badge>
  );
}

/** Yes / no pill for boolean columns (active, featured, verified…). */
export function BoolBadge({ value, yes, no }: { value: boolean; yes: string; no: string }) {
  return (
    <Badge tone={value ? "success" : "muted"}>{value ? yes : no}</Badge>
  );
}
