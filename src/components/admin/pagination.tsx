import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/utils";
import { PAGE_SIZES, flatten, qs, type SearchParams } from "@/lib/admin/util";

/**
 * `?page=&size=` pagination. Server component: renders plain links so the list
 * stays fully server-rendered and shareable.
 */
export async function Pagination({
  basePath,
  params,
  page,
  pages,
  total,
  size,
}: {
  basePath: string;
  params: SearchParams;
  page: number;
  pages: number;
  total: number;
  size: number;
}) {
  const { t } = await getT();
  const base = flatten(params);
  const link = (next: Record<string, string | number>) => `${basePath}${qs({ ...base, ...next })}`;

  const pageWindow: number[] = [];
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  for (let i = start; i <= Math.min(pages, start + 4); i++) pageWindow.push(i);

  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(total, page * size);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted">{t("admin.showingRange", { from, to, total })}</p>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-muted">
          {t("admin.perPage")}
          <span className="flex overflow-hidden rounded-lg border border-border">
            {PAGE_SIZES.map((s) => (
              <Link
                key={s}
                href={link({ size: s, page: 1 })}
                className={cn("px-2 py-1 text-xs", s === size ? "bg-primary text-white" : "bg-surface hover:bg-surface-2")}
              >
                {s}
              </Link>
            ))}
          </span>
        </label>
        <nav className="flex items-center gap-1" aria-label={t("admin.pagination")}>
          <PageLink href={link({ page: Math.max(1, page - 1) })} disabled={page <= 1} aria-label={t("common.back")}>
            <ChevronLeft className="h-4 w-4" />
          </PageLink>
          {pageWindow.map((p) => (
            <PageLink key={p} href={link({ page: p })} active={p === page}>
              {p}
            </PageLink>
          ))}
          <PageLink href={link({ page: Math.min(pages, page + 1) })} disabled={page >= pages} aria-label={t("common.next")}>
            <ChevronRight className="h-4 w-4" />
          </PageLink>
        </nav>
      </div>
    </div>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "children">) {
  const cls = cn(
    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-medium",
    active ? "border-primary bg-primary text-white" : "border-border bg-surface hover:bg-surface-2",
    disabled && "pointer-events-none opacity-40",
  );
  if (disabled) {
    return (
      <span className={cls} aria-disabled>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
