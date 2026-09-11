"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Checkbox } from "@/components/ui/input";
import { MultiImageUpload } from "@/components/ui/image-upload";
import { Tabs } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useT, useLocale } from "@/i18n/client";
import { SERVICE_TYPES, pickBi } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { saveServiceAction, type ServiceInput } from "@/lib/admin/service-actions";
import { Panel } from "./page-shell";
import { BilingualField } from "./bilingual-field";
import { ListEditor } from "./list-editor";
import { FaqEditor, type Faq } from "./faq-editor";
import { AddonsEditor, PackagesEditor, type AddonDraft, type PackageDraft } from "./packages-editor";
import { tErr } from "./action-button";

export type ServiceEditorProps = {
  service: (ServiceInput & { id: string; realBookings: number }) | null;
  categories: { id: string; nameEn: string; nameHi: string }[];
  temples: { id: string; nameEn: string; nameHi: string; city: string }[];
  festivals: { id: string; nameEn: string; nameHi: string; date: string }[];
};

type TabKey = "basics" | "content" | "media" | "pricing" | "schedule" | "visibility";

const emptyForm: ServiceInput = {
  slug: "",
  type: "ONLINE_POOJA",
  nameEn: "",
  nameHi: "",
  taglineEn: "",
  taglineHi: "",
  descriptionEn: "",
  descriptionHi: "",
  benefitsEn: [],
  benefitsHi: [],
  processEn: [],
  processHi: [],
  faqEn: [],
  faqHi: [],
  deityEn: "",
  deityHi: "",
  images: [],
  basePrice: 501,
  compareAtPrice: null,
  durationMin: 60,
  categoryId: "",
  templeId: "",
  festivalId: "",
  availableFrom: "",
  availableTo: "",
  nextDate: "",
  slots: [],
  tags: [],
  featured: false,
  trending: false,
  active: true,
  requiresPandit: true,
  ratingAvg: 4.8,
  ratingCount: 0,
  bookingCount: 0,
  sortOrder: 0,
  packages: [],
  addons: [],
};

