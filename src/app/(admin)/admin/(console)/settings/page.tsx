import { ServerCog } from "lucide-react";
import { AdminPageHeader, DetailList, DetailRow, Panel } from "@/components/admin/page-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { getEnvInfo, getSettingsMap } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { SETTING_KEYS } from "@/lib/admin/util";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const { t } = await getT();
  const stored = await getSettingsMap();
  const env = getEnvInfo();
  const values: Record<string, string> = {};
  for (const k of SETTING_KEYS) values[k] = stored[k] ?? "";

  return (
    <>
      <AdminPageHeader title={t("admin.settingsTitle")} subtitle={t("admin.settingsSubtitle")} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SettingsForm values={values} />
        </div>

        <Panel title={t("admin.environment")} icon={<ServerCog className="h-4 w-4 text-muted" />} subtitle={t("admin.environmentHint")}>
          <DetailList>
            <DetailRow label={t("admin.paymentProvider")}>
              <Badge tone={env.paymentProvider === "razorpay" ? "success" : "muted"}>{env.paymentProvider}</Badge>
            </DetailRow>
            <DetailRow label={t("admin.webPush")}>
              <Badge tone={env.vapidConfigured ? "success" : "warning"}>{env.vapidConfigured ? t("admin.configured") : t("admin.notConfigured")}</Badge>
            </DetailRow>
            <DetailRow label={t("admin.otpDevMode")}>
              <Badge tone={env.otpDevMode ? "warning" : "success"}>{env.otpDevMode ? t("admin.on") : t("admin.off")}</Badge>
            </DetailRow>
            <DetailRow label={t("admin.cronPath")}>
              <code className="break-all text-xs">{env.cronPath}</code>
            </DetailRow>
            <DetailRow label={t("admin.appUrl")}>
              <code className="break-all text-xs">{env.appUrl}</code>
            </DetailRow>
            <DetailRow label={t("admin.nodeEnv")}>
              <Badge tone="muted">{env.nodeEnv}</Badge>
            </DetailRow>
          </DetailList>
          <p className="mt-3 text-xs text-muted">{t("admin.envSecretsHidden")}</p>
        </Panel>
      </div>
    </>
  );
}
