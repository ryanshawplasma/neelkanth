"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Checkbox } from "@/components/ui/input";
import { Sheet, ConfirmDialog } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useT, useLocale } from "@/i18n/client";
import { SERVICE_TYPES, pickBi } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/admin/catalog-actions";
import { tErr } from "./action-button";
import { Thumb } from "./data-table";

export type CategoryRow = {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  icon: string | null;
  imageUrl: string | null;
  type: string | null;
  sortOrder: number;
  active: boolean;
  services: number;
};

type Draft = {
  id?: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  icon: string;
  imageUrl: string;
  type: string;
  sortOrder: number;
  active: boolean;
};

const empty: Draft = { slug: "", nameEn: "", nameHi: "", icon: "", imageUrl: "", type: "", sortOrder: 0, active: true };

/** Inline CRUD for catalog categories. */
export function CategoriesManager({ rows }: { rows: CategoryRow[] }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<CategoryRow | null>(null);

  function save() {
    if (!draft) return;
    start(async () => {
      const res = await saveCategoryAction({ ...draft, type: draft.type as Parameters<typeof saveCategoryAction>[0]["type"] });
      if (!res.ok) {
        toast(tErr(t, res.error), "error");
        return;
      }
      toast(t("common.saved"), "success");
      setDraft(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setDraft({ ...empty, sortOrder: rows.length })}>
          {t("admin.newCategory")}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)]">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2.5 text-left">{t("admin.category")}</th>
              <th className="px-3 py-2.5 text-left">{t("admin.slug")}</th>
              <th className="px-3 py-2.5 text-left">{t("admin.colType")}</th>
              <th className="px-3 py-2.5 text-right">{t("admin.colServices")}</th>
              <th className="px-3 py-2.5 text-right">{t("admin.sortOrder")}</th>
              <th className="px-3 py-2.5 text-left">{t("common.status")}</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-border/70 hover:bg-surface-2/50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <Thumb src={c.imageUrl} alt={c.nameEn} size={32} />
                    <div>
                      <p className="font-medium">{locale === "hi" ? c.nameHi : c.nameEn}</p>
                      <p className="text-xs text-muted">{locale === "hi" ? c.nameEn : c.nameHi}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-muted">{c.slug}</td>
                <td className="px-3 py-2 text-xs">{c.type ? pickBi(SERVICE_TYPES.find((s) => s.value === c.type)?.label, locale) : "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{c.services}</td>
                <td className="px-3 py-2 text-right tabular-nums">{c.sortOrder}</td>
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
                          slug: c.slug,
                          nameEn: c.nameEn,
                          nameHi: c.nameHi,
                          icon: c.icon ?? "",
                          imageUrl: c.imageUrl ?? "",
                          type: c.type ?? "",
                          sortOrder: c.sortOrder,
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
                <td colSpan={7} className="px-3 py-10 text-center text-sm text-muted">
                  {t("admin.noCategories")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={!!draft} onClose={() => setDraft(null)} side="center" title={draft?.id ? t("admin.editCategory") : t("admin.newCategory")}>
        {draft && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={`${t("admin.name")} (EN)`} required>
                <Input value={draft.nameEn} onChange={(e) => setDraft({ ...draft, nameEn: e.target.value, slug: draft.id ? draft.slug : slugify(e.target.value) })} />
              </Field>
              <Field label={`${t("admin.name")} (हिं)`} required>
                <Input value={draft.nameHi} onChange={(e) => setDraft({ ...draft, nameHi: e.target.value })} className="font-[var(--font-devanagari)]" lang="hi" />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("admin.slug")} required>
                <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} />
              </Field>
              <Field label={t("admin.colType")}>
                <Select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                  <option value="">{t("admin.none")}</option>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {pickBi(s.label, locale)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t("admin.icon")} hint={t("admin.iconHint")}>
                <Input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} placeholder="🕉️" />
              </Field>
              <Field label={t("admin.imageUrl")}>
                <Input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="/images/categories/…" />
              </Field>
              <Field label={t("admin.sortOrder")}>
                <Input type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} />
              </Field>
            </div>
            <Checkbox checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} label={t("common.active")} />
            <Button full loading={pending} disabled={!draft.nameEn || !draft.nameHi} onClick={save}>
              {t("common.save")}
            </Button>
          </div>
        )}
      </Sheet>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={t("admin.deleteCategory")}
        description={toDelete ? t("admin.deleteCategoryWarning", { name: toDelete.nameEn }) : ""}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        danger
        loading={pending}
        onConfirm={() =>
          start(async () => {
            if (!toDelete) return;
            const res = await deleteCategoryAction(toDelete.id);
            if (!res.ok) {
              toast(tErr(t, res.error), "error");
              setToDelete(null);
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
