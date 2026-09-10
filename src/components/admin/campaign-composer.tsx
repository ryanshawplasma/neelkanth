"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useT, useLocale } from "@/i18n/client";
import { AUDIENCE_LABELS, HREF_PRESETS, optionsFrom, toLocalInput } from "@/lib/admin/util";
import { createCampaignAction } from "@/lib/admin/notification-actions";
import { tErr } from "./action-button";

export function CampaignComposer({ counts, cities }: { counts: Record<string, number>; cities: string[] }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [audience, setAudience] = useState("ALL");
  const [city, setCity] = useState(cities[0] ?? "");
  const [form, setForm] = useState({
    titleEn: "",
    titleHi: "",
    bodyEn: "",
    bodyHi: "",
    href: "",
    imageUrl: "",
    scheduledAt: toLocalInput(new Date(Date.now() + 3600_000)),
  });

  const audienceValue = audience === "CITY" ? `CITY:${city}` : audience;
  const reach = audience === "CITY" ? undefined : counts[audience];

  function submit(mode: "now" | "schedule" | "draft") {
    start(async () => {
      const res = await createCampaignAction({ ...form, audience: audienceValue, mode });
      if (!res.ok) {
        toast(tErr(t, res.error), "error");
        return;
      }
      toast(mode === "now" ? t("admin.campaignSent", { n: res.count ?? 0 }) : mode === "schedule" ? t("admin.campaignScheduled") : t("admin.campaignSaved"), "success");
      setForm({ ...form, titleEn: "", titleHi: "", bodyEn: "", bodyHi: "" });
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={`${t("admin.notifTitle")} (EN)`} required>
          <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Shivratri poojas are open" />
        </Field>
        <Field label={`${t("admin.notifTitle")} (हिं)`} required>
          <Input
            value={form.titleHi}
            onChange={(e) => setForm({ ...form, titleHi: e.target.value })}
            className="font-[var(--font-devanagari)]"
            lang="hi"
            placeholder="शिवरात्रि पूजा बुकिंग शुरू"
          />
        </Field>
        <Field label={`${t("admin.notifBody")} (EN)`}>
          <Textarea value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} rows={3} />
        </Field>
        <Field label={`${t("admin.notifBody")} (हिं)`}>
          <Textarea value={form.bodyHi} onChange={(e) => setForm({ ...form, bodyHi: e.target.value })} rows={3} className="font-[var(--font-devanagari)]" lang="hi" />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t("admin.notifLink")}>
          <div className="flex gap-2">
            <Select className="w-36" value="" onChange={(e) => setForm({ ...form, href: e.target.value })} aria-label={t("admin.notifLink")}>
              <option value="">{t("admin.choosePreset")}</option>
              {HREF_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label[locale]}
                </option>
              ))}
            </Select>
            <Input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="/poojas" />
          </div>
        </Field>
        <Field label={t("admin.imageUrl")}>
          <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/images/…" />
        </Field>
        <Field label={t("admin.audience")} hint={reach !== undefined ? t("admin.audienceReach", { n: reach }) : undefined}>
          <div className="flex gap-2">
            <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
              {optionsFrom(AUDIENCE_LABELS, locale).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            {audience === "CITY" && (
              <Select value={city} onChange={(e) => setCity(e.target.value)} aria-label={t("common.city")}>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                {!cities.length && <option value="">—</option>}
              </Select>
            )}
          </div>
        </Field>
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <Field label={t("admin.scheduleAt")}>
          <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="h-10" />
        </Field>
        <Button variant="outline" icon={<CalendarClock className="h-4 w-4" />} loading={pending} disabled={!form.titleEn || !form.titleHi} onClick={() => submit("schedule")}>
          {t("admin.schedule")}
        </Button>
        <Button icon={<Send className="h-4 w-4" />} loading={pending} disabled={!form.titleEn || !form.titleHi} onClick={() => submit("now")}>
          {t("admin.sendNow")}
        </Button>
        <Button variant="ghost" loading={pending} disabled={!form.titleEn || !form.titleHi} onClick={() => submit("draft")}>
          {t("admin.saveDraft")}
        </Button>
      </div>
    </div>
  );
}
