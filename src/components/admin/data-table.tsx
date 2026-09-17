import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  /** Stable key for React. */
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headClassName?: string;
  align?: "left" | "right" | "center";
  /** Hidden below the lg breakpoint (keeps the console usable on a tablet). */
  hideOnTablet?: boolean;
  /** Hidden below the sm breakpoint, so a phone keeps the identifying column and the status in view. */
  hideOnMobile?: boolean;
};

const alignClass = { left: "text-left", right: "text-right", center: "text-center" } as const;

const hideClass = (c: { hideOnTablet?: boolean; hideOnMobile?: boolean }) =>
  cn(c.hideOnTablet && "hidden lg:table-cell", c.hideOnMobile && "max-sm:hidden");

/** Phones get tighter gutters between columns (the outer edges keep 12px). */
const phoneCellPad = "max-sm:px-2 max-sm:first:pl-3 max-sm:last:pr-3";

/**
 * Dense admin table with a sticky header. Server-component friendly — pass
 * plain cells (links, badges, text). `href` turns the last column into an
 * "open" chevron link so whole-row navigation stays accessible.
 *
 * `maxHeight` caps the table (with a sticky header) from the md breakpoint up;
 * on phones the page itself scrolls instead of a scroll box nested inside it.
 */
export function DataTable<T>({
  columns,
  rows,
  keyOf,
  href,
  empty,
  maxHeight = "calc(100dvh - 19rem)",
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  keyOf: (row: T) => string;
  href?: (row: T) => string;
  empty?: ReactNode;
  maxHeight?: string;
  className?: string;
}) {
  if (!rows.length) {
    return <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">{empty ?? "—"}</div>;
  }
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)]", className)}>
      <div className="overflow-auto md:max-h-[var(--dt-max-h)]" style={{ "--dt-max-h": maxHeight } as CSSProperties}>
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface-2/95 backdrop-blur">
            <tr className="text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap border-b border-border px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted",
                    phoneCellPad,
                    alignClass[c.align ?? "left"],
                    hideClass(c),
                    c.headClassName,
                  )}
                >
                  {c.header}
                </th>
              ))}
              {href && <th className="w-10 border-b border-border" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={keyOf(row)} className="border-b border-border/70 align-middle transition-colors last:border-0 hover:bg-surface-2/60">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-3 py-2.5", phoneCellPad, alignClass[c.align ?? "left"], hideClass(c), c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
                {href && (
                  <td className="px-2 py-2.5 text-right max-sm:pl-0 max-sm:pr-1.5">
                    <Link href={href(row)} className="inline-flex rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-primary max-sm:p-1.5" aria-label="Open">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Two-line table cell: strong primary line + muted secondary line. Narrower below lg so tablets and phones fit more columns. */
export function CellStack({ top, bottom, href }: { top: ReactNode; bottom?: ReactNode; href?: string }) {
  const main = <span className="block truncate font-medium text-foreground">{top}</span>;
  return (
    <div className="min-w-0 max-w-[22rem] max-lg:max-w-[14rem] max-sm:max-w-[9rem]">
      {href ? (
        <Link href={href} className="block truncate font-medium text-foreground hover:text-primary hover:underline">
          {top}
        </Link>
      ) : (
        main
      )}
      {bottom !== undefined && bottom !== null && <span className="mt-0.5 block truncate text-xs text-muted">{bottom}</span>}
    </div>
  );
}

/** Small square thumbnail used in catalog tables. */
export function Thumb({ src, alt, size = 36, className }: { src?: string | null; alt?: string; size?: number; className?: string }) {
  if (!src) {
    return <div className={cn("shrink-0 rounded-lg bg-surface-2", className)} style={{ width: size, height: size }} aria-hidden />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ""} className={cn("shrink-0 rounded-lg border border-border object-cover", className)} style={{ width: size, height: size }} />
  );
}
