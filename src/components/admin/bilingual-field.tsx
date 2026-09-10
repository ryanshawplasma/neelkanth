"use client";

import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * EN / HI pair for a bilingual DB column (`nameEn` / `nameHi`).
 * The Hindi box uses the Devanagari font stack for comfortable authoring.
 */
export function BilingualField({
  label,
  valueEn,
  valueHi,
  onChangeEn,
  onChangeHi,
  textarea,
  rows = 4,
  required,
  placeholderEn,
  placeholderHi,
  hint,
  className,
}: {
  label: string;
  valueEn: string;
  valueHi: string;
  onChangeEn: (v: string) => void;
  onChangeHi: (v: string) => void;
  textarea?: boolean;
  rows?: number;
  required?: boolean;
  placeholderEn?: string;
  placeholderHi?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
          {label}
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">EN</span>
          {required && <span className="text-danger">*</span>}
        </span>
        {textarea ? (
          <Textarea value={valueEn} onChange={(e) => onChangeEn(e.target.value)} rows={rows} placeholder={placeholderEn} />
        ) : (
          <Input value={valueEn} onChange={(e) => onChangeEn(e.target.value)} placeholder={placeholderEn} />
        )}
        {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      </label>
      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
          {label}
          <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-700">हिं</span>
          {required && <span className="text-danger">*</span>}
        </span>
        {textarea ? (
          <Textarea
            value={valueHi}
            onChange={(e) => onChangeHi(e.target.value)}
            rows={rows}
            placeholder={placeholderHi}
            className="font-[var(--font-devanagari)]"
            lang="hi"
          />
        ) : (
          <Input
            value={valueHi}
            onChange={(e) => onChangeHi(e.target.value)}
            placeholder={placeholderHi}
            className="font-[var(--font-devanagari)]"
            lang="hi"
          />
        )}
      </label>
    </div>
  );
}
