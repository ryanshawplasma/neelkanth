import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { listSupportThreads, type SupportInboxFilter } from "@/lib/support";
import { formatPhone } from "@/lib/account-types";
import { sp, type SearchParams } from "@/lib/admin/util";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { Avatar } from "@/components/ui/misc";
import { AutoRefresh } from "@/components/support/auto-refresh";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Support chat" };

const FILTERS: { value: SupportInboxFilter; key: string }[] = [
  { value: "open", key: "admin.supportFilterOpen" },
  { value: "unread", key: "admin.supportFilterUnread" },
  { value: "resolved", key: "admin.supportFilterResolved" },
  { value: "all", key: "admin.supportFilterAll" },
];

const IST = "Asia/Kolkata";
const istDay = new Intl.DateTimeFormat("en-CA", { timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit" });

function shortWhen(d: Date, locale: "en" | "hi") {
  const tag = locale === "hi" ? "hi-IN" : "en-IN";
  if (istDay.format(d) === istDay.format(new Date())) {
    return new Intl.DateTimeFormat(tag, { timeZone: IST, hour: "numeric", minute: "2-digit" }).format(d);
  }
  return new Intl.DateTimeFormat(tag, { timeZone: IST, day: "numeric", month: "short" }).format(d);
}

export default async function SupportInboxPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const raw = sp(params, "f");
  const filter = (FILTERS.some((f) => f.value === raw) ? raw : "open") as SupportInboxFilter;
  const q = sp(params, "q");
  const { t, locale } = await getT();
  const { threads, counts } = await listSupportThreads({ filter, q });

  const hrefFor = (f: SupportInboxFilter) => `/admin/support?f=${f}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div className="mx-auto max-w-3xl">
      <AutoRefresh ms={15_000} />
      <AdminPageHeader title={t("admin.supportTitle")} subtitle={t("admin.supportSubtitle")} />

      <div className="mb-3 space-y-2">
        <nav className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label={t("admin.supportTitle")}>
          {FILTERS.map((f) => {
            const on = f.value === filter;
            return (
              <Link
                key={f.value}
                href={hrefFor(f.value)}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  on ? "border-primary bg-primary text-white" : "border-border bg-surface text-foreground hover:bg-surface-2",
                )}
              >
                {t(f.key)}
                <span className={cn("rounded-full px-1.5 text-xs leading-5", on ? "bg-white/20" : f.value === "unread" && counts.unread ? "bg-danger text-white" : "bg-surface-2 text-muted")}>
                  {counts[f.value]}
                </span>
              </Link>
            );
          })}
        </nav>

        <form method="get" action="/admin/support" className="relative">
          <input type="hidden" name="f" value={filter} />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={q}
            type="search"
            enterKeyHint="search"
            placeholder={t("admin.supportSearchPlaceholder")}
            aria-label={t("admin.supportSearchPlaceholder")}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </form>
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface px-6 py-14 text-center shadow-[var(--shadow)]">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <MessageCircle className="h-6 w-6" />
          </span>
          <p className="font-semibold">{t("admin.supportEmpty")}</p>
          <p className="mt-1 max-w-xs text-sm text-muted">{t("admin.supportEmptyHint")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)]">
          {threads.map((th) => {
            const phone = formatPhone(th.user.phone);
            const name = th.user.name || phone || th.user.email || "—";
            const unread = th.adminUnread > 0;
            const preview = th.lastMessagePreview ? `${th.lastFromAdmin ? t("admin.supportYouPrefix") : ""}${th.lastMessagePreview}` : t("admin.supportNoMessages");
            return (
              <li key={th.id}>
                <Link href={`/admin/support/${th.id}`} className={cn("flex items-center gap-3 px-3 py-3 hover:bg-surface-2 sm:px-4", unread && "bg-primary-soft/40")}>
                  <Avatar src={th.user.avatarUrl} name={name} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className={cn("min-w-0 flex-1 truncate text-[14.5px]", unread ? "font-bold" : "font-semibold")}>{name}</p>
                      <time dateTime={th.lastMessageAt.toISOString()} className={cn("shrink-0 text-[11.5px]", unread ? "font-semibold text-primary" : "text-muted")}>
                        {shortWhen(th.lastMessageAt, locale)}
                      </time>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className={cn("min-w-0 flex-1 truncate text-[13px]", unread ? "font-medium text-foreground" : "text-muted")}>{preview}</p>
                      {th.status === "RESOLVED" && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label={t("admin.supportStatusResolved")} />}
                      {unread && (
                        <span className="min-w-5 shrink-0 rounded-full bg-danger px-1.5 text-center text-[11px] font-bold leading-5 text-white">
                          {th.adminUnread > 99 ? "99+" : th.adminUnread}
                        </span>
                      )}
                    </div>
                    {(phone || th.user.city) && (
                      <p className="mt-0.5 truncate text-[11.5px] text-muted">{[th.user.name ? phone : null, th.user.city].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
