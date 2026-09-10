"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";

export type Faq = { q: string; a: string };

/**
 * FAQ pairs for one language. Services store `faqEn` / `faqHi` as JSON
 * `[{ q, a }]`, so render two of these side by side.
 */
export function FaqEditor({ label, items, onChange, lang }: { label: string; items: Faq[]; onChange: (items: Faq[]) => void; lang: "en" | "hi" }) {
  const t = useT();
  const set = (i: number, patch: Partial<Faq>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const hi = lang === "hi";

  return (
    <div>
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
        {label}
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${hi ? "bg-primary-soft text-primary-700" : "bg-surface-2 text-muted"}`}>
          {hi ? "हिं" : "EN"}
        </span>
      </span>
      <div className="space-y-2">
        {items.map((f, i) => (
          <div key={i} className="rounded-xl border border-border p-2.5">
            <div className="flex items-start gap-1.5">
              <Input
                value={f.q}
                onChange={(e) => set(i, { q: e.target.value })}
                placeholder={t("admin.faqQuestion")}
                lang={lang}
                className={`h-9 text-sm font-medium ${hi ? "font-[var(--font-devanagari)]" : ""}`}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="rounded-lg p-1.5 text-danger hover:bg-danger-soft"
                aria-label={t("common.remove")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <Textarea
              value={f.a}
              onChange={(e) => set(i, { a: e.target.value })}
              placeholder={t("admin.faqAnswer")}
              rows={2}
              lang={lang}
              className={`mt-1.5 min-h-16 text-sm ${hi ? "font-[var(--font-devanagari)]" : ""}`}
            />
          </div>
        ))}
      </div>
      <Button type="button" size="sm" variant="ghost" className="mt-1.5" icon={<Plus className="h-4 w-4" />} onClick={() => onChange([...items, { q: "", a: "" }])}>
        {t("admin.addFaq")}
      </Button>
    </div>
  );
}
