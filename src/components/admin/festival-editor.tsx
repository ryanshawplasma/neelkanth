"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Eye, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { ConfirmDialog } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useT, useLocale } from "@/i18n/client";
import { FESTIVAL_TYPES, pickBi } from "@/lib/constants";
import { formatDate, slugify } from "@/lib/utils";
import { REMIND_OFFSETS } from "@/lib/admin/util";
import { saveFestivalAction, sendFestivalReminderNowAction } from "@/lib/admin/catalog-actions";
import { Panel } from "./page-shell";
import { BilingualField } from "./bilingual-field";
import { ListEditor } from "./list-editor";
import { tErr } from "./action-button";

export type FestivalDraft = {
  id?: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  type: string;
  date: string;
  endDate: string;
  deityEn: string;
  deityHi: string;
  descriptionEn: string;
  descriptionHi: string;
  significanceEn: string;
  significanceHi: string;
  ritualsEn: string[];
  ritualsHi: string[];
  imageUrl: string;
  major: boolean;
  remindDaysBefore: number[];
  pushEnabled: boolean;
  active: boolean;
};

export const emptyFestival: FestivalDraft = {
  slug: "",
  nameEn: "",
  nameHi: "",
  type: "FESTIVAL",
  date: "",
  endDate: "",
  deityEn: "",
  deityHi: "",
  descriptionEn: "",
  descriptionHi: "",
  significanceEn: "",
  significanceHi: "",
  ritualsEn: [],
  ritualsHi: [],
  imageUrl: "",
  major: false,
  remindDaysBefore: [7, 3, 1, 0],
  pushEnabled: true,
  active: true,
};

