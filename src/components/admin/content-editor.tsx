"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useT, useLocale } from "@/i18n/client";
import { slugify } from "@/lib/utils";
import { CONTENT_TYPE_LABELS, optionsFrom } from "@/lib/admin/util";
import { deleteContentAction, saveContentAction } from "@/lib/admin/catalog-actions";
import { Panel } from "./page-shell";
import { BilingualField } from "./bilingual-field";
import { ListEditor } from "./list-editor";
import { tErr } from "./action-button";

export type ContentDraft = {
  id?: string;
  slug: string;
  type: string;
  titleEn: string;
  titleHi: string;
  deityEn: string;
  deityHi: string;
  bodyHi: string;
  bodyEn: string;
  audioUrl: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
  active: boolean;
};

export const emptyContent: ContentDraft = {
  slug: "",
  type: "AARTI",
  titleEn: "",
  titleHi: "",
  deityEn: "",
  deityHi: "",
  bodyHi: "",
  bodyEn: "",
  audioUrl: "",
  imageUrl: "",
  tags: [],
  featured: false,
  active: true,
};

/** Aarti / chalisa / mantra authoring, Devanagari first. */
export function ContentEditor({ item }: { item: ContentDraft | null }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [form, setForm] = useState<ContentDraft>(item ?? emptyContent);
  const [confirm, setConfirm] = useState(false);
  const set = <K extends keyof ContentDraft>(k: K, v: ContentDraft[K]) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    start(async () => {
      const res = await saveContentAction({ ...form, type: form.type as Parameters<typeof saveContentAction>[0]["type"] });
      if (!res.ok) {
        toast(tErr(t, res.error), "error");
        return;
      }
      toast(t("common.saved"), "success");
      if (!item?.id && res.id) router.push(`/admin/content/${res.id}`);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Panel
        title={t("admin.tabBasics")}
        actions={
          <>
            {form.slug && (
              <Link href={`/library/${form.slug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-surface-2">
                <ExternalLink className="h-3.5 w-3.5" />
                {t("admin.preview")}
              </Link>
            )}
            {item?.id && (
              <Button size="sm" variant="outline" className="text-danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirm(true)}>
                {t("common.delete")}
              </Button>
            )}
            <Button size="sm" loading={pending} icon={<Save className="h-4 w-4" />} onClick={save} disabled={!form.titleEn || !form.titleHi || !form.bodyHi}>
              {t("common.save")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <BilingualField
            label={t("admin.contentTitle")}
            required
            valueEn={form.titleEn}
            valueHi={form.titleHi}
            onChangeEn={(v) => setForm((f) => ({ ...f, titleEn: v, slug: item?.id ? f.slug : slugify(v) }))}
            onChangeHi={(v) => set("titleHi", v)}
          />
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label={t("admin.slug")} required>
              <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
            </Field>
            <Field label={t("admin.colType")}>
              <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
                {optionsFrom(CONTENT_TYPE_LABELS, locale).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("admin.audioUrl")}>
              <Input value={form.audioUrl} onChange={(e) => set("audioUrl", e.target.value)} placeholder="/audio/…" />
            </Field>
            <Field label={t("admin.imageUrl")}>
              <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="/images/…" />
            </Field>
          </div>
          <BilingualField label={t("admin.deity")} valueEn={form.deityEn} valueHi={form.deityHi} onChangeEn={(v) => set("deityEn", v)} onChangeHi={(v) => set("deityHi", v)} />
        </div>
      </Panel>

      <Panel title={t("admin.contentBody")} subtitle={t("admin.contentBodyHint")}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label={`${t("admin.bodyDevanagari")} (हिं)`} required>
            <Textarea
              value={form.bodyHi}
              onChange={(e) => set("bodyHi", e.target.value)}
              rows={18}
              lang="hi"
              className="font-[var(--font-devanagari)] text-[15px] leading-7"
              placeholder="ॐ जय जगदीश हरे…"
            />
          </Field>
          <Field label={`${t("admin.bodyTranslation")} (EN)`}>
            <Textarea value={form.bodyEn} onChange={(e) => set("bodyEn", e.target.value)} rows={18} className="text-[15px] leading-7" />
          </Field>
        </div>
      </Panel>

      <Panel title={t("admin.tabVisibility")}>
        <div className="space-y-3">
          <ListEditor label={t("admin.tags")} items={form.tags} onChange={(v) => set("tags", v)} placeholder="ganesh" />
          <Checkbox checked={form.featured} onChange={(e) => set("featured", e.target.checked)} label={t("common.featured")} />
          <Checkbox checked={form.active} onChange={(e) => set("active", e.target.checked)} label={t("common.active")} />
          <Button loading={pending} icon={<Save className="h-4 w-4" />} onClick={save} disabled={!form.titleEn || !form.titleHi || !form.bodyHi}>
            {t("common.save")}
          </Button>
        </div>
      </Panel>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t("admin.deleteContent")}
        description={t("admin.deleteContentWarning")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        danger
        loading={pending}
        onConfirm={() =>
          start(async () => {
            if (!item?.id) return;
            const res = await deleteContentAction(item.id);
            if (!res.ok) {
              toast(tErr(t, res.error), "error");
              return;
            }
            toast(t("admin.deleted"), "success");
            router.push("/admin/content");
          })
        }
      />
    </div>
  );
}
