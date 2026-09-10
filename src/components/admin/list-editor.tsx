"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** Editable string list (benefits, process steps, features, tags…). */
export function ListEditor({
  label,
  items,
  onChange,
  placeholder,
  lang,
  addLabel,
  className,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  lang?: "hi" | "en";
  addLabel?: string;
  className?: string;
}) {
  const t = useT();
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className={cn("block", className)}>
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
        {label}
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", lang === "hi" ? "bg-primary-soft text-primary-700" : "bg-surface-2 text-muted")}>
          {lang === "hi" ? "हिं" : "EN"}
        </span>
      </span>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-5 shrink-0 text-center text-xs text-muted">{i + 1}</span>
            <Input
              value={item}
              onChange={(e) => set(i, e.target.value)}
              placeholder={placeholder}
              lang={lang}
              className={cn("h-9 text-sm", lang === "hi" && "font-[var(--font-devanagari)]")}
            />
            <button type="button" onClick={() => move(i, -1)} className="rounded-lg p-1.5 text-muted hover:bg-surface-2" aria-label={t("admin.moveUp")}>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => move(i, 1)} className="rounded-lg p-1.5 text-muted hover:bg-surface-2" aria-label={t("admin.moveDown")}>
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="rounded-lg p-1.5 text-danger hover:bg-danger-soft"
              aria-label={t("common.remove")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <Button type="button" size="sm" variant="ghost" className="mt-1.5" icon={<Plus className="h-4 w-4" />} onClick={() => onChange([...items, ""])}>
        {addLabel ?? t("common.add")}
      </Button>
    </div>
  );
}
