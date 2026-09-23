"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CITIES } from "@/lib/app/cities";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { saveSettingsAction } from "@/lib/admin/settings-actions";
import { Panel } from "./page-shell";
import { tErr } from "./action-button";

type Group = { titleKey: string; fields: { key: string; labelKey: string; type?: "text" | "textarea" | "number"; hi?: boolean; placeholder?: string }[] };

const GROUPS: Group[] = [
  {
    titleKey: "admin.settingsBrand",
    fields: [
      { key: "app_name", labelKey: "admin.setAppName" },
      { key: "tagline_en", labelKey: "admin.setTaglineEn" },
      { key: "tagline_hi", labelKey: "admin.setTaglineHi", hi: true },
    ],
  },
  {
    titleKey: "admin.settingsSupport",
    fields: [
      { key: "support_phone", labelKey: "admin.setSupportPhone", placeholder: "+91…" },
      { key: "support_email", labelKey: "admin.setSupportEmail", placeholder: "help@divyadham.app" },
      { key: "support_whatsapp", labelKey: "admin.setSupportWhatsapp", placeholder: "+91…" },
    ],
  },
  {
    titleKey: "admin.settingsCommerce",
    fields: [
      { key: "commission_pct", labelKey: "admin.setCommissionPct", type: "number" },
      { key: "currency", labelKey: "admin.setCurrency", placeholder: "INR" },
      { key: "terms_url", labelKey: "admin.setTermsUrl", placeholder: "/terms" },
      { key: "privacy_url", labelKey: "admin.setPrivacyUrl", placeholder: "/privacy" },
    ],
  },
  {
    titleKey: "admin.settingsNotices",
    fields: [
      { key: "home_notice_en", labelKey: "admin.setHomeNoticeEn", type: "textarea" },
      { key: "home_notice_hi", labelKey: "admin.setHomeNoticeHi", type: "textarea", hi: true },
      { key: "maintenance_banner_en", labelKey: "admin.setMaintenanceEn", type: "textarea" },
      { key: "maintenance_banner_hi", labelKey: "admin.setMaintenanceHi", type: "textarea", hi: true },
    ],
  },
];

/** Key/value platform settings. Empty values are stored as empty strings. */
export function SettingsForm({ values }: { values: Record<string, string> }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [form, setForm] = useState<Record<string, string>>(values);

  function save() {
    start(async () => {
      const res = await saveSettingsAction(form);
      toast(res.ok ? t("common.saved") : tErr(t, res.error), res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  }

  const launchCity = CITIES.find((c) => c.slug === form.launch_city) ?? null;
  const localMode = !!launchCity && form.launch_city_only === "1";

  return (
    <div className="space-y-4">
      <Panel
        title={t("admin.settingsLaunch")}
        subtitle={t("admin.settingsLaunchHint")}
        icon={<MapPin className="h-4 w-4 text-primary" />}
        actions={localMode ? <Badge tone="success" dot>{t("admin.launchLive", { city: launchCity!.nameEn })}</Badge> : undefined}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("admin.setLaunchCity")}>
            <Select
              value={form.launch_city ?? ""}
              onChange={(e) => setForm({ ...form, launch_city: e.target.value, ...(e.target.value ? {} : { launch_city_only: "0" }) })}
            >
              <option value="">{t("admin.launchNone")}</option>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nameEn} · {c.nameHi} ({c.stateEn})
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex flex-col justify-end gap-1.5 pb-1">
            <Toggle
              checked={localMode}
              disabled={!launchCity}
              onChange={(on) => setForm({ ...form, launch_city_only: on ? "1" : "0" })}
              label={t("admin.setLaunchOnly")}
            />
            <p className="text-xs text-muted">{t("admin.setLaunchOnlyHint")}</p>
          </div>
        </div>
      </Panel>

      {GROUPS.map((g) => (
        <Panel key={g.titleKey} title={t(g.titleKey)}>
          <div className="grid gap-3 sm:grid-cols-2">
            {g.fields.map((f) => (
              <Field key={f.key} label={t(f.labelKey)} className={f.type === "textarea" ? "sm:col-span-2" : undefined}>
                {f.type === "textarea" ? (
                  <Textarea
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    rows={2}
                    lang={f.hi ? "hi" : undefined}
                    className={f.hi ? "font-[var(--font-devanagari)]" : undefined}
                  />
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    lang={f.hi ? "hi" : undefined}
                    className={f.hi ? "font-[var(--font-devanagari)]" : undefined}
                  />
                )}
              </Field>
            ))}
          </div>
        </Panel>
      ))}
      <div className="flex justify-end">
        <Button loading={pending} icon={<Save className="h-4 w-4" />} onClick={save}>
          {t("admin.saveSettings")}
        </Button>
      </div>
    </div>
  );
}
