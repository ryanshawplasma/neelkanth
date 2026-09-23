"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarDays, Check, ChevronLeft, Plus, Tag, Trash2, Users } from "lucide-react";
import { useLoc, useLocale, useT } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, formatINR, parseJson, toDateKey } from "@/lib/utils";
import { GOTRAS, INDIAN_STATES } from "@/lib/constants";
import { actionErrorKey, formatSlot, imageOf } from "@/lib/app/helpers";
import { createBookingAction, validateCouponAction } from "@/lib/app/booking-actions";
import type { AddonData, PackageData } from "./package-picker";

export type CheckoutService = {
  slug: string;
  type: string;
  nameEn: string;
  nameHi: string;
  coverUrl: string | null;
  images: string;
  basePrice: number;
  nextDate: string | null;
  slots: string;
  availableFrom: string | null;
  availableTo: string | null;
  temple: { nameEn: string; nameHi: string; city: string } | null;
};

export type FamilyRow = { id: string; name: string; relation: string | null; gotra: string | null };
export type CheckoutUser = { name: string | null; gotra: string | null; addressLine: string | null; city: string | null; state: string | null; pincode: string | null };

type Devotee = { name: string; gotra: string; relation?: string };

const addDaysKey = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDateKey(d);
};

export function CheckoutFlow({
  service,
  packages,
  addons,
  initialPackage,
  initialAddons,
  panditId,
  family,
  user,
  serviceArea = null,
}: {
  /** Launch-city mode: home visits and deliveries only inside this city. */
  serviceArea?: { nameEn: string; nameHi: string; stateEn: string } | null;
  service: CheckoutService;
  packages: PackageData[];
  addons: AddonData[];
  initialPackage?: string;
  initialAddons: string[];
  panditId?: string;
  family: FamilyRow[];
  user: CheckoutUser;
}) {
  const t = useT();
  const loc = useLoc();
  const locale = useLocale();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const atHome = service.type === "PANDIT_AT_HOME";
  const isPrasad = service.type === "PRASAD";
  const fixedDate = ["CHADHAVA", "PRASAD"].includes(service.type);
  const slots = parseJson<string[]>(service.slots, []);

  const pkg = packages.find((p) => p.slug === initialPackage) ?? packages.find((p) => p.popular) ?? packages[0];
  const [pkgSlug, setPkgSlug] = useState(pkg?.slug ?? "");
  const selectedPkg = packages.find((p) => p.slug === pkgSlug) ?? pkg;
  const maxDevotees = selectedPkg?.maxDevotees ?? 4;

  const [step, setStep] = useState(1);
  const steps = 5;

  /* ── step 1: devotees ── */
  const [devotees, setDevotees] = useState<Devotee[]>(
    user.name ? [{ name: user.name, gotra: user.gotra || "Kashyap", relation: "self" }] : [],
  );
  const [newName, setNewName] = useState("");
  const [newGotra, setNewGotra] = useState(user.gotra || "Kashyap");
  const [unknownGotra, setUnknownGotra] = useState(false);

  /* ── step 2: schedule ── */
  const minDate = service.availableFrom && service.availableFrom > toDateKey() ? service.availableFrom : atHome ? addDaysKey(1) : toDateKey();
  const defaultDate = fixedDate ? service.nextDate ?? addDaysKey(1) : service.nextDate ?? (atHome ? addDaysKey(2) : minDate);
  const [date, setDate] = useState(defaultDate);
  const [slot, setSlot] = useState(slots[0] ?? "");
  const [prefTime, setPrefTime] = useState("09:00");

  /* ── step 3: address ── */
  const [wantsPrasad, setWantsPrasad] = useState(isPrasad);
  const needsAddress = atHome || isPrasad || wantsPrasad;
  const [addressLine, setAddressLine] = useState(user.addressLine ?? "");
  const areaName = serviceArea ? (locale === "hi" ? serviceArea.nameHi : serviceArea.nameEn) : null;
  const [city, setCity] = useState(serviceArea ? serviceArea.nameEn : (user.city ?? ""));
  const [stateName, setStateName] = useState(serviceArea ? serviceArea.stateEn : (user.state ?? ""));
  const [pincode, setPincode] = useState(user.pincode ?? "");

  /* ── step 4: sankalp + coupon ── */
  const [sankalp, setSankalp] = useState("");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [addonSlugs, setAddonSlugs] = useState<string[]>(initialAddons);

  const amountBase = selectedPkg?.price ?? service.basePrice;
  const amountAddons = addons.filter((a) => addonSlugs.includes(a.slug)).reduce((s, a) => s + a.price, 0);
  const subtotal = amountBase + amountAddons;
  const discount = applied?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const stepTitles = useMemo(
    () => [t("app.stepDevotees"), t("app.stepSchedule"), t("app.stepAddress"), t("app.stepDetails"), t("app.stepSummary")],
    [t],
  );

  function addDevotee(d: Devotee) {
    if (devotees.length >= maxDevotees) {
      toast(t("app.maxDevoteesReached", { n: maxDevotees }), "error");
      return;
    }
    if (devotees.some((x) => x.name.toLowerCase() === d.name.toLowerCase())) return;
    setDevotees((xs) => [...xs, d]);
  }

  function next() {
    setError(null);
    if (step === 1 && devotees.length === 0) return setError(t("app.atLeastOneDevotee"));
    if (step === 2 && !date) return setError(t("app.errDateInPast"));
    if (step === 2 && slots.length > 0 && !slot) return setError(t("app.errSlotRequired"));
    if (step === 3 && needsAddress && (!addressLine.trim() || !city.trim() || !pincode.trim())) return setError(t("app.errAddressRequired"));
    setStep((s) => Math.min(steps, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setError(null);
    if (step === 1) {
      window.history.back();
      return;
    }
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyCoupon() {
    setCouponError(null);
    if (!coupon.trim()) return;
    start(async () => {
      const res = await validateCouponAction(coupon, subtotal);
      if (!res.ok) {
        setApplied(null);
        setCouponError(t(actionErrorKey(res.error)));
        return;
      }
      setApplied({ code: res.data!.code, discount: res.data!.discount });
      toast(t("app.couponApplied", { code: res.data!.code }));
    });
  }

  function submit() {
    setError(null);
    start(async () => {
      const res = await createBookingAction({
        serviceSlug: service.slug,
        packageSlug: pkgSlug || undefined,
        addonSlugs,
        devotees: devotees.map((d) => ({ name: d.name, gotra: d.gotra, relation: d.relation })),
        scheduledDate: date,
        scheduledSlot: slots.length > 0 ? slot : atHome ? prefTime : undefined,
        sankalpNote: sankalp || undefined,
        couponCode: applied?.code,
        addressLine: needsAddress ? addressLine : undefined,
        city: needsAddress ? city : undefined,
        state: needsAddress ? stateName : undefined,
        pincode: needsAddress ? pincode : undefined,
        prasadDelivery: wantsPrasad,
        panditId,
      });
      // A successful call redirects to the payment page and never resolves here.
      if (res && !res.ok) setError(t(actionErrorKey(res.error)));
    });
  }

  return (
    <div className="pb-36">
      {/* header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 px-3 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <button onClick={back} aria-label={t("common.back")} className="rounded-full p-2 hover:bg-surface-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold leading-tight">{t("app.checkoutTitle")}</h1>
            <p className="truncate text-[11.5px] text-muted">
              {t("common.stepOf", { a: step, b: steps })} · {stepTitles[step - 1]}
            </p>
          </div>
        </div>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: steps }).map((_, i) => (
            <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i < step ? "bg-primary" : "bg-border")} />
          ))}
        </div>
      </header>

      {/* service summary strip */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageOf(service, "services", service.slug)} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold leading-tight">{loc(service, "name")}</p>
          {service.temple && (
            <p className="truncate text-[11.5px] text-muted">
              {loc(service.temple, "name")} · {service.temple.city}
            </p>
          )}
        </div>
        <p className="shrink-0 text-[14px] font-bold">{formatINR(total, locale)}</p>
      </div>

      <div className="px-4 pt-4 animate-fade-up">
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <section>
            <h2 className="text-[17px] font-bold tracking-tight">{t("app.stepDevotees")}</h2>
            <p className="mt-1 text-[12.5px] text-muted">{t("app.devoteesHint")}</p>
            <p className="mt-1 text-[12px] font-medium text-primary-700">
              {maxDevotees === 1 ? t("app.oneDevotee") : t("app.upToDevotees", { n: maxDevotees })}
            </p>

            {packages.length > 1 && (
              <div className="mt-3">
                <Field label={t("app.packagesSection")}>
                  <Select value={pkgSlug} onChange={(e) => setPkgSlug(e.target.value)}>
                    {packages.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {loc(p, "name")} · {formatINR(p.price, locale)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            )}

            {devotees.length > 0 && (
              <ul className="mt-3 space-y-2">
                {devotees.map((d, i) => (
                  <li key={`${d.name}-${i}`} className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[13px] font-bold text-primary-700">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold">{d.name}</span>
                      <span className="block text-[11.5px] text-muted">
                        {t("common.gotra")}: {d.gotra}
                      </span>
                    </span>
                    <button
                      onClick={() => setDevotees((xs) => xs.filter((_, j) => j !== i))}
                      aria-label={t("common.remove")}
                      className="rounded-full p-2 text-danger hover:bg-danger-soft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {family.length > 0 && (
              <div className="mt-4">
                <p className="text-[12.5px] font-medium text-muted">{t("app.fromYourFamily")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {family
                    .filter((f) => !devotees.some((d) => d.name === f.name))
                    .map((f) => (
                      <button
                        key={f.id}
                        onClick={() => addDevotee({ name: f.name, gotra: f.gotra || user.gotra || "Kashyap", relation: f.relation ?? undefined })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium"
                      >
                        <Plus className="h-3.5 w-3.5 text-primary" />
                        {f.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-border bg-surface p-3">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold">
                <Users className="h-4 w-4 text-primary" /> {t("app.addDevotee")}
              </p>
              <div className="mt-2.5 space-y-2.5">
                <Field label={t("app.devoteeName")}>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("common.name")} />
                </Field>
                <Field label={t("common.gotra")}>
                  <Select value={newGotra} onChange={(e) => setNewGotra(e.target.value)} disabled={unknownGotra}>
                    {GOTRAS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Checkbox
                  label={t("app.dontKnowGotra")}
                  checked={unknownGotra}
                  onChange={(e) => {
                    setUnknownGotra(e.target.checked);
                    if (e.target.checked) setNewGotra("Kashyap");
                  }}
                />
                {unknownGotra && <p className="text-[11.5px] text-muted">{t("app.gotraDefaulted")}</p>}
                <Button
                  full
                  variant="secondary"
                  icon={<Plus className="h-4 w-4" />}
                  disabled={newName.trim().length < 2}
                  onClick={() => {
                    addDevotee({ name: newName.trim(), gotra: newGotra || "Kashyap" });
                    setNewName("");
                  }}
                >
                  {t("common.add")}
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <section>
            <h2 className="text-[17px] font-bold tracking-tight">{t("app.stepSchedule")}</h2>

            {fixedDate ? (
              <div className="mt-3 rounded-2xl border border-border bg-surface-2 p-4">
                <p className="text-[12px] text-muted">{t("app.nextAvailable")}</p>
                <p className="mt-1 flex items-center gap-2 text-[15px] font-bold">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {formatDate(date, locale, { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
            ) : (
              <div className="mt-3">
                {service.nextDate && !atHome && <p className="mb-2 text-[12.5px] text-muted">{t("app.fixedDateNote", { date: formatDate(service.nextDate, locale) })}</p>}
                <Field label={t("app.chooseDate")}>
                  <Input
                    type="date"
                    value={date}
                    min={minDate}
                    max={service.availableTo ?? undefined}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Field>
              </div>
            )}

            {slots.length > 0 ? (
              <div className="mt-4">
                <p className="text-[13px] font-medium">{t("app.chooseSlot")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlot(s)}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-[12.5px] font-medium",
                        slot === s ? "border-primary bg-primary-soft text-primary-700" : "border-border bg-surface",
                      )}
                    >
                      {formatSlot(s, locale)}
                    </button>
                  ))}
                </div>
              </div>
            ) : atHome ? (
              <div className="mt-4">
                <Field label={t("app.preferredTime")}>
                  <Input type="time" value={prefTime} onChange={(e) => setPrefTime(e.target.value)} />
                </Field>
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2.5 text-[12.5px] text-muted">{t("app.noSlots")}</p>
            )}
          </section>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <section>
            <h2 className="text-[17px] font-bold tracking-tight">{atHome ? t("app.visitAddress") : t("app.deliveryAddress")}</h2>

            {!atHome && !isPrasad && (
              <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-2xl border border-border bg-surface p-3">
                <input
                  type="checkbox"
                  checked={wantsPrasad}
                  onChange={(e) => setWantsPrasad(e.target.checked)}
                  className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded border-border accent-primary"
                />
                <span>
                  <span className="block text-[13.5px] font-semibold">{t("app.wantPrasad")}</span>
                  <span className="mt-0.5 block text-[11.5px] text-muted">{t("app.wantPrasadHint")}</span>
                </span>
              </label>
            )}

            {needsAddress ? (
              <div className="mt-3 space-y-2.5">
                <Field label={t("app.addressLine")} required>
                  <Textarea value={addressLine} onChange={(e) => setAddressLine(e.target.value)} rows={2} className="min-h-16" />
                </Field>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label={t("common.city")} required hint={areaName ? t("app.serviceAreaHint", { city: areaName }) : undefined}>
                    <Input value={areaName ?? city} onChange={(e) => setCity(e.target.value)} readOnly={!!serviceArea} aria-readonly={!!serviceArea} className={serviceArea ? "bg-surface-2" : undefined} />
                  </Field>
                  <Field label={t("common.pincode")} required>
                    <Input value={pincode} onChange={(e) => setPincode(e.target.value)} inputMode="numeric" maxLength={6} />
                  </Field>
                </div>
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
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2.5 text-[12.5px] text-muted">{t("app.addressNotNeeded")}</p>
            )}
          </section>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <section>
            <h2 className="text-[17px] font-bold tracking-tight">{t("app.stepDetails")}</h2>
            <div className="mt-3">
              <Field label={t("app.sankalpNote")} hint={t("app.sankalpHint")}>
                <Textarea value={sankalp} onChange={(e) => setSankalp(e.target.value)} maxLength={500} rows={4} />
              </Field>
            </div>

            {addons.length > 0 && (
              <div className="mt-4">
                <p className="text-[13px] font-medium">{t("app.addonsSection")}</p>
                <div className="mt-2 space-y-2">
                  {addons.map((a) => {
                    const on = addonSlugs.includes(a.slug);
                    return (
                      <label
                        key={a.id}
                        className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border bg-surface p-2.5", on ? "border-primary bg-primary-soft/40" : "border-border")}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => setAddonSlugs((xs) => (on ? xs.filter((x) => x !== a.slug) : [...xs, a.slug]))}
                          className="h-4.5 w-4.5 shrink-0 rounded border-border accent-primary"
                        />
                        <span className="min-w-0 flex-1 text-[13px] font-medium">{loc(a, "name")}</span>
                        <span className="shrink-0 text-[13px] font-semibold">+{formatINR(a.price, locale)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-border bg-surface p-3">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold">
                <Tag className="h-4 w-4 text-primary" /> {t("app.couponCode")}
              </p>
              {applied ? (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="flex-1 text-[13px] font-semibold text-success">{t("app.couponApplied", { code: applied.code })}</span>
                  <button
                    onClick={() => {
                      setApplied(null);
                      setCoupon("");
                      toast(t("app.couponRemoved"), "info");
                    }}
                    className="text-[12px] font-semibold text-danger"
                  >
                    {t("common.remove")}
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="DIVYA10" className="flex-1" />
                  <Button variant="secondary" onClick={applyCoupon} loading={pending} disabled={!coupon.trim()}>
                    {t("app.apply")}
                  </Button>
                </div>
              )}
              {couponError && <p className="mt-1.5 text-[12px] text-danger">{couponError}</p>}
            </div>
          </section>
        )}

        {/* ── STEP 5 ── */}
        {step === 5 && (
          <section>
            <h2 className="text-[17px] font-bold tracking-tight">{t("app.orderSummary")}</h2>

            <dl className="mt-3 space-y-2 rounded-2xl border border-border bg-surface p-3.5 text-[13px]">
              <Row label={t("app.devoteesLabel")} value={devotees.map((d) => `${d.name} (${d.gotra})`).join(", ")} />
              <Row
                label={t("common.date")}
                value={`${formatDate(date, locale, { weekday: "short", day: "numeric", month: "short" })}${
                  slots.length > 0 && slot ? ` · ${formatSlot(slot, locale)}` : atHome ? ` · ${formatSlot(prefTime, locale)}` : ""
                }`}
              />
              {needsAddress && <Row label={t("app.addressLabel")} value={[addressLine, city, stateName, pincode].filter(Boolean).join(", ")} />}
              {sankalp && <Row label={t("app.sankalpLabel")} value={sankalp} />}
            </dl>

            <dl className="mt-3 space-y-2 rounded-2xl border border-border bg-surface p-3.5 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">
                  {t("app.packagePrice")}
                  {selectedPkg ? ` · ${loc(selectedPkg, "name")}` : ""}
                </dt>
                <dd className="font-medium">{formatINR(amountBase, locale)}</dd>
              </div>
              {amountAddons > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t("app.addonsTotal")}</dt>
                  <dd className="font-medium">{formatINR(amountAddons, locale)}</dd>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between gap-3 text-success">
                  <dt>
                    {t("common.discount")} · {applied?.code}
                  </dt>
                  <dd className="font-medium">− {formatINR(discount, locale)}</dd>
                </div>
              )}
              <div className="mt-1 flex justify-between gap-3 border-t border-border pt-2 text-[15px] font-bold">
                <dt>{t("common.total")}</dt>
                <dd>{formatINR(total, locale)}</dd>
              </div>
            </dl>
          </section>
        )}

        {error && <p className="mt-4 rounded-xl bg-danger-soft px-3 py-2.5 text-[12.5px] text-danger">{error}</p>}
      </div>

      {/* sticky footer CTA */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <div className="pointer-events-auto w-full max-w-md border-t border-border bg-surface/95 px-4 pb-safe pt-3 backdrop-blur">
          {step < steps ? (
            <Button full size="lg" onClick={next}>
              {t("common.continue")}
            </Button>
          ) : (
            <Button full size="lg" loading={pending} onClick={submit}>
              {t("app.payAmount", { amount: formatINR(total, locale) })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right font-medium">{value}</dd>
    </div>
  );
}
