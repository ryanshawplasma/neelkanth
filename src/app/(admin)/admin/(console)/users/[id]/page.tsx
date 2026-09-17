import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, Heart, Sparkles, Users } from "lucide-react";
import { AdminPageHeader, DetailList, DetailRow, Panel } from "@/components/admin/page-shell";
import { CellStack, DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { BlockUserButton } from "@/components/admin/pandit-actions-ui";
import { LocaleSelect, MakeAdminButton, MessageUserButton, SendNotificationButton } from "@/components/admin/user-actions-ui";
import { Avatar } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { getUserDetail } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { CONSULT_TOPICS, RASHIS, labelOf } from "@/lib/constants";
import { CONSULT_STATUS_LABELS, labelFrom } from "@/lib/admin/util";
import { formatDate, formatDateTime, formatINR, loc } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Detail = NonNullable<Awaited<ReturnType<typeof getUserDetail>>>;
type BookingRow = Detail["bookings"][number];

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { t, locale } = await getT();
  const u = await getUserDetail(id);
  if (!u) notFound();

  const bookingCols: Column<BookingRow>[] = [
    { key: "code", header: t("admin.colCode"), cell: (b) => <CellStack top={b.code} bottom={loc(b.service, "name", locale)} href={`/admin/bookings/${b.id}`} /> },
    { key: "date", header: t("common.date"), cell: (b) => <span className="whitespace-nowrap text-xs">{formatDate(b.scheduledDate, locale)}</span> },
    { key: "amount", header: t("admin.colAmount"), align: "right", cell: (b) => <span className="tabular-nums">{formatINR(b.amountTotal, locale)}</span> },
    { key: "payment", header: t("admin.colPayment"), cell: (b) => <StatusBadge kind="payment" value={b.payment?.status} locale={locale} />, hideOnTablet: true },
    { key: "status", header: t("common.status"), cell: (b) => <StatusBadge kind="booking" value={b.status} locale={locale} /> },
  ];

  return (
    <>
      <AdminPageHeader
        back="/admin/users"
        backLabel={t("admin.usersTitle")}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {u.name ?? t("admin.noName")}
            <Badge tone={u.role === "ADMIN" ? "maroon" : u.role === "PANDIT" ? "info" : "muted"}>{u.role}</Badge>
            {u.isBlocked && <Badge tone="danger">{t("admin.blocked")}</Badge>}
          </span>
        }
        subtitle={`${u.phone ?? u.email ?? "—"} · ${t("admin.joinedOn", { date: formatDate(u.createdAt, locale) })}`}
        actions={
          <>
            <MessageUserButton userId={u.id} />
            <SendNotificationButton userId={u.id} />
            <MakeAdminButton userId={u.id} role={u.role} />
            <BlockUserButton userId={u.id} blocked={u.isBlocked} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title={t("admin.bookingsTitle")} bodyClassName="p-0">
            <DataTable
              columns={bookingCols}
              rows={u.bookings}
              keyOf={(b) => b.id}
              href={(b) => `/admin/bookings/${b.id}`}
              empty={t("admin.noBookings")}
              maxHeight="26rem"
              className="rounded-none border-0 shadow-none"
            />
          </Panel>

          <Panel title={t("common.family")} icon={<Users className="h-4 w-4 text-muted" />}>
            {u.familyMembers.length === 0 ? (
              <p className="text-sm text-muted">{t("admin.noFamily")}</p>
            ) : (
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {u.familyMembers.map((m) => (
                  <li key={m.id} className="rounded-xl border border-border px-3 py-2 text-sm">
                    <span className="font-medium">{m.name}</span>
                    <span className="ml-2 text-xs text-muted">
                      {[m.relation, m.gotra, m.dob].filter(Boolean).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={t("admin.consultations")} icon={<Sparkles className="h-4 w-4 text-muted" />} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {u.consultations.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{labelOf(CONSULT_TOPICS, c.topic, locale)}</p>
                    <p className="truncate text-xs text-muted">{c.question ?? "—"}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{labelFrom(CONSULT_STATUS_LABELS, c.status, locale)}</span>
                </li>
              ))}
              {!u.consultations.length && <li className="px-4 py-6 text-center text-sm text-muted">{t("admin.noConsultations")}</li>}
            </ul>
          </Panel>

          <Panel title={t("common.notifications")} icon={<Bell className="h-4 w-4 text-muted" />} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {u.notifications.map((n) => (
                <li key={n.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{locale === "hi" ? n.titleHi : n.titleEn}</p>
                    <span className="shrink-0 text-xs text-muted">{formatDateTime(n.createdAt, locale)}</span>
                  </div>
                  <p className="truncate text-xs text-muted">{(locale === "hi" ? n.bodyHi : n.bodyEn) ?? ""}</p>
                  <div className="mt-1 flex gap-1">
                    <Badge tone="muted">{n.type}</Badge>
                    {n.pushed && <Badge tone="info">{t("admin.pushed")}</Badge>}
                    {n.read && <Badge tone="success">{t("admin.read")}</Badge>}
                  </div>
                </li>
              ))}
              {!u.notifications.length && <li className="px-4 py-6 text-center text-sm text-muted">{t("admin.noNotifications")}</li>}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title={t("admin.profile")}>
            <div className="flex items-center gap-3">
              <Avatar src={u.avatarUrl} name={u.name} size={56} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{u.name ?? t("admin.noName")}</p>
                <p className="truncate text-xs text-muted">{u.phone ?? u.email ?? "—"}</p>
              </div>
            </div>
            <DetailList className="mt-3">
              <DetailRow label={t("common.gender")}>{u.gender ?? "—"}</DetailRow>
              <DetailRow label={t("common.gotra")}>{u.gotra ?? "—"}</DetailRow>
              <DetailRow label={t("common.dob")}>{u.dob ?? "—"}</DetailRow>
              <DetailRow label={t("common.tob")}>{u.tob ?? "—"}</DetailRow>
              <DetailRow label={t("common.birthPlace")}>{u.birthPlace ?? "—"}</DetailRow>
              <DetailRow label={t("common.rashi")}>{u.rashi ? labelOf(RASHIS, u.rashi, locale) : "—"}</DetailRow>
              <DetailRow label={t("common.address")}>{[u.addressLine, u.city, u.state, u.pincode].filter(Boolean).join(", ") || "—"}</DetailRow>
              <DetailRow label={t("admin.onboarded")}>{u.onboarded ? t("common.yes") : t("common.no")}</DetailRow>
              <DetailRow label={t("admin.lastSeen")}>{u.lastSeenAt ? formatDateTime(u.lastSeenAt, locale) : "—"}</DetailRow>
              <DetailRow label={t("common.language")}>
                <LocaleSelect userId={u.id} value={u.locale} />
              </DetailRow>
              {u.pandit && (
                <DetailRow label={t("admin.panditProfile")}>
                  <Link href={`/admin/pandits/${u.pandit.id}`} className="text-primary hover:underline">
                    {u.pandit.displayName}
                  </Link>
                </DetailRow>
              )}
            </DetailList>
          </Panel>

          <Panel title={t("admin.favorites")} icon={<Heart className="h-4 w-4 text-muted" />}>
            {u.favorites.length === 0 ? (
              <p className="text-sm text-muted">{t("admin.noFavorites")}</p>
            ) : (
              <ul className="space-y-1">
                {u.favorites.map((f) => (
                  <li key={f.id} className="truncate text-sm">
                    <Link href={`/admin/services/${f.serviceId}`} className="hover:text-primary hover:underline">
                      {loc(f.service, "name", locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
