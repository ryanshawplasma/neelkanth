"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { MultiImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { INDIAN_STATES } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { saveTempleAction } from "@/lib/admin/catalog-actions";
import { Panel } from "./page-shell";
import { BilingualField } from "./bilingual-field";
import { tErr } from "./action-button";

export type TempleDraft = {
  id?: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  deityEn: string;
  deityHi: string;
  city: string;
  state: string;
  descriptionEn: string;
  descriptionHi: string;
  historyEn: string;
  historyHi: string;
  images: string[];
  latitude: number | null;
  longitude: number | null;
  timings: string;
  liveDarshanUrl: string;
  featured: boolean;
  active: boolean;
};

export const emptyTemple: TempleDraft = {
  slug: "",
  nameEn: "",
  nameHi: "",
  deityEn: "",
  deityHi: "",
  city: "",
  state: "Uttar Pradesh",
  descriptionEn: "",
  descriptionHi: "",
  historyEn: "",
  historyHi: "",
  images: [],
  latitude: null,
  longitude: null,
  timings: "",
  liveDarshanUrl: "",
  featured: false,
  active: true,
};

export function TempleEditor({ temple }: { temple: TempleDraft | null }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [form, setForm] = useState<TempleDraft>(temple ?? emptyTemple);
  const [urlInput, setUrlInput] = useState("");
  const set = <K extends keyof TempleDraft>(k: K, v: TempleDraft[K]) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    start(async () => {
      const res = await saveTempleAction(form);
      if (!res.ok) {
        toast(tErr(t, res.error), "error");
        return;
      }
      toast(t("common.saved"), "success");
      if (!temple?.id && res.id) router.push(`/admin/temples/${res.id}`);
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
              <Link href={`/temples/${form.slug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-surface-2">
                <ExternalLink className="h-3.5 w-3.5" />
                {t("admin.preview")}
              </Link>
            )}
            <Button size="sm" loading={pending} icon={<Save className="h-4 w-4" />} onClick={save} disabled={!form.nameEn || !form.nameHi || !form.city}>
              {t("common.save")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <BilingualField
            label={t("admin.templeName")}
            required
            valueEn={form.nameEn}
            valueHi={form.nameHi}
            onChangeEn={(v) => setForm((f) => ({ ...f, nameEn: v, slug: temple?.id ? f.slug : slugify(v) }))}
            onChangeHi={(v) => set("nameHi", v)}
          />
          <BilingualField label={t("admin.deity")} valueEn={form.deityEn} valueHi={form.deityHi} onChangeEn={(v) => set("deityEn", v)} onChangeHi={(v) => set("deityHi", v)} />
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label={t("admin.slug")} required>
              <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
            </Field>
            <Field label={t("common.city")} required>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </Field>
            <Field label={t("common.state")} required>
              <Select value={form.state} onChange={(e) => set("state", e.target.value)}>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("admin.timings")} hint="05:00-12:00, 16:00-21:00">
              <Input value={form.timings} onChange={(e) => set("timings", e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t("admin.latitude")}>
              <Input type="number" step="0.000001" value={form.latitude ?? ""} onChange={(e) => set("latitude", e.target.value === "" ? null : Number(e.target.value))} />
            </Field>
            <Field label={t("admin.longitude")}>
              <Input type="number" step="0.000001" value={form.longitude ?? ""} onChange={(e) => set("longitude", e.target.value === "" ? null : Number(e.target.value))} />
            </Field>
            <Field label={t("admin.liveDarshanUrl")}>
              <Input value={form.liveDarshanUrl} onChange={(e) => set("liveDarshanUrl", e.target.value)} placeholder="https://youtube.com/…" />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title={t("admin.description")}>
        <div className="space-y-4">
          <BilingualField
            label={t("admin.description")}
            textarea
            rows={5}
            valueEn={form.descriptionEn}
            valueHi={form.descriptionHi}
            onChangeEn={(v) => set("descriptionEn", v)}
            onChangeHi={(v) => set("descriptionHi", v)}
          />
          <BilingualField
            label={t("admin.history")}
            textarea
            rows={6}
            valueEn={form.historyEn}
            valueHi={form.historyHi}
            onChangeEn={(v) => set("historyEn", v)}
            onChangeHi={(v) => set("historyHi", v)}
          />
        </div>
      </Panel>

      <Panel title={t("admin.tabMedia")} subtitle={t("admin.mediaHint")}>
        <MultiImageUpload value={form.images} onChange={(v) => set("images", v)} folder="temples" max={8} />
        <div className="mt-3 flex items-end gap-2">
          <Field label={t("admin.pasteImageUrl")} className="flex-1">
            <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="h-9 text-sm" placeholder="/images/temples/…" />
          </Field>
          <Button
            size="sm"
            variant="outline"
            icon={<Plus className="h-4 w-4" />}
            disabled={!urlInput.trim()}
            onClick={() => {
              set("images", [...form.images, urlInput.trim()]);
              setUrlInput("");
            }}
          >
            {t("common.add")}
          </Button>
        </div>
      </Panel>

      <Panel title={t("admin.tabVisibility")}>
        <div className="space-y-3">
          <Checkbox checked={form.active} onChange={(e) => set("active", e.target.checked)} label={t("common.active")} />
          <Checkbox checked={form.featured} onChange={(e) => set("featured", e.target.checked)} label={t("common.featured")} />
          <Button loading={pending} icon={<Save className="h-4 w-4" />} onClick={save} disabled={!form.nameEn || !form.nameHi || !form.city}>
            {t("common.save")}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
