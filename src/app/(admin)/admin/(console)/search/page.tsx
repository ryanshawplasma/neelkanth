import Link from "next/link";
import { CalendarCheck, CalendarDays, Flame, Landmark, UserCheck, Users } from "lucide-react";
import { AdminPageHeader, Panel } from "@/components/admin/page-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { globalSearch } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { SERVICE_TYPES, labelOf } from "@/lib/constants";
import { sp, type SearchParams } from "@/lib/admin/util";
import { formatDate, formatINR, loc } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = sp(params, "q");
  const { t, locale } = await getT();
  const r = await globalSearch(q);
  const total = r.bookings.length + r.users.length + r.pandits.length + r.services.length + r.temples.length + r.festivals.length;

  return (
    <>
      <AdminPageHeader title={t("admin.searchResults", { q })} subtitle={t("admin.searchResultsCount", { n: total })} />

      {q.length < 2 && <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">{t("admin.searchHint")}</p>}

      {q.length >= 2 && total === 0 && <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">{t("common.noResults")}</p>}

      <div className="grid gap-4 xl:grid-cols-2">
        {r.bookings.length > 0 && (
          <Panel title={t("admin.bookingsTitle")} icon={<CalendarCheck className="h-4 w-4 text-muted" />} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {r.bookings.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/bookings/${b.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {b.code} · {loc(b.service, "name", locale)}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {b.user.name ?? b.user.phone ?? ""} · {formatDate(b.scheduledDate, locale)} · {formatINR(b.amountTotal, locale)}
                      </p>
                    </div>
                    <StatusBadge kind="booking" value={b.status} locale={locale} />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {r.users.length > 0 && (
          <Panel title={t("admin.usersTitle")} icon={<Users className="h-4 w-4 text-muted" />} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {r.users.map((u) => (
                <li key={u.id}>
                  <Link href={`/admin/users/${u.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{u.name ?? t("admin.noName")}</p>
                      <p className="truncate text-xs text-muted">{u.phone ?? u.email ?? "—"}</p>
                    </div>
                    <Badge tone={u.role === "ADMIN" ? "maroon" : u.role === "PANDIT" ? "info" : "muted"}>{u.role}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {r.pandits.length > 0 && (
          <Panel title={t("admin.panditsTitle")} icon={<UserCheck className="h-4 w-4 text-muted" />} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {r.pandits.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/pandits/${p.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{locale === "hi" ? p.displayNameHi || p.displayName : p.displayName}</p>
                      <p className="truncate text-xs text-muted">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</p>
                    </div>
                    <StatusBadge kind="kyc" value={p.kycStatus} locale={locale} />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {r.services.length > 0 && (
          <Panel title={t("admin.servicesTitle")} icon={<Flame className="h-4 w-4 text-muted" />} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {r.services.map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/services/${s.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{loc(s, "name", locale)}</p>
                      <p className="truncate text-xs text-muted">
                        {labelOf(SERVICE_TYPES, s.type, locale)} · {formatINR(s.basePrice, locale)}
                      </p>
                    </div>
                    <Badge tone={s.active ? "success" : "muted"}>{s.active ? t("common.active") : t("common.inactive")}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {r.temples.length > 0 && (
          <Panel title={t("admin.templesTitle")} icon={<Landmark className="h-4 w-4 text-muted" />} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {r.temples.map((x) => (
                <li key={x.id}>
                  <Link href={`/admin/temples/${x.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-2">
                    <p className="truncate text-sm font-medium">{loc(x, "name", locale)}</p>
                    <span className="shrink-0 text-xs text-muted">
                      {x.city}, {x.state}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {r.festivals.length > 0 && (
          <Panel title={t("admin.festivalsTitle")} icon={<CalendarDays className="h-4 w-4 text-muted" />} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {r.festivals.map((f) => (
                <li key={f.id}>
                  <Link href={`/admin/festivals/${f.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-2">
                    <p className="truncate text-sm font-medium">{loc(f, "name", locale)}</p>
                    <span className="shrink-0 text-xs text-muted">{formatDate(f.date, locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </>
  );
}
