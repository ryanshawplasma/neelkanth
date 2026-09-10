"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { ConfirmDialog, Sheet } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useT, useLocale } from "@/i18n/client";
import { formatINR } from "@/lib/utils";
import { deleteCouponAction, saveCouponAction } from "@/lib/admin/catalog-actions";
import { tErr } from "./action-button";

export type CouponRow = {
  id: string;
  code: string;
  descriptionEn: string | null;
  descriptionHi: string | null;
  discountPct: number | null;
  discountFlat: number | null;
  minAmount: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string | null;
  validTo: string | null;
  active: boolean;
  usage: { count: number; discount: number };
};

type Draft = {
  id?: string;
  code: string;
  descriptionEn: string;
  descriptionHi: string;
  discountPct: number | null;
  discountFlat: number | null;
  minAmount: number;
  maxUses: number | null;
  validFrom: string;
  validTo: string;
  active: boolean;
};

const empty: Draft = {
  code: "",
  descriptionEn: "",
  descriptionHi: "",
  discountPct: 10,
  discountFlat: null,
  minAmount: 0,
  maxUses: null,
  validFrom: "",
  validTo: "",
  active: true,
};

/** Coupon CRUD with live usage counts. */
export function CouponsManager({ rows }: { rows: CouponRow[] }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<CouponRow | null>(null);

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setDraft(empty)}>
          {t("admin.newCoupon")}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)]">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2.5 text-left">{t("admin.code")}</th>
              <th className="px-3 py-2.5 text-left">{t("common.discount")}</th>
              <th className="px-3 py-2.5 text-right">{t("admin.minAmount")}</th>
              <th className="px-3 py-2.5 text-left">{t("admin.validity")}</th>
              <th className="px-3 py-2.5 text-right">{t("admin.used")}</th>
              <th className="px-3 py-2.5 text-right">{t("admin.discountGiven")}</th>
              <th className="px-3 py-2.5 text-left">{t("common.status")}</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-border/70 hover:bg-surface-2/50">
                <td className="px-3 py-2">
                  <p className="font-mono font-semibold">{c.code}</p>
                  <p className="text-xs text-muted">{(locale === "hi" ? c.descriptionHi : c.descriptionEn) ?? "—"}</p>
                </td>
                <td className="px-3 py-2">{c.discountPct ? `${c.discountPct}%` : c.discountFlat ? formatINR(c.discountFlat, locale) : "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{c.minAmount ? formatINR(c.minAmount, locale) : "—"}</td>
                <td className="px-3 py-2 text-xs text-muted">{[c.validFrom, c.validTo].filter(Boolean).join(" → ") || "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {c.usage.count}
                  {c.maxUses ? <span className="text-muted"> / {c.maxUses}</span> : null}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{formatINR(c.usage.discount, locale)}</td>
                <td className="px-3 py-2">
                  <Badge tone={c.active ? "success" : "muted"}>{c.active ? t("common.active") : t("common.inactive")}</Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-0.5">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-primary"
                      aria-label={t("common.edit")}
                      onClick={() =>
                        setDraft({
                          id: c.id,
                          code: c.code,
                          descriptionEn: c.descriptionEn ?? "",
                          descriptionHi: c.descriptionHi ?? "",
                          discountPct: c.discountPct,
                          discountFlat: c.discountFlat,
                          minAmount: c.minAmount,
                          maxUses: c.maxUses,
                          validFrom: c.validFrom ?? "",
                          validTo: c.validTo ?? "",
                          active: c.active,
                        })
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" className="rounded-lg p-1.5 text-danger hover:bg-danger-soft" aria-label={t("common.delete")} onClick={() => setToDelete(c)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-sm text-muted">
                  {t("admin.noCoupons")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={!!draft} onClose={() => setDraft(null)} side="center" title={draft?.id ? t("admin.editCoupon") : t("admin.newCoupon")}>
        {draft && (
          <div className="space-y-3">
            <Field label={t("admin.code")} required hint={t("admin.codeHint")}>
              <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} className="font-mono" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={`${t("admin.description")} (EN)`}>
                <Input value={draft.descriptionEn} onChange={(e) => setDraft({ ...draft, descriptionEn: e.target.value })} />
              </Field>
              <Field label={`${t("admin.description")} (हिं)`}>
                <Input value={draft.descriptionHi} onChange={(e) => setDraft({ ...draft, descriptionHi: e.target.value })} className="font-[var(--font-devanagari)]" lang="hi" />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label={t("admin.discountPct")}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.discountPct ?? ""}
                  onChange={(e) => setDraft({ ...draft, discountPct: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </Field>
              <Field label={t("admin.discountFlat")}>
                <Input
                  type="number"
                  min={0}
                  value={draft.discountFlat ?? ""}
                  onChange={(e) => setDraft({ ...draft, discountFlat: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </Field>
              <Field label={t("admin.minAmount")}>
                <Input type="number" min={0} value={draft.minAmount} onChange={(e) => setDraft({ ...draft, minAmount: Number(e.target.value) })} />
              </Field>
              <Field label={t("admin.maxUses")}>
                <Input
                  type="number"
                  min={0}
                  value={draft.maxUses ?? ""}
                  onChange={(e) => setDraft({ ...draft, maxUses: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("admin.validFrom")}>
                <Input type="date" value={draft.validFrom} onChange={(e) => setDraft({ ...draft, validFrom: e.target.value })} />
              </Field>
              <Field label={t("admin.validTo")}>
                <Input type="date" value={draft.validTo} onChange={(e) => setDraft({ ...draft, validTo: e.target.value })} />
              </Field>
            </div>
            <Checkbox checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} label={t("common.active")} />
            <Button
              full
              loading={pending}
              disabled={draft.code.trim().length < 3}
              onClick={() =>
                start(async () => {
                  const res = await saveCouponAction(draft);
                  if (!res.ok) {
                    toast(tErr(t, res.error), "error");
                    return;
                  }
                  toast(t("common.saved"), "success");
                  setDraft(null);
                  router.refresh();
                })
              }
            >
              {t("common.save")}
            </Button>
          </div>
        )}
      </Sheet>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={t("admin.deleteCoupon")}
        description={toDelete?.code}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        danger
        loading={pending}
        onConfirm={() =>
          start(async () => {
            if (!toDelete) return;
            const res = await deleteCouponAction(toDelete.id);
            if (!res.ok) {
              toast(tErr(t, res.error), "error");
              return;
            }
            toast(t("admin.deleted"), "success");
            setToDelete(null);
            router.refresh();
          })
        }
      />
    </>
  );
}
