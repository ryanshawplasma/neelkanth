"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
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

  const dirty = useMemo(() => Object.values(local).some((v) => v !== ""), [local]);

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
      {fields.map((f) => {
        if (f.type === "search") {
          return (
            <div key={f.name} className={cn("relative min-w-56 flex-1", f.className)}>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={local[f.name] ?? ""}
                onChange={(e) => setLocal({ ...local, [f.name]: e.target.value })}
                placeholder={f.placeholder ?? t("admin.searchPlaceholder")}
                className="h-9 pl-9 text-sm"
                aria-label={t("common.search")}
              />
            </div>
          );
        }
        if (f.type === "select") {
          return (
            <label key={f.name} className={cn("block", f.className)}>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted">{f.label}</span>
              <Select value={local[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} className="h-9 min-w-36 text-sm">
                <option value="">{f.allLabel ?? t("common.all")}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </label>
          );
        }
        return (
          <label key={f.name} className={cn("block", f.className)}>
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted">{f.label}</span>
            <Input type="date" value={local[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} className="h-9 w-40 text-sm" />
          </label>
        );
      })}
      <Button type="submit" size="sm" variant="outline" loading={pending} icon={<Search className="h-4 w-4" />}>
        {t("common.search")}
      </Button>
      {dirty && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => apply(Object.fromEntries(Object.keys(local).map((k) => [k, ""])))}
          icon={<X className="h-4 w-4" />}
        >
          {t("admin.clearFilters")}
        </Button>
      )}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </form>
  );
}
