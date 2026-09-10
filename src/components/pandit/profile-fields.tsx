"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Field, Input, Select, Textarea, Toggle, ChipGroup } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { useLocale, useT } from "@/i18n/client";
import { GOTRAS, INDIAN_STATES, LANGUAGES, PANDIT_CLASSIFICATIONS, SAMPRADAYAS, SPECIALITIES, pickBi } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProfileInput } from "@/lib/pandit/profile-actions";

export type TempleOption = { id: string; nameEn: string; nameHi: string; city: string };

/** Editable state shared by /pandit/register and /pandit/profile. */
export type ProfileForm = Omit<ProfileInput, "photoUrl" | "templeId"> & { photoUrl: string | null; templeId: string | null };

export const emptyProfileForm = (): ProfileForm => ({
  displayName: "",
  displayNameHi: "",
  gender: "male",
  photoUrl: null,
  classification: "PUROHIT",
  specialities: [],
  languages: ["hi"],
  experienceYears: 5,
  sampradaya: "",
  education: "",
  gotra: "",
  city: "",
  state: "",
  pincode: "",
  serviceRadiusKm: 25,
  servesOnline: true,
  servesAtHome: true,
  servesAtTemple: false,
  templeId: null,
  bio: "",
  bioHi: "",
});

type Patch = (p: Partial<ProfileForm>) => void;

export function FieldsBasics({ form, set, photoFolder = "pandits" }: { form: ProfileForm; set: Patch; photoFolder?: string }) {
  const t = useT();
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <ImageUpload value={form.photoUrl} onChange={(url) => set({ photoUrl: url })} folder={photoFolder} round label={t("common.uploadPhoto")} />
        <p className="text-center text-xs text-muted">{t("pandit.profilePhotoHint")}</p>
      </div>
      <Field label={t("pandit.displayName")} required>
        <Input value={form.displayName} onChange={(e) => set({ displayName: e.target.value })} placeholder={t("pandit.displayNamePlaceholder")} autoComplete="name" />
      </Field>
      <Field label={t("pandit.displayNameHi")}>
        <Input value={form.displayNameHi ?? ""} onChange={(e) => set({ displayNameHi: e.target.value })} placeholder={t("pandit.displayNameHiPlaceholder")} />
      </Field>
      <Field label={t("common.gender")}>
        <Select value={form.gender ?? "male"} onChange={(e) => set({ gender: e.target.value })}>
          <option value="male">{t("common.male")}</option>
          <option value="female">{t("common.female")}</option>
          <option value="other">{t("common.other")}</option>
        </Select>
      </Field>
    </div>
  );
}

