"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";
import { qs } from "@/lib/admin/util";
import { cn } from "@/lib/utils";

export type FilterField =
  | { name: string; type: "search"; placeholder?: string; className?: string }
  | { name: string; type: "select"; label: string; options: { value: string; label: string }[]; allLabel?: string; className?: string }
  | { name: string; type: "date"; label: string; className?: string };

/**
 * URL-driven filters: every change pushes `?a=…&b=…&page=1` so lists stay
 * server-rendered and bookmarkable. Current values come from the page.
 *
 * Phones (below sm): fields sit two to a row with 16px text (no iOS focus
 * zoom). When the bar starts with a search box followed by two or more
 * filters, those filters fold behind a "Filter" toggle next to the search box.
 */
export function FilterBar({
  basePath,
  values,
  fields,
  right,
  className,
}: {
  basePath: string;
  values: Record<string, string>;
  fields: FilterField[];
  right?: React.ReactNode;
  className?: string;
}) {
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [local, setLocal] = useState<Record<string, string>>(values);
  const [open, setOpen] = useState(false);

  const dirty = useMemo(() => Object.values(local).some((v) => v !== ""), [local]);

  const leadSearch = fields[0]?.type === "search";
  const foldable = leadSearch && fields.length > 2;
  const folded = foldable && !open;
  const activeFilters = fields.slice(1).filter((f) => (local[f.name] ?? "") !== "").length;

  /**
   * Phone-only sizing: the lead search fills its row (or shares it with the toggle — its 55% floor
   * pushes the half-width fields onto the next row); every other field takes half a row.
   */
  const phoneField = (i: number) =>
    i === 0 && leadSearch
      ? foldable
        ? "max-sm:min-w-[55%]"
        : "max-sm:basis-full"
      : cn("max-sm:w-[calc(50%-0.25rem)] max-sm:min-w-0 max-sm:max-w-none max-sm:flex-none", folded && "max-sm:hidden");

  function apply(next: Record<string, string>) {
    setLocal(next);
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(next)) if (v) clean[k] = v;
    const size = values.size ?? "";
    start(() => router.push(`${basePath}${qs({ ...clean, page: 1, size: size || undefined })}`));
  }

  function set(name: string, value: string) {
    apply({ ...local, [name]: value });
  }

  return (
    <form
      className={cn("mb-3 flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow)]", className)}
      onSubmit={(e) => {
        e.preventDefault();
        apply(local);
      }}
    >
      {fields.map((f, i) => {
        let field: React.ReactNode;
        if (f.type === "search") {
          field = (
            <div key={f.name} className={cn("relative min-w-56 flex-1", f.className, phoneField(i))}>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                enterKeyHint="search"
                value={local[f.name] ?? ""}
                onChange={(e) => setLocal({ ...local, [f.name]: e.target.value })}
                placeholder={f.placeholder ?? t("admin.searchPlaceholder")}
                className="h-9 pl-9 text-sm max-sm:h-10 max-sm:text-base"
                aria-label={t("common.search")}
              />
            </div>
          );
        } else if (f.type === "select") {
          field = (
            <label key={f.name} className={cn("block", f.className, phoneField(i))}>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted">{f.label}</span>
              <Select
                value={local[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                className="h-9 min-w-36 text-sm max-sm:h-10 max-sm:min-w-0 max-sm:text-base"
              >
                <option value="">{f.allLabel ?? t("common.all")}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </label>
          );
        } else {
          field = (
            <label key={f.name} className={cn("block", f.className, phoneField(i))}>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted">{f.label}</span>
              <Input
                type="date"
                value={local[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                className="h-9 w-40 text-sm max-sm:h-10 max-sm:w-full max-sm:px-2.5 max-sm:text-base"
              />
            </label>
          );
        }
        if (i > 0 || !foldable) return field;
        return [
          field,
          <Button
            key="__filters"
            type="button"
            size="sm"
            variant={open ? "secondary" : "outline"}
            className="h-10 sm:hidden"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            icon={<SlidersHorizontal className="h-4 w-4" />}
          >
            {t("common.filter")}
            {activeFilters > 0 && (
              <span className="min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-4 text-white">{activeFilters}</span>
            )}
          </Button>,
        ];
      })}
      <Button
        type="submit"
        size="sm"
        variant="outline"
        loading={pending}
        icon={<Search className="h-4 w-4" />}
        className={cn("max-sm:h-10", folded && "max-sm:hidden")}
      >
        {t("common.search")}
      </Button>
      {dirty && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => apply(Object.fromEntries(Object.keys(local).map((k) => [k, ""])))}
          icon={<X className="h-4 w-4" />}
          className={cn("max-sm:h-10", folded && "max-sm:hidden")}
        >
          {t("admin.clearFilters")}
        </Button>
      )}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </form>
  );
}
