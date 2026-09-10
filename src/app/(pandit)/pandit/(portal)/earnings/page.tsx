import type { Metadata } from "next";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { getT } from "@/i18n/server";
import { getEarnings } from "@/lib/pandit/queries";
import { isMonthKey, lastMonths, monthKey, monthLabel, netEarning } from "@/lib/pandit/shared";
import { formatDate, formatINR, loc, maskDoc } from "@/lib/utils";
import { Stat, EmptyState } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { PortalHeader } from "@/components/pandit/shell";
import { Panel } from "@/components/pandit/common";
import { MonthSelect } from "@/components/pandit/month-select";

export const metadata: Metadata = { title: "Earnings" };

export default async function PanditEarningsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { t, locale } = await getT();
  const sp = await searchParams;
  const month = isMonthKey(sp.month) ? sp.month : monthKey();
  const { pandit, rows, payouts, gross, net, chart, paidOut, pendingPayout } = await getEarnings(month);
  const options = lastMonths(12);
  if (!options.includes(month)) options.push(month);

  const max = Math.max(1, ...chart.map((c) => c.net));
  const barW = 100 / (chart.length * 2 - 1);

  return (
    <div className="pb-8">
      <PortalHeader
        title={t("pandit.earningsTitle")}
        subtitle={t("pandit.earningsSubtitle")}
        action={<MonthSelect value={month} options={options.slice().reverse()} />}
      />

      <div className="space-y-4 px-4 pt-2">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label={t("pandit.netTotal")} value={formatINR(net, locale)} tone="success" icon={<Wallet className="h-4 w-4" />} />
          <Stat label={t("pandit.grossTotal")} value={formatINR(gross, locale)} />
          <Stat label={t("pandit.bookingsCount")} value={rows.length} tone="info" />
          <Stat label={t("pandit.payoutPending")} value={formatINR(pendingPayout, locale)} tone="warning" sub={`${t("pandit.payoutPaid")}: ${formatINR(paidOut, locale)}`} />
        </div>

        <Panel title={t("pandit.last6Months")}>
          <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="h-32 w-full" role="img" aria-label={t("pandit.last6Months")}>
            {chart.map((c, i) => {
              const h = (c.net / max) * 32;
              const x = i * barW * 2;
              return (
                <g key={c.month}>
                  <rect x={x} y={36 - h} width={barW} height={Math.max(h, 0.6)} rx={0.8} fill="var(--primary)" opacity={c.month === month ? 1 : 0.45} />
                </g>
              );
            })}
          </svg>
          <div className="mt-1 flex">
            {chart.map((c) => (
              <div key={c.month} className="flex-1 text-center">
                <p className="text-[10px] font-medium text-muted">{monthLabel(c.month, locale)}</p>
                <p className="text-[10px] font-semibold">{c.net > 0 ? formatINR(c.net, locale) : "—"}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={t("pandit.bookingsCount")}>
          {rows.length ? (
            <div className="-mx-4 overflow-x-auto px-4">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3 font-medium">{t("pandit.tableDate")}</th>
                    <th className="py-2 pr-3 font-medium">{t("pandit.tableService")}</th>
                    <th className="py-2 pr-3 text-right font-medium">{t("pandit.tableGross")}</th>
                    <th className="py-2 pr-3 text-right font-medium">{t("pandit.tableCommission")}</th>
                    <th className="py-2 text-right font-medium">{t("pandit.tableNet")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-muted">{formatDate(r.scheduledDate, locale)}</td>
                      <td className="py-2.5 pr-3">
                        <Link href={`/pandit/bookings/${r.id}`} className="font-medium hover:text-primary">
                          {loc(r.service, "name", locale)}
                        </Link>
                        <span className="block text-[11px] text-muted">{r.code}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-right">{formatINR(r.amountTotal, locale)}</td>
                      <td className="py-2.5 pr-3 text-right text-muted">{pandit.commissionPct}%</td>
                      <td className="py-2.5 text-right font-semibold text-success">{formatINR(netEarning(r.amountTotal, pandit.commissionPct), locale)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-bold">
                    <td className="py-2.5 pr-3" colSpan={2}>
                      {t("common.total")}
                    </td>
                    <td className="py-2.5 pr-3 text-right">{formatINR(gross, locale)}</td>
                    <td />
                    <td className="py-2.5 text-right text-success">{formatINR(net, locale)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <EmptyState className="py-8" title={t("pandit.noEarnings")} hint={t("pandit.noEarningsHint")} />
          )}
        </Panel>

        <Panel title={t("pandit.payouts")}>
          {payouts.length ? (
            <ul className="divide-y divide-border">
              {payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">{formatINR(p.amount, locale)}</p>
                    <p className="text-xs text-muted">
                      {formatDate(p.paidAt ?? p.createdAt, locale)}
                      {p.reference ? ` · ${p.reference}` : ""}
                    </p>
                  </div>
                  <Badge tone={p.status === "PAID" ? "success" : "warning"}>{p.status === "PAID" ? t("pandit.payoutPaid") : t("pandit.payoutPending")}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("pandit.noPayouts")}</p>
          )}

          <div className="mt-4 rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
            <p className="text-xs text-muted">{t("pandit.payoutTo")}</p>
            <p className="mt-0.5 font-medium">
              {pandit.bankAccountNo ? `${pandit.bankAccountName ?? ""} · ${maskDoc(pandit.bankAccountNo)} · ${pandit.bankIfsc ?? ""}` : pandit.upiId || "—"}
            </p>
            <Link href="/pandit/kyc" className="mt-1 inline-block text-xs font-semibold text-primary hover:underline">
              {t("pandit.updateBank")}
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