export function FieldsExpertise({ form, set }: { form: ProfileForm; set: Patch }) {
  const t = useT();
  const locale = useLocale();
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium">
          {t("pandit.classification")}
          <span className="ml-0.5 text-danger">*</span>
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PANDIT_CLASSIFICATIONS.map((c) => {
            const on = form.classification === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => set({ classification: c.value })}
                aria-pressed={on}
                className={cn(
                  "flex items-start gap-2 rounded-2xl border-2 p-3 text-left transition-colors",
                  on ? "border-primary bg-primary-soft" : "border-border bg-surface hover:bg-surface-2",
                )}
              >
                <span className={cn("mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2", on ? "border-primary bg-primary text-white" : "border-border")}>
                  {on && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{pickBi(c.label, locale)}</span>
                  <span className="mt-0.5 block text-xs text-muted">{pickBi(c.desc, locale)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">
          {t("pandit.specialities")}
          <span className="ml-0.5 text-danger">*</span>
        </p>
        <p className="mb-2 text-xs text-muted">{t("pandit.specialitiesHint")}</p>
        <ChipGroup
          multiple
          options={SPECIALITIES.map((s) => ({ value: s.value as string, label: pickBi(s.label, locale) }))}
          value={form.specialities}
          onChange={(v) => set({ specialities: Array.isArray(v) ? v : [v] })}
        />
      </div>
    </div>
  );
}

export function FieldsBackground({ form, set }: { form: ProfileForm; set: Patch }) {
  const t = useT();
  const locale = useLocale();
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">
          {t("pandit.languagesLabel")}
          <span className="ml-0.5 text-danger">*</span>
        </p>
        <ChipGroup
          multiple
          options={LANGUAGES.map((l) => ({ value: l.value as string, label: pickBi(l.label, locale) }))}
          value={form.languages}
          onChange={(v) => set({ languages: Array.isArray(v) ? v : [v] })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("pandit.experienceYears")} required>
          <Input
            type="number"
            min={0}
            max={70}
            inputMode="numeric"
            value={String(form.experienceYears)}
            onChange={(e) => set({ experienceYears: Number(e.target.value) })}
          />
        </Field>
        <Field label={t("pandit.sampradaya")}>
          <Select value={form.sampradaya ?? ""} onChange={(e) => set({ sampradaya: e.target.value })}>
            <option value="">{t("pandit.selectOption")}</option>
            {SAMPRADAYAS.map((s) => (
              <option key={s.value} value={s.value}>
                {pickBi(s.label, locale)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("pandit.education")}>
          <Input value={form.education ?? ""} onChange={(e) => set({ education: e.target.value })} placeholder={t("pandit.educationPlaceholder")} />
        </Field>
        <Field label={t("pandit.gotraLabel")}>
          <Select value={form.gotra ?? ""} onChange={(e) => set({ gotra: e.target.value })}>
            <option value="">{t("pandit.selectOption")}</option>
            {GOTRAS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </div>
  );
}

export function FieldsArea({ form, set, temples }: { form: ProfileForm; set: Patch; temples: TempleOption[] }) {
  const t = useT();
  const locale = useLocale();
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("pandit.serviceCity")} required>
          <Input value={form.city ?? ""} onChange={(e) => set({ city: e.target.value })} placeholder="Varanasi" autoComplete="address-level2" />
        </Field>
        <Field label={t("common.state")} required>
          <Select value={form.state ?? ""} onChange={(e) => set({ state: e.target.value })}>
            <option value="">{t("pandit.selectOption")}</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("common.pincode")}>
          <Input value={form.pincode ?? ""} onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" placeholder="221001" />
        </Field>
        <Field label={`${t("pandit.serviceRadius")} (${form.serviceRadiusKm} ${t("pandit.km")})`} hint={t("pandit.serviceRadiusHint")}>
          <input
            type="range"
            min={1}
            max={200}
            step={1}
            value={form.serviceRadiusKm}
            onChange={(e) => set({ serviceRadiusKm: Number(e.target.value) })}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-[var(--primary)]"
            aria-label={t("pandit.serviceRadius")}
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium">
          {t("pandit.modes")}
          <span className="ml-0.5 text-danger">*</span>
        </p>
        <div className="space-y-3">
          <Toggle checked={form.servesOnline} onChange={(v) => set({ servesOnline: v })} label={t("pandit.modeOnline")} />
          <Toggle checked={form.servesAtHome} onChange={(v) => set({ servesAtHome: v })} label={t("pandit.modeAtHome")} />
          <Toggle checked={form.servesAtTemple} onChange={(v) => set({ servesAtTemple: v, templeId: v ? form.templeId : null })} label={t("pandit.modeAtTemple")} />
        </div>
        {form.servesAtTemple && (
          <Field className="mt-4" label={t("pandit.templeLabel")} required>
            <Select value={form.templeId ?? ""} onChange={(e) => set({ templeId: e.target.value || null })}>
              <option value="">{t("pandit.selectOption")}</option>
              {temples.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {(locale === "hi" ? tp.nameHi : tp.nameEn) || tp.nameEn} · {tp.city}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>
    </div>
  );
}

export function FieldsAbout({ form, set, children }: { form: ProfileForm; set: Patch; children?: ReactNode }) {
  const t = useT();
  return (
    <div className="space-y-4">
      <Field label={t("pandit.bioEn")}>
        <Textarea value={form.bio ?? ""} onChange={(e) => set({ bio: e.target.value })} placeholder={t("pandit.bioPlaceholder")} rows={4} />
      </Field>
      <Field label={t("pandit.bioHi")}>
        <Textarea value={form.bioHi ?? ""} onChange={(e) => set({ bioHi: e.target.value })} placeholder={t("pandit.bioHiPlaceholder")} rows={4} />
      </Field>
      {children}
    </div>
  );
}

/** Payload sent to createPanditProfileAction / updatePanditProfileAction. */
export function toProfileInput(form: ProfileForm): ProfileInput {
  return { ...form, photoUrl: form.photoUrl, templeId: form.templeId };
}
