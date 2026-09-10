"use server";

import { revalidatePath } from "next/cache";
import type { PanditClassification } from "@prisma/client";
import { db } from "@/lib/db";
import { audit, getCurrentUser } from "@/lib/auth";
import { PANDIT_CLASSIFICATIONS, SPECIALITIES, LANGUAGES } from "@/lib/constants";
import { toJson } from "@/lib/utils";
import { currentPandit, done, ERR, fail, type Result } from "./guard";
import { PINCODE_RE } from "./shared";

export type ProfileInput = {
  displayName: string;
  displayNameHi?: string;
  gender?: string;
  photoUrl?: string | null;
  classification: string;
  specialities: string[];
  languages: string[];
  experienceYears: number;
  sampradaya?: string;
  education?: string;
  gotra?: string;
  city?: string;
  state?: string;
  pincode?: string;
  serviceRadiusKm: number;
  servesOnline: boolean;
  servesAtHome: boolean;
  servesAtTemple: boolean;
  templeId?: string | null;
  bio?: string;
  bioHi?: string;
};

const CLASSIFICATION_VALUES = PANDIT_CLASSIFICATIONS.map((c) => c.value) as readonly string[];
const SPECIALITY_VALUES = new Set(SPECIALITIES.map((s) => s.value) as readonly string[]);
const LANGUAGE_VALUES = new Set(LANGUAGES.map((l) => l.value) as readonly string[]);

function clean(v?: string | null) {
  const s = (v ?? "").trim();
  return s.length ? s : undefined;
}

/** Returns an i18n error key when the payload is not usable. */
function validate(input: ProfileInput): string | null {
  if (!clean(input.displayName) || input.displayName.trim().length < 3) return "pandit.errNameShort";
  if (!CLASSIFICATION_VALUES.includes(input.classification)) return "pandit.errClassification";
  const specialities = (input.specialities ?? []).filter((s) => SPECIALITY_VALUES.has(s));
  if (specialities.length < 1) return "pandit.errSpeciality";
  const languages = (input.languages ?? []).filter((l) => LANGUAGE_VALUES.has(l));
  if (languages.length < 1) return "pandit.errLanguage";
  if (!Number.isFinite(input.experienceYears) || input.experienceYears < 0 || input.experienceYears > 70) return "pandit.errExperience";
  if (!clean(input.city)) return "pandit.errCity";
  if (!clean(input.state)) return "pandit.errState";
  if (input.pincode && !PINCODE_RE.test(input.pincode.trim())) return "pandit.errPincode";
  if (!input.servesOnline && !input.servesAtHome && !input.servesAtTemple) return "pandit.errServiceMode";
  if (input.servesAtTemple && !clean(input.templeId)) return "pandit.errTemple";
  return null;
}

function toRow(input: ProfileInput) {
  return {
    displayName: input.displayName.trim(),
    displayNameHi: clean(input.displayNameHi) ?? null,
    photoUrl: clean(input.photoUrl) ?? null,
    classification: input.classification as PanditClassification,
    specialities: toJson((input.specialities ?? []).filter((s) => SPECIALITY_VALUES.has(s))),
    languages: toJson((input.languages ?? []).filter((l) => LANGUAGE_VALUES.has(l))),
    experienceYears: Math.round(input.experienceYears),
    sampradaya: clean(input.sampradaya) ?? null,
    education: clean(input.education) ?? null,
    gotra: clean(input.gotra) ?? null,
    city: clean(input.city) ?? null,
    state: clean(input.state) ?? null,
    pincode: clean(input.pincode) ?? null,
    serviceRadiusKm: Math.min(500, Math.max(1, Math.round(input.serviceRadiusKm || 25))),
    servesOnline: !!input.servesOnline,
    servesAtHome: !!input.servesAtHome,
    servesAtTemple: !!input.servesAtTemple,
    templeId: input.servesAtTemple ? clean(input.templeId) ?? null : null,
    bio: clean(input.bio) ?? null,
    bioHi: clean(input.bioHi) ?? null,
  };
}

/** Step 5 of /pandit/register — creates the PanditProfile and upgrades the account. */
export async function createPanditProfileAction(input: ProfileInput): Promise<Result<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return fail(ERR.auth);
  if (user.pandit) return fail(ERR.exists);

  const err = validate(input);
  if (err) return fail(err);

  const row = toRow(input);
  const profile = await db.panditProfile.create({ data: { ...row, userId: user.id, kycStatus: "NOT_STARTED" } });
  await db.user.update({
    where: { id: user.id },
    data: {
      name: row.displayName,
      onboarded: true,
      role: user.role === "ADMIN" ? "ADMIN" : "PANDIT",
      gender: clean(input.gender) ?? user.gender,
      avatarUrl: row.photoUrl ?? user.avatarUrl,
      city: row.city ?? user.city,
      state: row.state ?? user.state,
      pincode: row.pincode ?? user.pincode,
      gotra: row.gotra ?? user.gotra,
    },
  });
  await audit(user.id, "pandit.profile.create", "PanditProfile", profile.id);
  revalidatePath("/pandit", "layout");
  return done({ id: profile.id });
}

/** /pandit/profile — edit everything in one form. */
export async function updatePanditProfileAction(input: ProfileInput): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);

  const err = validate(input);
  if (err) return fail(err);

  const row = toRow(input);
  await db.panditProfile.update({ where: { id: ctx.pandit.id }, data: row });
  await db.user.update({
    where: { id: ctx.user.id },
    data: {
      name: row.displayName,
      gender: clean(input.gender) ?? ctx.user.gender,
      avatarUrl: row.photoUrl ?? ctx.user.avatarUrl,
      city: row.city ?? ctx.user.city,
      state: row.state ?? ctx.user.state,
      pincode: row.pincode ?? ctx.user.pincode,
      gotra: row.gotra ?? ctx.user.gotra,
    },
  });
  await audit(ctx.user.id, "pandit.profile.update", "PanditProfile", ctx.pandit.id);
  revalidatePath("/pandit", "layout");
  return done();
}

/** "Accepting bookings" switch. */
export async function setAcceptingBookingsAction(active: boolean): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);
  await db.panditProfile.update({ where: { id: ctx.pandit.id }, data: { isActive: !!active } });
  await audit(ctx.user.id, "pandit.profile.active", "PanditProfile", ctx.pandit.id, { active });
  revalidatePath("/pandit", "layout");
  return done();
}
