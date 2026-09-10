"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/input";
import { useLocale, useT } from "@/i18n/client";
import { monthLabelLong } from "@/lib/pandit/shared";

export function MonthSelect({ value, options }: { value: string; options: string[] }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  return (
    <Select className="h-9 w-auto text-sm" aria-label={t("pandit.month")} value={value} onChange={(e) => router.push(`/pandit/earnings?month=${e.target.value}`)}>
      {options.map((m) => (
        <option key={m} value={m}>
          {monthLabelLong(m, locale)}
        </option>
      ))}
    </Select>
  );
}
