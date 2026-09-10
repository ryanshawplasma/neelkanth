"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, ChevronRight, Home, MapPin, Users, Video } from "lucide-react";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { useLocale, useLoc, useT } from "@/i18n/client";
import { BOOKING_STATUSES, KYC_STATUSES, pickBi } from "@/lib/constants";
import { cn, formatDate, formatINR, parseJson } from "@/lib/utils";
import { netEarning } from "@/lib/pandit/shared";

export function KycBadge({ status }: { status: string }) {
  const locale = useLocale();
  const entry = KYC_STATUSES.find((s) => s.value === status);
  return <Badge tone={toneForStatus(entry?.tone)}>{entry ? pickBi(entry.label, locale) : status}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const locale = useLocale();
  const entry = BOOKING_STATUSES.find((s) => s.value === status);
  return <Badge tone={toneForStatus(entry?.tone)}>{entry ? pickBi(entry.label, locale) : status}</Badge>;
}

export function DocStatusBadge({ status }: { status: string }) {
  const t = useT();
  const map: Record<string, { tone: "warning" | "success" | "danger"; key: string }> = {
    PENDING: { tone: "warning", key: "docPending" },
    APPROVED: { tone: "success", key: "docApproved" },
    REJECTED: { tone: "danger", key: "docRejected" },
  };
  const it = map[status] ?? map.PENDING;
  return <Badge tone={it.tone}>{t(`pandit.${it.key}`)}</Badge>;
}

export function ModeChip({ type }: { type: string }) {
  const t = useT();
  if (type === "PANDIT_AT_HOME")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2 py-0.5 text-[11px] font-semibold text-info">
        <Home className="h-3 w-3" /> {t("common.atHome")}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-maroon-soft px-2 py-0.5 text-[11px] font-semibold text-maroon">
      <Video className="h-3 w-3" /> {t("common.online")}
    </span>
  );
}

export type BookingCardData = {
  id: string;
  code: string;
  type: string;
  status: string;
  scheduledDate: string;
  scheduledSlot: string | null;
  devotees: string;
  city: string | null;
  amountTotal: number;
  liveLink: string | null;
  service: { nameEn: string; nameHi: string };
};

export function BookingCard({ booking, commissionPct, showStatus = true }: { booking: BookingCardData; commissionPct: number; showStatus?: boolean }) {
  const t = useT();
  const locale = useLocale();
  const loc = useLoc();
  const devotees = parseJson<{ name?: string }[]>(booking.devotees, []);
  const net = netEarning(booking.amountTotal, commissionPct);

  return (
    <Link
      href={`/pandit/bookings/${booking.id}`}
      className="flex items-stretch gap-3 rounded-2xl border border-border bg-surface p-3.5 transition-colors hover:bg-surface-2"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <ModeChip type={booking.type} />
          {showStatus && <StatusBadge status={booking.status} />}
        </div>
        <p className="mt-1.5 truncate text-[15px] font-semibold leading-tight">{loc(booking.service, "name")}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(booking.scheduledDate, locale)}
            {booking.scheduledSlot ? ` · ${booking.scheduledSlot}` : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {t("pandit.devoteeCount", { n: Math.max(devotees.length, 1) })}
          </span>
          {booking.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {booking.city}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          {t("pandit.yourEarning")} <span className="font-bold text-foreground">{formatINR(net, locale)}</span> · {booking.code}
        </p>
      </div>
      <ChevronRight className="my-auto h-5 w-5 shrink-0 text-muted" />
    </Link>
  );
}

export function Panel({ title, subtitle, action, children, className }: { title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-surface", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold leading-tight">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function InfoRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="min-w-0 text-right font-medium">{value}</span>
    </div>
  );
}
