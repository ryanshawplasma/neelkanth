"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit, getCurrentUser } from "@/lib/auth";
import type { ActionResult } from "@/lib/auth-actions";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  gender: z.string().trim().max(10).optional(),
  gotra: z.string().trim().max(40).optional(),
  dob: z.string().trim().max(10).optional(),
  tob: z.string().trim().max(5).optional(),
  birthPlace: z.string().trim().max(80).optional(),
  rashi: z.string().trim().max(20).optional(),
  city: z.string().trim().max(60).optional(),
  state: z.string().trim().max(60).optional(),
  pincode: z.string().trim().max(10).optional(),
  addressLine: z.string().trim().max(200).optional(),
});

export type ProfileInput = z.input<typeof profileSchema>;

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalidInput" };
  const d = parsed.data;
  await db.user.update({
    where: { id: user.id },
    data: {
      name: d.name ?? user.name,
      gender: d.gender || null,
      gotra: d.gotra || null,
      dob: d.dob || null,
      tob: d.tob || null,
      birthPlace: d.birthPlace || null,
      rashi: d.rashi || null,
      city: d.city || null,
      state: d.state || null,
      pincode: d.pincode || null,
      addressLine: d.addressLine || null,
    },
  });
  await audit(user.id, "profile.update", "User", user.id);
  revalidatePath("/account");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Final step of /onboarding — marks the profile complete. */
export async function completeOnboardingAction(input: ProfileInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalidInput" };
  const d = parsed.data;
  if (!d.name) return { ok: false, error: "nameRequired" };
  await db.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      gender: d.gender || null,
      gotra: d.gotra || null,
      dob: d.dob || null,
      tob: d.tob || null,
      birthPlace: d.birthPlace || null,
      rashi: d.rashi || null,
      city: d.city || null,
      state: d.state || null,
      pincode: d.pincode || null,
      addressLine: d.addressLine || null,
      onboarded: true,
    },
  });
  await audit(user.id, "user.onboarded", "User", user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

const memberSchema = z.object({
  name: z.string().trim().min(2).max(60),
  relation: z.string().trim().max(30).optional(),
  gotra: z.string().trim().max(40).optional(),
  dob: z.string().trim().max(10).optional(),
});

export type FamilyMemberInput = z.input<typeof memberSchema>;

export async function addFamilyMemberAction(input: FamilyMemberInput): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const parsed = memberSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalidInput" };
  const count = await db.familyMember.count({ where: { userId: user.id } });
  if (count >= 20) return { ok: false, error: "tooManyMembers" };
  const m = await db.familyMember.create({
    data: { userId: user.id, name: parsed.data.name, relation: parsed.data.relation || null, gotra: parsed.data.gotra || null, dob: parsed.data.dob || null },
  });
  revalidatePath("/account");
  return { ok: true, data: { id: m.id } };
}

export async function updateFamilyMemberAction(id: string, input: FamilyMemberInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const parsed = memberSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalidInput" };
  const owned = await db.familyMember.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!owned) return { ok: false, error: "notFound" };
  await db.familyMember.update({
    where: { id },
    data: { name: parsed.data.name, relation: parsed.data.relation || null, gotra: parsed.data.gotra || null, dob: parsed.data.dob || null },
  });
  revalidatePath("/account");
  return { ok: true };
}

export async function deleteFamilyMemberAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "notLoggedIn" };
  const owned = await db.familyMember.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!owned) return { ok: false, error: "notFound" };
  await db.familyMember.delete({ where: { id } });
  revalidatePath("/account");
  return { ok: true };
}
