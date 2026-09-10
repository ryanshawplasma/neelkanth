"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

export type FilterGroup = { key: string; label: string; options: { value: string; label: string }[] };

/**
 * Search box + chip filter rows + sort. Everything lives in the URL query string so the
 * server component above re-renders with fresh data.
 */
export function ListControls({
  groups,
  sorts,
  placeholder,
  showSearch = true,
}: {
  groups: FilterGroup[];
  sorts?: { value: string; label: string }[];
  placeholder?: string;
  showSearch?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const first = useRef(true);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };

  // debounce the search box
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = setTimeout(() => setParam("q", q.trim() || null), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const activeCount = groups.filter((g) => params.get(g.key)).length;

  return (
    <div className="sticky top-[57px] z-20 border-b border-border bg-background/95 pb-2 backdrop-blur">
      {showSearch && (
        <div className="px-4 pt-3">
          <div className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-surface px-3.5">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder ?? t("common.searchPlaceholder")}
              aria-label={t("common.search")}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label={t("common.close")} className="text-muted">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="hide-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-4">
        {groups.map((g) => {
          const value = params.get(g.key) ?? "";
          return (
            <label key={g.key} className="relative shrink-0">
              <span className="sr-only">{g.label}</span>
              <select
                value={value}
                onChange={(e) => setParam(g.key, e.target.value || null)}
                className={cn(
                  "h-8 appearance-none rounded-full border py-0 pl-3 pr-7 text-[12.5px] font-medium outline-none",
                  value ? "border-primary bg-primary-soft text-primary-700" : "border-border bg-surface text-foreground",
                )}
              >
                <option value="">{g.label}</option>
                {g.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted">▾</span>
            </label>
          );
        })}

        {sorts && sorts.length > 0 && (
          <label className="relative shrink-0">
            <span className="sr-only">{t("app.sortBy")}</span>
            <select
              value={params.get("sort") ?? ""}
              onChange={(e) => setParam("sort", e.target.value || null)}
              className={cn(
                "h-8 appearance-none rounded-full border py-0 pl-7 pr-7 text-[12.5px] font-medium outline-none",
                params.get("sort") ? "border-primary bg-primary-soft text-primary-700" : "border-border bg-surface text-foreground",
              )}
            >
              <option value="">{t("app.sortBy")}</option>
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted" />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted">▾</span>
          </label>
        )}

        {(activeCount > 0 || params.get("sort") || params.get("q")) && (
          <button
            onClick={() => router.replace(pathname, { scroll: false })}
            className="h-8 shrink-0 rounded-full border border-border bg-surface px-3 text-[12.5px] font-medium text-danger"
          >
            {t("app.clearFilters")}
          </button>
        )}
      </div>
    </div>
  );
}

/** Simple one-row chip selector that writes a single query param. */
export function ChipFilter({ param, options, allLabel }: { param: string; options: { value: string; label: string }[]; allLabel: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get(param) ?? "";

  const go = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(param);
    else next.set(param, value);
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };

  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5">
      {[{ value: "", label: allLabel }, ...options].map((o) => (
        <button
          key={o.value || "all"}
          onClick={() => go(o.value)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
            current === o.value ? "border-primary bg-primary-soft text-primary-700" : "border-border bg-surface text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
