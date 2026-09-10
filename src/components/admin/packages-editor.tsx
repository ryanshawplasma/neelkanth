"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Checkbox, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";
import { slugify } from "@/lib/utils";
import { ListEditor } from "./list-editor";

export type PackageDraft = {
  id?: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
  price: number;
  compareAtPrice: number | null;
  maxDevotees: number;
  featuresEn: string[];
  featuresHi: string[];
  popular: boolean;
  sortOrder: number;
};

export type AddonDraft = { id?: string; slug: string; nameEn: string; nameHi: string; price: number; imageUrl: string };

export const emptyPackage = (i: number): PackageDraft => ({
  slug: "",
  nameEn: "",
  nameHi: "",
  descriptionEn: "",
  descriptionHi: "",
  price: 0,
  compareAtPrice: null,
  maxDevotees: 1,
  featuresEn: [],
  featuresHi: [],
  popular: false,
  sortOrder: i,
});

export const emptyAddon = (): AddonDraft => ({ slug: "", nameEn: "", nameHi: "", price: 0, imageUrl: "" });

/** Packages (single / couple / family …) with bilingual names and feature lists. */
export function PackagesEditor({ items, onChange }: { items: PackageDraft[]; onChange: (items: PackageDraft[]) => void }) {
  const t = useT();
  const [open, setOpen] = useState<number | null>(0);
  const set = (i: number, patch: Partial<PackageDraft>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="space-y-2">
      {items.map((p, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-2 px-3 py-2">
            <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <span className="truncate text-sm font-semibold">{p.nameEn || t("admin.newPackage")}</span>
              <span className="text-xs text-muted">₹{p.price}</span>
              {p.popular && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-semibold text-[#8a6300]">{t("common.popular")}</span>}
              {open === i ? <ChevronUp className="ml-auto h-4 w-4 text-muted" /> : <ChevronDown className="ml-auto h-4 w-4 text-muted" />}
            </button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="rounded-lg p-1.5 text-danger hover:bg-danger-soft"
              aria-label={t("common.remove")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {open === i && (
            <div className="space-y-3 border-t border-border p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">{t("admin.packageNameEn")}</span>
                  <Input
                    className="h-9 text-sm"
                    value={p.nameEn}
                    onChange={(e) => set(i, { nameEn: e.target.value, slug: p.slug || slugify(e.target.value) })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">{t("admin.packageNameHi")}</span>
                  <Input className="h-9 text-sm font-[var(--font-devanagari)]" lang="hi" value={p.nameHi} onChange={(e) => set(i, { nameHi: e.target.value })} />
                </label>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">{t("admin.descriptionEn")}</span>
                  <Input className="h-9 text-sm" value={p.descriptionEn} onChange={(e) => set(i, { descriptionEn: e.target.value })} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">{t("admin.descriptionHi")}</span>
                  <Input
                    className="h-9 text-sm font-[var(--font-devanagari)]"
                    lang="hi"
                    value={p.descriptionHi}
                    onChange={(e) => set(i, { descriptionHi: e.target.value })}
                  />
                </label>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">{t("admin.slug")}</span>
                  <Input className="h-9 text-sm" value={p.slug} onChange={(e) => set(i, { slug: slugify(e.target.value) })} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">{t("common.price")}</span>
                  <Input className="h-9 text-sm" type="number" min={0} value={p.price} onChange={(e) => set(i, { price: Number(e.target.value) })} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">{t("admin.compareAtPrice")}</span>
                  <Input
                    className="h-9 text-sm"
                    type="number"
                    min={0}
                    value={p.compareAtPrice ?? ""}
                    onChange={(e) => set(i, { compareAtPrice: e.target.value === "" ? null : Number(e.target.value) })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">{t("admin.maxDevotees")}</span>
                  <Input className="h-9 text-sm" type="number" min={1} value={p.maxDevotees} onChange={(e) => set(i, { maxDevotees: Number(e.target.value) })} />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ListEditor label={t("admin.features")} lang="en" items={p.featuresEn} onChange={(v) => set(i, { featuresEn: v })} />
                <ListEditor label={t("admin.features")} lang="hi" items={p.featuresHi} onChange={(v) => set(i, { featuresHi: v })} />
              </div>
              <div className="flex items-center gap-4">
                <Checkbox checked={p.popular} onChange={(e) => set(i, { popular: e.target.checked })} label={t("admin.markPopular")} />
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-xs text-muted">{t("admin.sortOrder")}</span>
                  <Input className="h-9 w-20 text-sm" type="number" value={p.sortOrder} onChange={(e) => set(i, { sortOrder: Number(e.target.value) })} />
                </label>
              </div>
            </div>
          )}
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        icon={<Plus className="h-4 w-4" />}
        onClick={() => {
          onChange([...items, emptyPackage(items.length)]);
          setOpen(items.length);
        }}
      >
        {t("admin.addPackage")}
      </Button>
    </div>
  );
}

/** Optional extras attached to a booking (extra prasad, cloth, garland …). */
export function AddonsEditor({ items, onChange }: { items: AddonDraft[]; onChange: (items: AddonDraft[]) => void }) {
  const t = useT();
  const set = (i: number, patch: Partial<AddonDraft>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-2">
      {items.map((a, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_6rem_1fr_2rem] items-end gap-2">
          <label className="block">
            {i === 0 && <span className="mb-1 block text-xs font-medium text-muted">{t("admin.addonNameEn")}</span>}
            <Input className="h-9 text-sm" value={a.nameEn} onChange={(e) => set(i, { nameEn: e.target.value, slug: a.slug || slugify(e.target.value) })} />
          </label>
          <label className="block">
            {i === 0 && <span className="mb-1 block text-xs font-medium text-muted">{t("admin.addonNameHi")}</span>}
            <Input className="h-9 text-sm font-[var(--font-devanagari)]" lang="hi" value={a.nameHi} onChange={(e) => set(i, { nameHi: e.target.value })} />
          </label>
          <label className="block">
            {i === 0 && <span className="mb-1 block text-xs font-medium text-muted">{t("common.price")}</span>}
            <Input className="h-9 text-sm" type="number" min={0} value={a.price} onChange={(e) => set(i, { price: Number(e.target.value) })} />
          </label>
          <label className="block">
            {i === 0 && <span className="mb-1 block text-xs font-medium text-muted">{t("admin.imageUrl")}</span>}
            <Input className="h-9 text-sm" value={a.imageUrl} onChange={(e) => set(i, { imageUrl: e.target.value })} placeholder="/images/…" />
          </label>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="mb-1 rounded-lg p-1.5 text-danger hover:bg-danger-soft"
            aria-label={t("common.remove")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" icon={<Plus className="h-4 w-4" />} onClick={() => onChange([...items, emptyAddon()])}>
        {t("admin.addAddon")}
      </Button>
    </div>
  );
}
