"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { ConfirmDialog, Sheet } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useT, useLocale } from "@/i18n/client";
import { BANNER_PLACEMENTS, HREF_PRESETS } from "@/lib/admin/util";
import { deleteBannerAction, saveBannerAction } from "@/lib/admin/catalog-actions";
import { tErr } from "./action-button";

export type BannerRow = {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string | null;
  subtitleHi: string | null;
  imageUrl: string | null;
  href: string | null;
  placement: string;
  sortOrder: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

type Draft = Omit<BannerRow, "id" | "subtitleEn" | "subtitleHi" | "imageUrl" | "href" | "startsAt" | "endsAt"> & {
  id?: string;
  subtitleEn: string;
  subtitleHi: string;
  imageUrl: string;
  href: string;
  startsAt: string;
  endsAt: string;
};

const empty: Draft = {
  titleEn: "",
  titleHi: "",
  subtitleEn: "",
  subtitleHi: "",
  imageUrl: "",
  href: "",
  placement: "home",
  sortOrder: 0,
  active: true,
  startsAt: "",
  endsAt: "",
};

/** Home / category banner CRUD. */
export function BannersManager({ rows }: { rows: BannerRow[] }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<BannerRow | null>(null);

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setDraft({ ...empty, sortOrder: rows.length })}>
          {t("admin.newBanner")}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)]">
            <div className="aspect-[16/7] bg-surface-2">
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.imageUrl} alt={b.titleEn} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">{t("admin.noImage")}</div>
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold">{locale === "hi" ? b.titleHi : b.titleEn}</p>
              <p className="truncate text-xs text-muted">{(locale === "hi" ? b.subtitleHi : b.subtitleEn) ?? "—"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge tone="primary">{b.placement}</Badge>
                <Badge tone={b.active ? "success" : "muted"}>{b.active ? t("common.active") : t("common.inactive")}</Badge>
                {b.href && <span className="truncate text-xs text-muted">{b.href}</span>}
              </div>
              <div className="mt-2 flex justify-end gap-0.5">
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-primary"
                  aria-label={t("common.edit")}
                  onClick={() =>
                    setDraft({
                      id: b.id,
                      titleEn: b.titleEn,
                      titleHi: b.titleHi,
                      subtitleEn: b.subtitleEn ?? "",
                      subtitleHi: b.subtitleHi ?? "",
                      imageUrl: b.imageUrl ?? "",
                      href: b.href ?? "",
                      placement: b.placement,
                      sortOrder: b.sortOrder,
                      active: b.active,
                      startsAt: b.startsAt ?? "",
                      endsAt: b.endsAt ?? "",
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="rounded-lg p-1.5 text-danger hover:bg-danger-soft" aria-label={t("common.delete")} onClick={() => setToDelete(b)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!rows.length && <p className="col-span-full rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">{t("admin.noBanners")}</p>}
      </div>

      <Sheet open={!!draft} onClose={() => setDraft(null)} side="center" title={draft?.id ? t("admin.editBanner") : t("admin.newBanner")} className="sm:max-w-xl">
        {draft && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={`${t("admin.bannerTitle")} (EN)`} required>
                <Input value={draft.titleEn} onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })} />
              </Field>
              <Field label={`${t("admin.bannerTitle")} (हिं)`} required>
                <Input value={draft.titleHi} onChange={(e) => setDraft({ ...draft, titleHi: e.target.value })} className="font-[var(--font-devanagari)]" lang="hi" />
              </Field>
              <Field label={`${t("admin.subtitle")} (EN)`}>
                <Input value={draft.subtitleEn} onChange={(e) => setDraft({ ...draft, subtitleEn: e.target.value })} />
              </Field>
              <Field label={`${t("admin.subtitle")} (हिं)`}>
                <Input value={draft.subtitleHi} onChange={(e) => setDraft({ ...draft, subtitleHi: e.target.value })} className="font-[var(--font-devanagari)]" lang="hi" />
              </Field>
            </div>
            <Field label={t("admin.imageUrl")}>
              <Input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="/images/banners/…" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("admin.link")}>
                <div className="flex gap-2">
                  <Select className="w-36" value="" onChange={(e) => setDraft({ ...draft, href: e.target.value })} aria-label={t("admin.link")}>
                    <option value="">{t("admin.choosePreset")}</option>
                    {HREF_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label[locale]}
                      </option>
                    ))}
                  </Select>
                  <Input value={draft.href} onChange={(e) => setDraft({ ...draft, href: e.target.value })} placeholder="/poojas" />
                </div>
              </Field>
              <Field label={t("admin.placement")}>
                <Select value={draft.placement} onChange={(e) => setDraft({ ...draft, placement: e.target.value })}>
                  {BANNER_PLACEMENTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t("admin.startsAt")}>
                <Input type="date" value={draft.startsAt} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
              </Field>
              <Field label={t("admin.endsAt")}>
                <Input type="date" value={draft.endsAt} onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })} />
              </Field>
              <Field label={t("admin.sortOrder")}>
                <Input type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} />
              </Field>
            </div>
            <Checkbox checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} label={t("common.active")} />
            <Button
              full
              loading={pending}
              disabled={!draft.titleEn || !draft.titleHi}
              onClick={() =>
                start(async () => {
                  const res = await saveBannerAction(draft);
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
        title={t("admin.deleteBanner")}
        description={toDelete?.titleEn}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        danger
        loading={pending}
        onConfirm={() =>
          start(async () => {
            if (!toDelete) return;
            const res = await deleteBannerAction(toDelete.id);
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
