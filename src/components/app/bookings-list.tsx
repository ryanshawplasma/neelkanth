"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck2, ChevronRight } from "lucide-react";
import { useLoc, useLocale, useT } from "@/i18n/client";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { EmptyState, Tabs } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { BOOKING_STATUSES, labelOf } from "@/lib/constants";
import { formatDate, formatINR } from "@/lib/utils";
import { formatSlot, imageOf } from "@/lib/app/helpers";

export type BookingRow = {
  id: string;
  code: string;
  status: string;
  type: string;
  scheduledDate: string;
  scheduledSlot: string | null;
  amountTotal: number;
  service: { slug: string; nameEn: string; nameHi: string; coverUrl: string | null; images: string; type: string };
  temple: { nameEn: string; nameHi: string; city: string } | null;
};

const UPCOMING = ["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "FAILED"];
const DONE = ["COMPLETED"];
const OFF = ["CANCELLED", "REFUNDED"];

export function BookingsList({ bookings }: { bookings: BookingRow[] }) {
  const t = useT();
  const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");

  const groups = {
    upcoming: bookings.filter((b) => UPCOMING.includes(b.status)),
    completed: bookings.filter((b) => DONE.includes(b.status)),
    cancelled: bookings.filter((b) => OFF.includes(b.status)),
  };
  const rows = groups[tab];

  return (
    <div className="pb-6">
      <div className="px-4 pt-4">
        <h1 className="text-[20px] font-bold leading-tight tracking-tight">{t("app.myBookingsTitle")}</h1>
      </div>
      <Tabs
        className="mt-3"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "upcoming", label: t("app.tabUpcoming"), count: groups.upcoming.length },
          { value: "completed", label: t("app.tabCompleted"), count: groups.completed.length },
          { value: "cancelled", label: t("app.tabCancelled"), count: groups.cancelled.length },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck2 className="h-6 w-6" />}
          title={tab === "upcoming" ? t("app.noUpcoming") : tab === "completed" ? t("app.noCompleted") : t("app.noCancelled")}
          hint={t("common.emptyBookingsHint")}
          action={
            <ButtonLink href="/poojas" variant="primary">
              {t("common.poojas")}
            </ButtonLink>
          }
        />
      ) : (
        <ul className="mt-3 space-y-3 px-4 animate-fade-up">
          {rows.map((b) => (
            <li key={b.id}>
              <BookingCard b={b} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BookingCard({ b }: { b: BookingRow }) {
  const loc = useLoc();
  const locale = useLocale();
  const t = useT();
  const status = BOOKING_STATUSES.find((s) => s.value === b.status);

  return (
    <Link href={`/bookings/${b.id}`} className="flex gap-3 rounded-2xl border border-border bg-surface p-2.5 shadow-[var(--shadow)] active:scale-[0.99]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageOf(b.service, "services", b.service.slug)} alt="" className="h-[84px] w-[84px] shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3 className="line-clamp-2 flex-1 text-[13.5px] font-semibold leading-tight">{loc(b.service, "name")}</h3>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
        </div>
        <p className="mt-1 text-[11.5px] text-muted">
          {formatDate(b.scheduledDate, locale, { weekday: "short", day: "numeric", month: "short" })}
          {b.scheduledSlot ? ` · ${formatSlot(b.scheduledSlot, locale)}` : ""}
        </p>
        <p className="text-[11px] text-muted">{t("app.bookingCode", { code: b.code })}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <Badge tone={toneForStatus(status?.tone)}>{labelOf(BOOKING_STATUSES, b.status, locale)}</Badge>
          <span className="ml-auto text-[13.5px] font-bold">{formatINR(b.amountTotal, locale)}</span>
        </div>
      </div>
    </Link>
  );
}
