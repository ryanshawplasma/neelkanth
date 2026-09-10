import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, CalendarDays, FileCheck, Flame, Star, UserCheck } from "lucide-react";
import { AdminPageHeader, DetailList, DetailRow, Panel } from "@/components/admin/page-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { CellStack, DataTable, type Column } from "@/components/admin/data-table";
import { ToggleAction } from "@/components/admin/action-button";
import {
  BlockUserButton,
  CommissionField,
  DocPreview,
  DocStatusBadge,
  KycDecision,
  KycDocActions,
  MarkPayoutPaidButton,
  PanditServicesEditor,
  PayoutPanel,
  type ServiceRow,
} from "@/components/admin/pandit-actions-ui";
import { Avatar, Stars } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { getPanditBalance, getPanditDetail, listServiceOptions } from "@/lib/admin/queries";
import { togglePanditFlagAction } from "@/lib/admin/pandit-actions";
import { getT } from "@/i18n/server";
import { KYC_DOC_TYPES, LANGUAGES, PANDIT_CLASSIFICATIONS, SPECIALITIES, WEEKDAYS, labelOf, pickBi } from "@/lib/constants";
import { DOC_STATUS_LABELS, labelFrom, maskNumber } from "@/lib/admin/util";
import { formatDate, formatDateTime, formatINR, loc, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Detail = NonNullable<Awaited<ReturnType<typeof getPanditDetail>>>;
type BookingRow = Detail["bookings"][number];
type PayoutRow = Detail["payouts"][number];

export default async function AdminPanditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { t, locale } = await getT();
  const p = await getPanditDetail(id);
  if (!p) notFound();

  const [balance, allServices] = await Promise.all([getPanditBalance(p.id, p.commissionPct), listServiceOptions()]);
  const offered = new Map(p.services.map((s) => [s.serviceId, s]));
  const serviceRows: ServiceRow[] = allServices.map((s) => ({
    id: s.id,
    name: loc(s, "name", locale),
    basePrice: s.basePrice,
    offered: offered.has(s.id),
    active: offered.get(s.id)?.active ?? false,
    price: offered.get(s.id)?.price ?? null,
  }));

  const specialities = parseJson<string[]>(p.specialities, []);
  const languages = parseJson<string[]>(p.languages, []);
  const name = locale === "hi" ? p.displayNameHi || p.displayName : p.displayName;

  const bookingCols: Column<BookingRow>[] = [
    { key: "code", header: t("admin.colCode"), cell: (b) => <CellStack top={b.code} bottom={loc(b.service, "name", locale)} href={`/admin/bookings/${b.id}`} /> },
    { key: "date", header: t("common.date"), cell: (b) => <span className="whitespace-nowrap text-xs">{formatDate(b.scheduledDate, locale)}</span> },
    { key: "devotee", header: t("admin.colDevotee"), cell: (b) => <span className="text-xs">{b.user.name ?? b.user.phone ?? "—"}</span>, hideOnTablet: true },
    { key: "amount", header: t("admin.colAmount"), align: "right", cell: (b) => <span className="tabular-nums">{formatINR(b.amountTotal, locale)}</span> },
    { key: "status", header: t("common.status"), cell: (b) => <StatusBadge kind="booking" value={b.status} locale={locale} /> },
  ];

  const payoutCols: Column<PayoutRow>[] = [
    { key: "date", header: t("common.date"), cell: (x) => <span className="whitespace-nowrap text-xs">{formatDateTime(x.createdAt, locale)}</span> },
    { key: "amount", header: t("admin.colAmount"), align: "right", cell: (x) => <span className="font-semibold tabular-nums">{formatINR(x.amount, locale)}</span> },
    { key: "reference", header: t("admin.payoutReference"), cell: (x) => <span className="text-xs">{x.reference ?? "—"}</span> },
    { key: "note", header: t("admin.note"), cell: (x) => <span className="text-xs text-muted">{x.note ?? "—"}</span>, hideOnTablet: true },
    { key: "status", header: t("common.status"), cell: (x) => <StatusBadge kind="payout" value={x.status} locale={locale} /> },
    { key: "action", header: "", align: "right", cell: (x) => (x.status === "PENDING" ? <MarkPayoutPaidButton payoutId={x.id} /> : null) },
  ];

  return (
    <>
      <AdminPageHeader
        back="/admin/pandits"
        backLabel={t("admin.panditsTitle")}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {name}
            <StatusBadge kind="kyc" value={p.kycStatus} locale={locale} />
            {p.verified && <Badge tone="success">{t("common.verified")}</Badge>}
            {p.user.isBlocked && <Badge tone="danger">{t("admin.blocked")}</Badge>}
          </span>
        }
        subtitle={`${labelOf(PANDIT_CLASSIFICATIONS, p.classification, locale)} · ${[p.city, p.state].filter(Boolean).join(", ") || "—"}`}
        actions={
          <>
            <BlockUserButton userId={p.userId} blocked={p.user.isBlocked} />
            <KycDecision panditId={p.id} kycStatus={p.kycStatus} />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title={t("admin.kycDocuments")} icon={<FileCheck className="h-4 w-4 text-muted" />} subtitle={t("admin.kycDocumentsHint")}>
            {p.documents.length === 0 ? (
              <p className="text-sm text-muted">{t("admin.noDocuments")}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {p.documents.map((doc) => (
                  <div key={doc.id} className="rounded-2xl border border-border p-2.5">
                    <DocPreview url={doc.fileUrl} label={doc.type} />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{labelOf(KYC_DOC_TYPES, doc.type, locale)}</p>
                      <DocStatusBadge status={doc.status} label={labelFrom(DOC_STATUS_LABELS, doc.status, locale)} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{maskNumber(doc.docNumber)}</p>
                    {doc.note && <p className="mt-1 text-xs text-danger">{doc.note}</p>}
                    <KycDocActions docId={doc.id} status={doc.status} />
                  </div>
                ))}
              </div>
            )}
            {p.kycReviewNote && (
              <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">
                {t("admin.reviewNote")}: {p.kycReviewNote}
              </p>
            )}
          </Panel>

          <Panel title={t("admin.servicesOffered")} icon={<Flame className="h-4 w-4 text-muted" />} subtitle={t("admin.servicesOfferedHint")}>
            <PanditServicesEditor panditId={p.id} rows={serviceRows} />
          </Panel>

          <Panel title={t("admin.availability")} icon={<CalendarDays className="h-4 w-4 text-muted" />}>
            {p.availability.length === 0 ? (
              <p className="text-sm text-muted">{t("admin.noAvailability")}</p>
            ) : (
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {p.availability.map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-1.5 text-sm">
                    <span className="font-medium">{pickBi(WEEKDAYS[a.weekday], locale)}</span>
                    <span className="text-muted">
                      {a.startTime}–{a.endTime}
                    </span>
                    {!a.enabled && <Badge tone="muted">{t("common.inactive")}</Badge>}
                  </li>
                ))}
              </ul>
            )}
            {p.blockedDates.length > 0 && (
              <p className="mt-3 text-xs text-muted">
                {t("admin.blockedDates")}: {p.blockedDates.map((b) => formatDate(b.date, locale)).join(", ")}
              </p>
            )}
          </Panel>

          <Panel title={t("admin.payouts")} icon={<Banknote className="h-4 w-4 text-muted" />} subtitle={t("admin.payoutsHint")}>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label={t("admin.grossEarned")} value={formatINR(balance.gross, locale)} />
              <Stat label={t("admin.netAfterCommission")} value={formatINR(balance.net, locale)} />
              <Stat label={t("admin.paidOut")} value={formatINR(balance.paidOut, locale)} />
              <Stat label={t("admin.balance")} value={formatINR(balance.balance, locale)} highlight />
            </div>
            <PayoutPanel panditId={p.id} balance={balance.balance} />
            <div className="mt-3">
              <DataTable columns={payoutCols} rows={p.payouts} keyOf={(x) => x.id} empty={t("admin.noPayouts")} maxHeight="24rem" />
            </div>
          </Panel>

          <Panel title={t("admin.recentBookings")} bodyClassName="p-0">
            <DataTable
              columns={bookingCols}
              rows={p.bookings}
              keyOf={(b) => b.id}
              href={(b) => `/admin/bookings/${b.id}`}
              empty={t("admin.noBookings")}
              maxHeight="26rem"
              className="rounded-none border-0 shadow-none"
            />
          </Panel>

          <Panel title={t("common.reviews")} icon={<Star className="h-4 w-4 text-muted" />} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {p.reviews.map((r) => (
                <li key={r.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Stars value={r.rating} />
                    <span className="text-xs text-muted">
                      {r.user.name ?? "—"} · {formatDate(r.createdAt, locale)}
                    </span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
                  <p className="mt-0.5 text-xs text-muted">{loc(r.service, "name", locale)}</p>
                </li>
              ))}
              {!p.reviews.length && <li className="px-4 py-6 text-center text-sm text-muted">{t("admin.noReviews")}</li>}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title={t("admin.profile")} icon={<UserCheck className="h-4 w-4 text-muted" />}>
            <div className="flex items-center gap-3">
              <Avatar src={p.photoUrl} name={p.displayName} size={56} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{name}</p>
                <p className="truncate text-xs text-muted">{p.user.phone ?? p.user.email ?? "—"}</p>
                <Stars value={p.ratingAvg} count={p.ratingCount} className="mt-1" />
              </div>
            </div>
            <DetailList className="mt-3">
              <DetailRow label={t("admin.experienceYears")}>{p.experienceYears}</DetailRow>
              <DetailRow label={t("common.languages")}>{languages.map((l) => labelOf(LANGUAGES, l, locale)).join(", ") || "—"}</DetailRow>
              <DetailRow label={t("common.speciality")}>{specialities.map((s) => labelOf(SPECIALITIES, s, locale)).join(", ") || "—"}</DetailRow>
              <DetailRow label={t("admin.sampradaya")}>{p.sampradaya ?? "—"}</DetailRow>
              <DetailRow label={t("common.gotra")}>{p.gotra ?? "—"}</DetailRow>
              <DetailRow label={t("admin.education")}>{p.education ?? "—"}</DetailRow>
              <DetailRow label={t("admin.serves")}>
                {[p.servesOnline && t("common.online"), p.servesAtHome && t("common.atHome"), p.servesAtTemple && t("common.atTemple")]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </DetailRow>
              <DetailRow label={t("admin.serviceRadius")}>{p.serviceRadiusKm} km</DetailRow>
              <DetailRow label={t("common.temples")}>{p.temple ? loc(p.temple, "name", locale) : "—"}</DetailRow>
              <DetailRow label={t("admin.completed")}>{p.completedCount}</DetailRow>
              <DetailRow label={t("admin.kycSubmitted")}>{p.kycSubmittedAt ? formatDateTime(p.kycSubmittedAt, locale) : "—"}</DetailRow>
              <DetailRow label={t("admin.kycReviewed")}>{p.kycReviewedAt ? formatDateTime(p.kycReviewedAt, locale) : "—"}</DetailRow>
              <DetailRow label={t("admin.bankDetails")}>
                {p.bankAccountNo ? `${p.bankAccountName ?? ""} · ${maskNumber(p.bankAccountNo)} · ${p.bankIfsc ?? ""}` : p.upiId ?? "—"}
              </DetailRow>
            </DetailList>
            {p.bio && <p className="mt-3 border-t border-border pt-3 text-sm text-muted">{loc(p, "bio", locale)}</p>}
          </Panel>

          <Panel title={t("admin.flags")}>
            <div className="space-y-3">
              <ToggleAction checked={p.verified} label={t("common.verified")} action={togglePanditFlagAction.bind(null, p.id, "verified")} />
              <ToggleAction checked={p.featured} label={t("common.featured")} action={togglePanditFlagAction.bind(null, p.id, "featured")} />
              <ToggleAction checked={p.isActive} label={t("common.active")} action={togglePanditFlagAction.bind(null, p.id, "isActive")} />
              <div className="border-t border-border pt-3">
                <CommissionField panditId={p.id} value={p.commissionPct} />
              </div>
            </div>
          </Panel>

          <Panel title={t("admin.account")}>
            <DetailList>
              <DetailRow label={t("admin.userAccount")}>
                <Link href={`/admin/users/${p.userId}`} className="text-primary hover:underline">
                  {p.user.name ?? p.user.phone ?? p.userId.slice(-6)}
                </Link>
              </DetailRow>
              <DetailRow label={t("admin.role")}>{p.user.role}</DetailRow>
              <DetailRow label={t("admin.colJoined")}>{formatDateTime(p.createdAt, locale)}</DetailRow>
            </DetailList>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-2.5 ${highlight ? "border-primary/40 bg-primary-soft" : "border-border bg-surface-2"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}