export function FestivalEditor({ festival, linkedServices }: { festival: FestivalDraft | null; linkedServices: { id: string; name: string; slug: string }[] }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [form, setForm] = useState<FestivalDraft>(festival ?? emptyFestival);
  const [preview, setPreview] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const set = <K extends keyof FestivalDraft>(k: K, v: FestivalDraft[K]) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    start(async () => {
      const res = await saveFestivalAction({ ...form, type: form.type as Parameters<typeof saveFestivalAction>[0]["type"] });
      if (!res.ok) {
        toast(tErr(t, res.error), "error");
        return;
      }
      toast(t("common.saved"), "success");
      if (!festival?.id && res.id) router.push(`/admin/festivals/${res.id}`);
      else router.refresh();
    });
  }

  const title = locale === "hi" ? form.nameHi : form.nameEn;
  const body = linkedServices[0]
    ? locale === "hi"
      ? `${linkedServices[0].name} पहले से बुक करें।`
      : `Book ${linkedServices[0].name} in advance.`
    : locale === "hi"
      ? form.descriptionHi
      : form.descriptionEn;

  return (
    <div className="space-y-4">
      <Panel
        title={t("admin.tabBasics")}
        actions={
          <Button size="sm" loading={pending} icon={<Save className="h-4 w-4" />} onClick={save} disabled={!form.nameEn || !form.nameHi || !form.date}>
            {t("common.save")}
          </Button>
        }
      >
        <div className="space-y-4">
          <BilingualField
            label={t("admin.festivalName")}
            required
            valueEn={form.nameEn}
            valueHi={form.nameHi}
            onChangeEn={(v) => setForm((f) => ({ ...f, nameEn: v, slug: festival?.id ? f.slug : slugify(v) }))}
            onChangeHi={(v) => set("nameHi", v)}
          />
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label={t("admin.slug")} required>
              <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
            </Field>
            <Field label={t("admin.colType")}>
              <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
                {FESTIVAL_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {pickBi(f.label, locale)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("common.date")} required>
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label={t("admin.endDate")}>
              <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </Field>
          </div>
          <BilingualField label={t("admin.deity")} valueEn={form.deityEn} valueHi={form.deityHi} onChangeEn={(v) => set("deityEn", v)} onChangeHi={(v) => set("deityHi", v)} />
        </div>
      </Panel>

      <Panel title={t("admin.description")}>
        <div className="space-y-4">
          <BilingualField
            label={t("admin.description")}
            textarea
            rows={4}
            valueEn={form.descriptionEn}
            valueHi={form.descriptionHi}
            onChangeEn={(v) => set("descriptionEn", v)}
            onChangeHi={(v) => set("descriptionHi", v)}
          />
          <BilingualField
            label={t("admin.significance")}
            textarea
            rows={4}
            valueEn={form.significanceEn}
            valueHi={form.significanceHi}
            onChangeEn={(v) => set("significanceEn", v)}
            onChangeHi={(v) => set("significanceHi", v)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <ListEditor label={t("admin.rituals")} lang="en" items={form.ritualsEn} onChange={(v) => set("ritualsEn", v)} />
            <ListEditor label={t("admin.rituals")} lang="hi" items={form.ritualsHi} onChange={(v) => set("ritualsHi", v)} />
          </div>
        </div>
      </Panel>

      <Panel title={t("admin.reminders")} subtitle={t("admin.remindersHint")}>
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-medium">{t("admin.remindDaysBefore")}</p>
            <div className="flex flex-wrap gap-2">
              {REMIND_OFFSETS.map((n) => {
                const on = form.remindDaysBefore.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set("remindDaysBefore", on ? form.remindDaysBefore.filter((x) => x !== n) : [...form.remindDaysBefore, n])}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                      on ? "border-primary bg-primary-soft font-medium text-primary-700" : "border-border bg-surface hover:bg-surface-2"
                    }`}
                  >
                    {n === 0 ? t("admin.onTheDay") : t("admin.daysBefore", { n })}
                  </button>
                );
              })}
            </div>
          </div>
          <Checkbox checked={form.pushEnabled} onChange={(e) => set("pushEnabled", e.target.checked)} label={t("admin.pushEnabled")} />

          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <Button size="sm" variant="outline" icon={<Eye className="h-4 w-4" />} onClick={() => setPreview((p) => !p)}>
              {t("admin.previewNotification")}
            </Button>
            {festival?.id && (
              <Button size="sm" variant="secondary" icon={<Send className="h-4 w-4" />} onClick={() => setConfirmSend(true)}>
                {t("admin.sendReminderNow")}
              </Button>
            )}
          </div>

          {preview && (
            <div className="rounded-2xl border border-border bg-surface-2 p-3">
              <div className="flex items-start gap-3 rounded-xl bg-surface p-3 shadow-sm">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg gradient-kesari text-white">🪔</span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {title || t("admin.festivalName")} · {form.date ? formatDate(form.date, locale) : "—"} 🪔
                  </p>
                  <p className="line-clamp-2 text-xs text-muted">{body || "—"}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted">
                {t("admin.previewAudience")} · {linkedServices[0] ? `/pooja/${linkedServices[0].slug}` : `/festivals/${form.slug}`}
              </p>
            </div>
          )}
        </div>
      </Panel>

      <Panel title={t("admin.tabMedia")}>
        <div className="grid gap-4 sm:grid-cols-[16rem_1fr]">
          <ImageUpload value={form.imageUrl} onChange={(url) => set("imageUrl", url ?? "")} folder="festivals" label={t("admin.festivalImage")} />
          <div className="space-y-3">
            <Field label={t("admin.pasteImageUrl")}>
              <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="/images/festivals/…" />
            </Field>
            <div className="space-y-2">
              <Checkbox checked={form.major} onChange={(e) => set("major", e.target.checked)} label={t("admin.majorFestival")} />
              <Checkbox checked={form.active} onChange={(e) => set("active", e.target.checked)} label={t("common.active")} />
            </div>
            {linkedServices.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{t("admin.linkedServices")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {linkedServices.map((s) => (
                    <Badge key={s.id} tone="primary">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Button loading={pending} icon={<Save className="h-4 w-4" />} onClick={save} disabled={!form.nameEn || !form.nameHi || !form.date}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmSend}
        onClose={() => setConfirmSend(false)}
        title={t("admin.sendReminderNow")}
        description={t("admin.sendReminderWarning")}
        confirmLabel={t("admin.send")}
        cancelLabel={t("common.cancel")}
        loading={pending}
        onConfirm={() =>
          start(async () => {
            if (!festival?.id) return;
            const res = await sendFestivalReminderNowAction(festival.id);
            if (!res.ok) {
              toast(tErr(t, res.error), "error");
              return;
            }
            toast(t("admin.remindersSent", { n: res.count ?? 0 }), "success");
            setConfirmSend(false);
            router.refresh();
          })
        }
      />
    </div>
  );
}

/** Small "send reminder" button used from the festivals list. */
export function SendFestivalReminderButton({ festivalId }: { festivalId: string }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-primary"
        aria-label={t("admin.sendReminderNow")}
        title={t("admin.sendReminderNow")}
      >
        <Bell className="h-3.5 w-3.5" />
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("admin.sendReminderNow")}
        description={t("admin.sendReminderWarning")}
        confirmLabel={t("admin.send")}
        cancelLabel={t("common.cancel")}
        loading={pending}
        onConfirm={() =>
          start(async () => {
            const res = await sendFestivalReminderNowAction(festivalId);
            if (!res.ok) {
              toast(tErr(t, res.error), "error");
              return;
            }
            toast(t("admin.remindersSent", { n: res.count ?? 0 }), "success");
            setOpen(false);
            router.refresh();
          })
        }
      />
    </>
  );
}
