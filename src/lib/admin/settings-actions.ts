"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";
import { SETTING_KEYS } from "./util";

export type Result = { ok: boolean; error?: string };

const valueSchema = z.string().max(2000);

/** Upserts the platform settings edited on /admin/settings (unknown keys ignored). */
export async function saveSettingsAction(values: Record<string, string>): Promise<Result> {
  const admin = await requireAdmin();
  const allowed = new Set<string>(SETTING_KEYS);
  const entries: [string, string][] = [];
  for (const [key, value] of Object.entries(values ?? {})) {
    if (!allowed.has(key)) continue;
    const parsed = valueSchema.safeParse(value);
    if (!parsed.success) return { ok: false, error: "admin.errInvalidInput" };
    entries.push([key, parsed.data.trim()]);
  }
  if (!entries.length) return { ok: false, error: "admin.errInvalidInput" };

  for (const [key, value] of entries) {
    await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }
  await audit(admin.id, "settings.update", "Setting", undefined, { keys: entries.map(([k]) => k) });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}
