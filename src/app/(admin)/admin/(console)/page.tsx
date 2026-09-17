import Link from "next/link";
import {
  Activity,
  Banknote,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  IndianRupee,
  Sparkles,
  TriangleAlert,
  UserCheck,
  Users,
} from "lucide-react";
import { AdminPageHeader, Panel } from "@/components/admin/page-shell";
import { KpiCard } from "@/components/admin/kpi-card";
import { MiniBarChart, MiniLineChart } from "@/components/admin/charts";
import { StatusBadge } from "@/components/admin/status-badge";
import { CellStack, DataTable, type Column } from "@/components/admin/data-table";
import { RunRemindersButton } from "@/components/admin/run-reminders";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { getOverview } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { BOOKING_STATUSES, SERVICE_TYPES, labelOf } from "@/lib/constants";
import { compactINR } from "@/lib/admin/util";
import { daysUntil, formatDate, formatDateTime, formatINR, loc } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof getOverview>>["recentBookings"][number];

export default async function AdminOverviewPage() {
  await requireAdmin();
  const { t, locale } = await getT();
  const o = await getOverview();

  const columns: Column<Row>[] = [
    {
      key: "code",
      header: t("admin.colCode"),
      cell: (b) => (
        <CellStack
          top={b.code}
          bottom={
            <>
              {/* Phones fold the amount column into this line. */}
              <span className="sm:hidden">
                {formatINR(b.amountTotal, locale)} · {formatDate(b.createdAt, locale, { year: undefined })}
              </span>
              <span className="max-sm:hidden">{formatDateTime(b.createdAt, locale)}</span>
            </>
          }
          href={`/admin/bookings/${b.id}`}
        />
      ),
    },
    { key: "service", header: t("admin.colService"), cell: (b) => <CellStack top={loc(b.service, "name", locale)} bottom={labelOf(SERVICE_TYPES, b.type, locale)} />, hideOnMobile: true },
    { key: "devotee", header: t("admin.colDevotee"), cell: (b) => <CellStack top={b.user.name ?? t("admin.noName")} bottom={b.user.phone ?? b.user.email ?? ""} />, hideOnTablet: true },
    { key: "date", header: t("common.date"), cell: (b) => <span className="whitespace-nowrap text-xs">{formatDate(b.scheduledDate, locale)}{b.scheduledSlot ? ` · ${b.scheduledSlot}` : ""}</span>, hideOnTablet: true },
    { key: "amount", header: t("admin.colAmount"), align: "right", cell: (b) => <span className="whitespace-nowrap font-semibold tabular-nums">{formatINR(b.amountTotal, locale)}</span>, hideOnMobile: true },
    { key: "status", header: t("common.status"), cell: (b) => <StatusBadge kind="booking" value={b.status} locale={locale} /> },
  ];

  const statusRows = BOOKING_STATUSES.filter((s) => (o.byStatus[s.value] ?? 0) > 0);
  const majorSoon = o.upcomingFestivals.filter((f) => f.major);

  return (
    <>
      <AdminPageHeader
        title={t("admin.overviewTitle")}
        subtitle={t("admin.overviewSubtitle")}
        actions={<RunRemindersButton compact />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-4">
        <KpiCard
          label={t("admin.kpiRevenueToday")}
          value={formatINR(o.revenueToday, locale)}
          sub={t("admin.kpiPaymentsCount", { n: o.revenueTodayCount })}
          icon={<IndianRupee className="h-4 w-4" />}
          tone="success"
          href="/admin/payments?status=PAID"
        />
        <KpiCard
          label={t("admin.kpiRevenueMonth")}
          value={compactINR(o.revenueMonth)}
          sub={t("admin.kpiPaymentsCount", { n: o.revenueMonthCount })}
          icon={<Banknote className="h-4 w-4" />}
          tone="gold"
          href="/admin/payments"
        />
        <KpiCard
          label={t("admin.kpiBookingsToday")}
          value={o.bookingsToday}
          sub={t("admin.kpiTotalBookings", { n: Object.values(o.byStatus).reduce((a, b) => a + b, 0) })}
          icon={<CalendarCheck className="h-4 w-4" />}
          tone="primary"
          href="/admin/bookings"
        />
        <KpiCard
          label={t("admin.kpiNewUsers")}
          value={o.newUsersWeek}
          sub={t("admin.kpiThisWeek")}
          icon={<Users className="h-4 w-4" />}
          tone="info"
          href="/admin/users"
        />
        <KpiCard
          label={t("admin.kpiPendingKyc")}
          value={o.pendingKyc}
          sub={t("admin.kpiAwaitingReview")}
          icon={<UserCheck className="h-4 w-4" />}
          tone={o.pendingKyc > 0 ? "warning" : "primary"}
          href="/admin/pandits?kyc=SUBMITTED"
        />
        <KpiCard
          label={t("admin.kpiActivePandits")}
          value={o.activePandits}
          sub={t("admin.kpiVerifiedActive")}
          icon={<Activity className="h-4 w-4" />}
          tone="success"
          href="/admin/pandits?verified=yes"
        />
        <KpiCard
          label={t("admin.kpiMajorFestivals")}
          value={majorSoon.length}
          sub={t("admin.kpiNext14Days")}
          icon={<CalendarDays className="h-4 w-4" />}
          tone="maroon"
          href="/admin/festivals"
        />
        <KpiCard
          label={t("admin.kpiConsultations")}
          value={o.needsAttention.consultsRequested.length}
          sub={t("admin.kpiRequested")}
          icon={<Sparkles className="h-4 w-4" />}
          tone={o.needsAttention.consultsRequested.length ? "warning" : "primary"}
          href="/admin/consultations?status=REQUESTED"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title={t("admin.chartRevenue30")} subtitle={t("admin.chartRevenue30Sub")} className="xl:col-span-2">
          <MiniLineChart data={o.revenueSeries} format={(n) => compactINR(n)} ariaLabel={t("admin.chartRevenue30")} />
        </Panel>
        <Panel title={t("admin.chartBookingsByType")}>
          <MiniBarChart
            data={o.bookingsByType.map((b) => ({ label: labelOf(SERVICE_TYPES, b.type, locale), value: b.count }))}
            className="mt-1"
          />
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("admin.byStatus")}</p>
            <ul className="flex flex-wrap gap-1.5">
              {statusRows.map((s) => (
                <li key={s.value}>
                  <Link href={`/admin/bookings?status=${s.value}`} className="inline-flex">
                    <Badge tone="muted">
                      {labelOf(BOOKING_STATUSES, s.value, locale)} · <span className="font-bold">{o.byStatus[s.value]}</span>
                    </Badge>
                  </Link>
                </li>
              ))}
              {!statusRows.length && <li className="text-xs text-muted">{t("admin.noData")}</li>}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title={t("admin.needsAttention")} icon={<TriangleAlert className="h-4 w-4 text-warning" />} bodyClassName="p-0">
          <div className="divide-y divide-border">
            <AttentionGroup
              title={t("admin.attnUnassigned")}
              hint={t("admin.attnUnassignedHint")}
              count={o.needsAttention.needsPandit.length}
              href="/admin/bookings?status=CONFIRMED"
            >
              {o.needsAttention.needsPandit.map((b) => (
                <AttentionRow
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  title={`${b.code} · ${loc(b.service, "name", locale)}`}
                  meta={`${formatDate(b.scheduledDate, locale)} · ${b.user.name ?? b.user.phone ?? ""}`}
                />
              ))}
            </AttentionGroup>

            <AttentionGroup title={t("admin.attnKyc")} hint={t("admin.attnKycHint")} count={o.needsAttention.kycSubmitted.length} href="/admin/pandits?kyc=SUBMITTED">
              {o.needsAttention.kycSubmitted.map((p) => (
                <AttentionRow
                  key={p.id}
                  href={`/admin/pandits/${p.id}`}
                  title={locale === "hi" ? p.displayNameHi || p.displayName : p.displayName}
                  meta={[p.city, p.kycSubmittedAt ? formatDateTime(p.kycSubmittedAt, locale) : null].filter(Boolean).join(" · ")}
                />
              ))}
            </AttentionGroup>

            <AttentionGroup
              title={t("admin.attnConsults")}
              hint={t("admin.attnConsultsHint")}
              count={o.needsAttention.consultsRequested.length}
              href="/admin/consultations?status=REQUESTED"
            >
              {o.needsAttention.consultsRequested.map((c) => (
                <AttentionRow
                  key={c.id}
                  href="/admin/consultations?status=REQUESTED"
                  title={`${c.topic} · ${c.user.name ?? c.user.phone ?? ""}`}
                  meta={formatDateTime(c.createdAt, locale)}
                />
              ))}
            </AttentionGroup>

            <AttentionGroup title={t("admin.attnFailedPayments")} hint={t("admin.attnFailedHint")} count={o.needsAttention.failedToday.length} href="/admin/payments?status=FAILED">
              {o.needsAttention.failedToday.map((p) => (
                <AttentionRow
                  key={p.id}
                  href={p.booking ? `/admin/bookings/${p.booking.id}` : "/admin/payments?status=FAILED"}
                  title={`${p.booking?.code ?? p.id} · ${formatINR(p.amount, locale)}`}
                  meta={formatDateTime(p.updatedAt, locale)}
                />
              ))}
            </AttentionGroup>
          </div>
        </Panel>

        <Panel
          title={t("admin.upcomingFestivals")}
          subtitle={t("admin.next14Days")}
          actions={
            <Link href="/admin/festivals" className="text-xs font-medium text-primary hover:underline">
              {t("common.viewAll")}
            </Link>
          }
          bodyClassName="p-0"
        >
          {o.upcomingFestivals.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">{t("admin.noFestivalsSoon")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {o.upcomingFestivals.map((f) => {
                const d = daysUntil(f.date);
                return (
                  <li key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-[10px] font-bold leading-none text-primary-700">
                      <span className="text-sm">{f.date.slice(8)}</span>
                      {f.date.slice(5, 7)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{loc(f, "name", locale)}</p>
                      <p className="text-xs text-muted">
                        {formatDate(f.date, locale)} · {d === 0 ? t("common.today") : d === 1 ? t("common.tomorrow") : t("common.daysLeft", { n: d })}
                      </p>
                    </div>
                    {f.major && <Badge tone="gold">{t("admin.major")}</Badge>}
                    {!f.pushEnabled && <Badge tone="muted">{t("admin.pushOff")}</Badge>}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <Panel
          title={t("admin.recentBookings")}
          icon={<CreditCard className="h-4 w-4 text-muted" />}
          actions={
            <Link href="/admin/bookings" className="text-xs font-medium text-primary hover:underline">
              {t("common.viewAll")}
            </Link>
          }
          bodyClassName="p-0"
        >
          <DataTable
            columns={columns}
            rows={o.recentBookings}
            keyOf={(b) => b.id}
            href={(b) => `/admin/bookings/${b.id}`}
            empty={t("admin.noBookings")}
            maxHeight="none"
            className="rounded-none border-0 shadow-none"
          />
        </Panel>
      </div>
    </>
  );
}

function AttentionGroup({
  title,
  hint,
  count,
  href,
  children,
}: {
  title: string;
  hint: string;
  count: number;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {title} <span className={count ? "text-danger" : "text-muted"}>({count})</span>
          </p>
          <p className="text-xs text-muted">{hint}</p>
        </div>
        {count > 0 && (
          <Link
            href={href}
            className="shrink-0 text-xs font-medium text-primary hover:underline max-sm:-mr-2 max-sm:inline-flex max-sm:h-10 max-sm:w-10 max-sm:items-center max-sm:justify-center max-sm:text-base"
          >
            {href ? "→" : null}
          </Link>
        )}
      </div>
      {count > 0 && <ul className="mt-2 space-y-1">{children}</ul>}
    </div>
  );
}

function AttentionRow({ href, title, meta }: { href: string; title: string; meta?: string }) {
  return (
    <li>
      {/* Phones stack the meta under the title so neither is squeezed. */}
      <Link
        href={href}
        className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-xs hover:bg-surface-2 max-sm:flex-col max-sm:items-stretch max-sm:gap-0.5 max-sm:py-2"
      >
        <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
        {meta && <span className="shrink-0 text-muted max-sm:truncate">{meta}</span>}
      </Link>
    </li>
  );
}