/** Full service authoring surface: basics, content, media, pricing, schedule, visibility. */
export function ServiceEditor({ service, categories, temples, festivals }: ServiceEditorProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [tab, setTab] = useState<TabKey>("basics");
  const [slugTouched, setSlugTouched] = useState(!!service);
  const [urlInput, setUrlInput] = useState("");

  const [form, setForm] = useState<ServiceInput>(() => (service ? { ...emptyForm, ...service } : emptyForm));

  const set = <K extends keyof ServiceInput>(key: K, value: ServiceInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const packages = (form.packages ?? []) as PackageDraft[];
  const addons = (form.addons ?? []) as AddonDraft[];
  const images = (form.images ?? []) as string[];

  const tabs = useMemo(
    () =>
      [
        { value: "basics" as const, label: t("admin.tabBasics") },
        { value: "content" as const, label: t("admin.tabContent") },
        { value: "media" as const, label: t("admin.tabMedia"), count: images.length },
        { value: "pricing" as const, label: t("admin.tabPricing"), count: packages.length },
        { value: "schedule" as const, label: t("admin.tabSchedule") },
        { value: "visibility" as const, label: t("admin.tabVisibility") },
      ],
    [t, images.length, packages.length],
  );

  function save() {
    start(async () => {
      const res = await saveServiceAction({ ...form, id: service?.id });
      if (!res.ok) {
        toast(tErr(t, res.error), "error");
        return;
      }
      toast(t("common.saved"), "success");
      if (!service && res.id) router.push(`/admin/services/${res.id}`);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur lg:-mx-6 lg:px-6">
        <Tabs tabs={tabs} value={tab} onChange={(v) => setTab(v)} className="flex-1 border-0" />
        {form.slug && (
          <Link
            href={`/pooja/${form.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-surface-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("admin.preview")}
          </Link>
        )}
        <Button size="sm" loading={pending} icon={<Save className="h-4 w-4" />} onClick={save} disabled={!form.nameEn || !form.nameHi}>
          {t("common.save")}
        </Button>
      </div>

      {tab === "basics" && (
        <Panel title={t("admin.tabBasics")}>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t("admin.colType")} required>
                <Select value={form.type} onChange={(e) => set("type", e.target.value as ServiceInput["type"])}>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {pickBi(s.label, locale)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("admin.category")}>
                <Select value={form.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value)}>
                  <option value="">{t("admin.none")}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {locale === "hi" ? c.nameHi : c.nameEn}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("common.temples")}>
                <Select value={form.templeId ?? ""} onChange={(e) => set("templeId", e.target.value)}>
                  <option value="">{t("admin.none")}</option>
                  {temples.map((x) => (
                    <option key={x.id} value={x.id}>
                      {(locale === "hi" ? x.nameHi : x.nameEn) + ` · ${x.city}`}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <BilingualField
              label={t("admin.serviceName")}
              required
              valueEn={form.nameEn}
              valueHi={form.nameHi}
              onChangeEn={(v) => {
                setForm((f) => ({ ...f, nameEn: v, slug: slugTouched ? f.slug : slugify(v) }));
              }}
              onChangeHi={(v) => set("nameHi", v)}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("admin.slug")} hint={t("admin.slugHint")} required>
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label={t("admin.festival")}>
                <Select value={form.festivalId ?? ""} onChange={(e) => set("festivalId", e.target.value)}>
                  <option value="">{t("admin.none")}</option>
                  {festivals.map((f) => (
                    <option key={f.id} value={f.id}>
                      {(locale === "hi" ? f.nameHi : f.nameEn) + ` · ${f.date}`}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <BilingualField
              label={t("admin.tagline")}
              valueEn={form.taglineEn ?? ""}
              valueHi={form.taglineHi ?? ""}
              onChangeEn={(v) => set("taglineEn", v)}
              onChangeHi={(v) => set("taglineHi", v)}
            />
            <BilingualField
              label={t("admin.deity")}
              valueEn={form.deityEn ?? ""}
              valueHi={form.deityHi ?? ""}
              onChangeEn={(v) => set("deityEn", v)}
              onChangeHi={(v) => set("deityHi", v)}
            />
            <ListEditor label={t("admin.tags")} items={(form.tags ?? []) as string[]} onChange={(v) => set("tags", v)} placeholder="rudrabhishek" />
          </div>
        </Panel>
      )}

      {tab === "content" && (
        <div className="space-y-4">
          <Panel title={t("admin.description")}>
            <BilingualField
              label={t("admin.description")}
              textarea
              rows={6}
              valueEn={form.descriptionEn ?? ""}
              valueHi={form.descriptionHi ?? ""}
              onChangeEn={(v) => set("descriptionEn", v)}
              onChangeHi={(v) => set("descriptionHi", v)}
            />
          </Panel>
          <Panel title={t("admin.benefits")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <ListEditor label={t("admin.benefits")} lang="en" items={(form.benefitsEn ?? []) as string[]} onChange={(v) => set("benefitsEn", v)} />
              <ListEditor label={t("admin.benefits")} lang="hi" items={(form.benefitsHi ?? []) as string[]} onChange={(v) => set("benefitsHi", v)} />
            </div>
          </Panel>
          <Panel title={t("admin.process")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <ListEditor label={t("admin.process")} lang="en" items={(form.processEn ?? []) as string[]} onChange={(v) => set("processEn", v)} />
              <ListEditor label={t("admin.process")} lang="hi" items={(form.processHi ?? []) as string[]} onChange={(v) => set("processHi", v)} />
            </div>
          </Panel>
          <Panel title={t("admin.faq")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FaqEditor label={t("admin.faq")} lang="en" items={(form.faqEn ?? []) as Faq[]} onChange={(v) => set("faqEn", v)} />
              <FaqEditor label={t("admin.faq")} lang="hi" items={(form.faqHi ?? []) as Faq[]} onChange={(v) => set("faqHi", v)} />
            </div>
          </Panel>
        </div>
      )}

      {tab === "media" && (
        <Panel title={t("admin.tabMedia")} subtitle={t("admin.mediaHint")}>
          <MultiImageUpload value={images} onChange={(v) => set("images", v)} folder="services" max={8} />
          <div className="mt-3 flex items-end gap-2">
            <Field label={t("admin.pasteImageUrl")} className="flex-1">
              <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="/images/services/rudrabhishek.svg" className="h-9 text-sm" />
            </Field>
            <Button
              size="sm"
              variant="outline"
              icon={<Plus className="h-4 w-4" />}
              disabled={!urlInput.trim()}
              onClick={() => {
                set("images", [...images, urlInput.trim()]);
                setUrlInput("");
              }}
            >
              {t("common.add")}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">{t("admin.coverHint")}</p>
        </Panel>
      )}

      {tab === "pricing" && (
        <div className="space-y-4">
          <Panel title={t("admin.pricing")}>
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label={t("admin.basePrice")} required>
                <Input type="number" min={0} value={form.basePrice} onChange={(e) => set("basePrice", Number(e.target.value))} />
              </Field>
              <Field label={t("admin.compareAtPrice")}>
                <Input
                  type="number"
                  min={0}
                  value={form.compareAtPrice ?? ""}
                  onChange={(e) => set("compareAtPrice", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
              <Field label={t("admin.durationMin")}>
                <Input
                  type="number"
                  min={0}
                  value={form.durationMin ?? ""}
                  onChange={(e) => set("durationMin", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
              <div className="flex items-end pb-2">
                <Checkbox checked={!!form.requiresPandit} onChange={(e) => set("requiresPandit", e.target.checked)} label={t("admin.requiresPandit")} />
              </div>
            </div>
          </Panel>
          <Panel title={t("admin.packages")} subtitle={t("admin.packagesHint")}>
            <PackagesEditor items={packages} onChange={(v) => set("packages", v)} />
          </Panel>
          <Panel title={t("admin.addons")} subtitle={t("admin.addonsHint")}>
            <AddonsEditor items={addons} onChange={(v) => set("addons", v)} />
          </Panel>
        </div>
      )}

      {tab === "schedule" && (
        <Panel title={t("admin.tabSchedule")}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t("admin.nextDate")} hint={t("admin.nextDateHint")}>
              <Input type="date" value={form.nextDate ?? ""} onChange={(e) => set("nextDate", e.target.value)} />
            </Field>
            <Field label={t("admin.availableFrom")}>
              <Input type="date" value={form.availableFrom ?? ""} onChange={(e) => set("availableFrom", e.target.value)} />
            </Field>
            <Field label={t("admin.availableTo")}>
              <Input type="date" value={form.availableTo ?? ""} onChange={(e) => set("availableTo", e.target.value)} />
            </Field>
          </div>
          <div className="mt-4">
            <ListEditor label={t("admin.slots")} items={(form.slots ?? []) as string[]} onChange={(v) => set("slots", v)} placeholder="06:00" addLabel={t("admin.addSlot")} />
          </div>
        </Panel>
      )}

      {tab === "visibility" && (
        <Panel title={t("admin.tabVisibility")}>
          <div className="space-y-3">
            <Checkbox checked={!!form.active} onChange={(e) => set("active", e.target.checked)} label={t("admin.activeHint")} />
            <Checkbox checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} label={t("admin.featuredHint")} />
            <Checkbox checked={!!form.trending} onChange={(e) => set("trending", e.target.checked)} label={t("admin.trendingHint")} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={t("admin.sortOrder")}>
                <Input type="number" value={form.sortOrder ?? 0} onChange={(e) => set("sortOrder", Number(e.target.value))} />
              </Field>
              <Field label={t("admin.ratingAvg")}>
                <Input type="number" step="0.1" min={0} max={5} value={form.ratingAvg ?? 4.8} onChange={(e) => set("ratingAvg", Number(e.target.value))} />
              </Field>
              <Field label={t("admin.ratingCount")}>
                <Input type="number" min={0} value={form.ratingCount ?? 0} onChange={(e) => set("ratingCount", Number(e.target.value))} />
              </Field>
              <Field label={t("admin.bookingCount")} hint={t("admin.bookingCountHint")}>
                <Input type="number" min={0} value={form.bookingCount ?? 0} onChange={(e) => set("bookingCount", Number(e.target.value))} />
              </Field>
            </div>
            {service && (
              <p className="text-xs text-muted">{t("admin.bookingCountInfo", { n: service.realBookings })}</p>
            )}
          </div>
        </Panel>
      )}

      <div className="flex justify-end gap-2 pb-6">
        <Button loading={pending} icon={<Save className="h-4 w-4" />} onClick={save} disabled={!form.nameEn || !form.nameHi}>
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}
