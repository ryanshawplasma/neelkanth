import { Bell, Megaphone, RefreshCw, Send } from "lucide-react";
import { AdminPageHeader, DetailList, DetailRow, Panel } from "@/components/admin/page-shell";
import { CampaignComposer } from "@/components/admin/campaign-composer";
import { RunRemindersButton, SendTestNotificationButton } from "@/components/admin/run-reminders";
import { ActionButton } from "@/components/admin/action-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { KpiCard } from "@/components/admin/kpi-card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { getAudienceCounts, getDistinctCities, getEnvInfo, getNotificationStats, listCampaigns } from "@/lib/admin/queries";
import { deleteCampaignAction, sendCampaignNowAction } from "@/lib/admin/notification-actions";
import { getT } from "@/i18n/server";
import { AUDIENCE_LABELS, labelFrom } from "@/lib/admin/util";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const { t, locale } = await getT();
  const [campaigns, stats, counts, cities] = await Promise.all([listCampaigns(), getNotificationStats(), getAudienceCounts(), getDistinctCities()]);
  const env = getEnvInfo();

  return (
    <>
      <AdminPageHeader title={t("admin.notificationsTitle")} subtitle={t("admin.notificationsSubtitle")} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label={t("admin.notifTotal")} value={stats.total} icon={<Bell className="h-4 w-4" />} tone="primary" />
        <KpiCard label={t("admin.notifToday")} value={stats.today} icon={<Send className="h-4 w-4" />} tone="info" />
        <KpiCard label={t("admin.notifPushed")} value={stats.pushed} sub={t("admin.viaWebPush")} icon={<Megaphone className="h-4 w-4" />} tone="success" />
        <KpiCard label={t("admin.pushSubscribers")} value={stats.subs} sub={env.vapidConfigured ? t("admin.vapidOn") : t("admin.vapidOff")} icon={<Bell className="h-4 w-4" />} tone={stats.subs ? "gold" : "info"} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title={t("admin.campaignComposer")} subtitle={t("admin.campaignComposerHint")} className="xl:col-span-2">
          <CampaignComposer counts={counts} cities={cities} />
        </Panel>

        <Panel title={t("admin.reminderEngine")} icon={<RefreshCw className="h-4 w-4 text-muted" />} subtitle={t("admin.reminderEngineHint")}>
          <div className="space-y-3">
            <RunRemindersButton />
            <SendTestNotificationButton />
            <DetailList className="border-t border-border pt-2">
              <DetailRow label={t("admin.lastRun")}>
                <span className="break-words text-xs">{stats.lastRun ?? t("admin.never")}</span>
              </DetailRow>
              <DetailRow label={t("admin.cronPath")}>
                <code className="break-all text-xs">{env.cronPath}</code>
              </DetailRow>
              <DetailRow label={t("admin.cronSecret")}>
                <Badge tone={env.cronConfigured ? "success" : "warning"}>{env.cronConfigured ? t("admin.configured") : t("admin.notConfigured")}</Badge>
              </DetailRow>
              <DetailRow label={t("admin.webPush")}>
                <Badge tone={env.vapidConfigured ? "success" : "muted"}>{env.vapidConfigured ? t("admin.configured") : t("admin.notConfigured")}</Badge>
              </DetailRow>
            </DetailList>
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title={t("admin.campaignHistory")} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2.5 text-left">{t("admin.notifTitle")}</th>
                  <th className="px-3 py-2.5 text-left">{t("admin.audience")}</th>
                  <th className="px-3 py-2.5 text-left">{t("common.status")}</th>
                  <th className="px-3 py-2.5 text-right">{t("admin.sentCount")}</th>
                  <th className="px-3 py-2.5 text-left">{t("admin.when")}</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-t border-border/70 hover:bg-surface-2/50">
                    <td className="px-3 py-2">
                      <p className="font-medium">{locale === "hi" ? c.titleHi : c.titleEn}</p>
                      <p className="truncate text-xs text-muted">{(locale === "hi" ? c.bodyHi : c.bodyEn) ?? "—"}</p>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {c.audience.startsWith("CITY:") ? c.audience.slice(5) : labelFrom(AUDIENCE_LABELS, c.audience, locale)}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge kind="campaign" value={c.status} locale={locale} />
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{c.sentCount}</td>
                    <td className="px-3 py-2 text-xs text-muted">
                      {c.sentAt ? formatDateTime(c.sentAt, locale) : c.scheduledAt ? formatDateTime(c.scheduledAt, locale) : formatDateTime(c.createdAt, locale)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1.5">
                        {c.status !== "SENT" && (
                          <ActionButton action={sendCampaignNowAction.bind(null, c.id)} icon={<Send className="h-3.5 w-3.5" />} successMessage={t("admin.campaignSentShort")}>
                            {t("admin.sendNow")}
                          </ActionButton>
                        )}
                        <ActionButton
                          action={deleteCampaignAction.bind(null, c.id)}
                          variant="ghost"
                          className="text-danger"
                          confirm={{ title: t("admin.deleteCampaign"), description: locale === "hi" ? c.titleHi : c.titleEn, danger: true }}
                          successMessage={t("admin.deleted")}
                        >
                          {t("common.delete")}
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!campaigns.length && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm text-muted">
                      {t("admin.noCampaigns")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
