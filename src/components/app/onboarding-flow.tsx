"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useT } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { LanguagePicker } from "@/components/ui/language-switch";
import { useToast } from "@/components/ui/toast";
import { EnablePushButton } from "@/components/push-register";
import { cn } from "@/lib/utils";
import { GOTRAS, INDIAN_STATES, RASHIS, pickBi } from "@/lib/constants";
import { useLocale } from "@/i18n/client";
import { actionErrorKey } from "@/lib/app/helpers";
import { addFamilyMemberAction, completeOnboardingAction, deleteFamilyMemberAction } from "@/lib/app/account-actions";

type FamilyRow = { id: string; name: string; relation: string | null; gotra: string | null };

export function OnboardingFlow({
  next,
  family: initialFamily,
  user,
}: {
  next: string;
  family: FamilyRow[];
  user: {
    name: string | null;
    gender: string | null;
    gotra: string | null;
    dob: string | null;
    tob: string | null;
    birthPlace: string | null;
    rashi: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
  };
}) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const [step, setStep] = useState(1);
  const steps = 6;

  const [name, setName] = useState(user.name ?? "");
  const [gender, setGender] = useState(user.gender ?? "");
  const [gotra, setGotra] = useState(user.gotra ?? "Kashyap");
  const [dob, setDob] = useState(user.dob ?? "");
  const [tob, setTob] = useState(user.tob ?? "");
  const [birthPlace, setBirthPlace] = useState(user.birthPlace ?? "");
  const [rashi, setRashi] = useState(user.rashi ?? "");
  const [city, setCity] = useState(user.city ?? "");
  const [stateName, setStateName] = useState(user.state ?? "");
  const [pincode, setPincode] = useState(user.pincode ?? "");

  const [family, setFamily] = useState<FamilyRow[]>(initialFamily);
  const [memberName, setMemberName] = useState("");
  const [memberRelation, setMemberRelation] = useState("spouse");
  const [error, setError] = useState<string | null>(null);

  const relations = ["spouse", "father", "mother", "son", "daughter", "brother", "sister"];

  function advance() {
    setError(null);
    if (step === 2 && name.trim().length < 2) return setError(t("common.required"));
    if (step === steps) return finish();
    setStep((s) => s + 1);
    window.scrollTo({ top: 0 });
  }

  function finish() {
    start(async () => {
      const res = await completeOnboardingAction({ name, gender, gotra, dob, tob, birthPlace, rashi, city, state: stateName, pincode });
      if (!res.ok) return setError(t(actionErrorKey(res.error)));
      toast(`${t("app.welcomeNamed", { name: name.split(" ")[0] })} 🙏`);
      router.replace(next);
      router.refresh();
    });
  }

  function addMember() {
    if (memberName.trim().length < 2) return;
    start(async () => {
      const res = await addFamilyMemberAction({ name: memberName.trim(), relation: memberRelation, gotra });
      if (res.ok) {
        setFamily((xs) => [...xs, { id: res.data!.id, name: memberName.trim(), relation: memberRelation, gotra }]);
        setMemberName("");
      } else toast(t(actionErrorKey(res.error)), "error");
    });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-devotional px-5 pb-28">
      <div className="flex items-center gap-2 py-4">
        {step > 1 && (
          <button onClick={() => setStep((s) => s - 1)} aria-label={t("common.back")} className="-ml-2 rounded-full p-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <span className="text-[12px] font-medium text-muted">{t("common.stepOf", { a: step, b: steps })}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: steps }).map((_, i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full", i < step ? "bg-primary" : "bg-border")} />
        ))}
      </div>

      <div className="mt-7 animate-fade-up">
        {step === 1 && (
          <>
            <h1 className="text-[22px] font-bold leading-tight tracking-tight">{t("app.onbLangTitle")}</h1>
            <p className="mt-1 text-[13px] text-muted">{t("app.onbLangSub")}</p>
            <div className="mt-5">
              <LanguagePicker />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-[22px] font-bold leading-tight tracking-tight">{t("app.onbAboutTitle")}</h1>
            <p className="mt-1 text-[13px] text-muted">{t("app.onbAboutSub")}</p>
            <div className="mt-5 space-y-3">
              <Field label={t("common.name")} required>
                <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder={t("common.name")} />
              </Field>
              <div>
                <p className="mb-1.5 text-sm font-medium">{t("common.gender")}</p>
                <div className="flex gap-2">
                  {[
                    { v: "male", l: t("common.male") },
                    { v: "female", l: t("common.female") },
                    { v: "other", l: t("common.other") },
                  ].map((g) => (
                    <button
                      key={g.v}
                      onClick={() => setGender(g.v)}
                      className={cn(
                        "flex-1 rounded-xl border py-2.5 text-[13px] font-medium",
                        gender === g.v ? "border-primary bg-primary-soft text-primary-700" : "border-border bg-surface",
                      )}
                    >
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-[22px] font-bold leading-tight tracking-tight">{t("app.onbBirthTitle")}</h1>
            <p className="mt-1 text-[13px] text-muted">{t("app.onbBirthSub")}</p>
            <div className="mt-5 space-y-3">
              <Field label={t("common.gotra")} hint={t("common.gotraUnknown")}>
                <Select value={gotra} onChange={(e) => setGotra(e.target.value)}>
                  {GOTRAS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("common.dob")}>
                  <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </Field>
                <Field label={t("common.tob")}>
                  <Input type="time" value={tob} onChange={(e) => setTob(e.target.value)} />
                </Field>
              </div>
              <Field label={t("common.birthPlace")}>
                <Input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
              </Field>
              <Field label={t("common.rashi")}>
                <Select value={rashi} onChange={(e) => setRashi(e.target.value)}>
                  <option value="">—</option>
                  {RASHIS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {pickBi(r.label, locale)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-[22px] font-bold leading-tight tracking-tight">{t("app.onbPlaceTitle")}</h1>
            <p className="mt-1 text-[13px] text-muted">{t("app.onbPlaceSub")}</p>
            <div className="mt-5 space-y-3">
              <Field label={t("common.city")}>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label={t("common.state")}>
                <Select value={stateName} onChange={(e) => setStateName(e.target.value)}>
                  <option value="">—</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("common.pincode")}>
                <Input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" />
              </Field>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="text-[22px] font-bold leading-tight tracking-tight">{t("app.onbFamilyTitle")}</h1>
            <p className="mt-1 text-[13px] text-muted">{t("app.onbFamilySub")}</p>

            {family.length > 0 && (
              <ul className="mt-4 space-y-2">
                {family.map((f) => (
                  <li key={f.id} className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold">{f.name}</span>
                      <span className="block text-[11.5px] text-muted">{f.relation ? t(`common.${f.relation}`) : ""}</span>
                    </span>
                    <button
                      onClick={() =>
                        start(async () => {
                          await deleteFamilyMemberAction(f.id);
                          setFamily((xs) => xs.filter((x) => x.id !== f.id));
                        })
                      }
                      aria-label={t("common.delete")}
                      className="rounded-full p-2 text-danger hover:bg-danger-soft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 space-y-2.5 rounded-2xl border border-border bg-surface p-3">
              <Field label={t("common.name")}>
                <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} />
              </Field>
              <Field label={t("common.relation")}>
                <Select value={memberRelation} onChange={(e) => setMemberRelation(e.target.value)}>
                  {relations.map((r) => (
                    <option key={r} value={r}>
                      {t(`common.${r}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button full variant="secondary" icon={<Plus className="h-4 w-4" />} loading={pending} disabled={memberName.trim().length < 2} onClick={addMember}>
                {t("common.add")}
              </Button>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h1 className="text-[22px] font-bold leading-tight tracking-tight">{t("app.onbNotifyTitle")}</h1>
            <p className="mt-1 text-[13px] text-muted">{t("app.onbNotifySub")}</p>
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center">
              <span className="text-4xl" aria-hidden>
                🔔
              </span>
              <div className="mt-4">
                <EnablePushButton />
              </div>
            </div>
          </>
        )}

        {error && <p className="mt-4 rounded-xl bg-danger-soft px-3 py-2.5 text-[12.5px] text-danger">{error}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <div className="w-full max-w-md border-t border-border bg-surface/95 px-5 pb-safe pt-3 backdrop-blur">
          <Button full size="lg" loading={pending} onClick={advance}>
            {step === steps ? t("app.finish") : t("common.continue")}
          </Button>
          {step > 1 && step < steps && (
            <button onClick={() => setStep((s) => s + 1)} className="mt-2 block w-full py-1 text-center text-[12.5px] font-medium text-muted">
              {t("app.skipForNow")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
