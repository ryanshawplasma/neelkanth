"use client";

import { useState, useTransition } from "react";
import { Flower2 } from "lucide-react";
import { Toggle, Input, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useLocale, useLoc, useT } from "@/i18n/client";
import { SERVICE_TYPES, pickBi } from "@/lib/constants";
import { formatINR } from "@/lib/utils";
import { setServicePriceAction, toggleServiceAction } from "@/lib/pandit/service-actions";
import { Panel } from "./common";

export type CatalogService = {
  id: string;
  type: string;
  nameEn: string;
  nameHi: string;
  taglineEn: string | null;
  taglineHi: string | null;
  basePrice: number;
  durationMin: number | null;
  temple: { nameEn: string; nameHi: string } | null;
};

export type OfferedRow = { serviceId: string; price: number | null; active: boolean };

export function ServicesClient({ services, offered }: { services: CatalogService[]; offered: OfferedRow[] }) {
  const t = useT();
  const locale = useLocale();
  const loc = useLoc();
  const { toast } = useToast();
  const [rows, setRows] = useState<Record<string, { on: boolean; price: string }>>(() => {
    const out: Record<string, { on: boolean; price: string }> = {};
    for (const s of services) {
      const row = offered.find((o) => o.serviceId === s.id);
      out[s.id] = { on: !!row?.active, price: row?.price ? String(row.price) : "" };
    }
    return out;
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();

  const selected = Object.values(rows).filter((r) => r.on).length;

  async function toggle(id: string, on: boolean) {
    setError(null);
    setRows((r) => ({ ...r, [id]: { ...r[id], on } }));
    const res = await toggleServiceAction(id, on);
    if (!res.ok) {
      setRows((r) => ({ ...r, [id]: { ...r[id], on: !on } }));
      return setError(t(res.error));
    }
    toast(t(on ? "pandit.serviceAdded" : "pandit.serviceRemoved"));
    start(() => {});
  }

  async function savePrice(id: string) {
    setError(null);
    setBusy(id);
    const raw = rows[id]?.price?.trim();
    const res = await setServicePriceAction(id, raw ? Number(raw) : null);
    setBusy(null);
    if (!res.ok) return setError(t(res.error));
    toast(t("pandit.priceSaved"));
  }

  if (!services.length) return <EmptyState icon={<Flower2 className="h-6 w-6" />} title={t("pandit.noServices")} hint={t("pandit.noServicesHint")} />;

  const groups = SERVICE_TYPES.filter((st) => services.some((s) => s.type === st.value));

  return (
    <div className="space-y-4 px-4 pb-8">
      <p className="rounded-xl bg-primary-soft px-3 py-2 text-sm font-medium text-primary-700">
        {t("pandit.servicesSelected", { n: selected, total: services.length })}
      </p>
      {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      {groups.map((g) => (
        <Panel key={g.value} title={pickBi(g.label, locale)}>
          <ul className="space-y-2.5">
            {services
              .filter((s) => s.type === g.value)
              .map((s) => {
                const state = rows[s.id];
                return (
                  <li key={s.id} className="rounded-2xl border border-border p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold leading-tight">{loc(s, "name")}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{loc(s, "tagline")}</p>
                        <p className="mt-1 text-xs text-muted">
                          {t("pandit.catalogPrice")}: <span className="font-semibold text-foreground">{formatINR(s.basePrice, locale)}</span>
                          {s.durationMin ? ` · ${s.durationMin} ${t("common.minutes")}` : ""}
                          {s.temple ? ` · ${loc(s.temple, "name")}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <Toggle checked={state?.on ?? false} onChange={(v) => void toggle(s.id, v)} />
                      </div>
                    </div>
                    {state?.on && (
                      <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-end">
                        <Field className="flex-1" label={t("pandit.customPrice")} hint={t("pandit.customPriceHint")}>
                          <Input
                            value={state.price}
                            inputMode="numeric"
                            placeholder={String(s.basePrice)}
                            onChange={(e) => setRows((r) => ({ ...r, [s.id]: { ...r[s.id], price: e.target.value.replace(/\D/g, "").slice(0, 7) } }))}
                          />
                        </Field>
                        <Button size="sm" variant="outline" className="shrink-0" loading={busy === s.id} onClick={() => void savePrice(s.id)}>
                          {t("common.save")}
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </Panel>
      ))}
      <p className="text-center text-xs text-muted">{t("pandit.servicesSubtitle")}</p>
    </div>
  );
}
