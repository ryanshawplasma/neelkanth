"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, CalendarClock, CircleUserRound, Flower2, LayoutDashboard, NotebookPen, Star, Wallet } from "lucide-react";
import { useT } from "@/i18n/client";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { AccountAvatarButton, type SwitcherCurrent } from "@/components/accounts/account-switcher";
import { cn } from "@/lib/utils";

export type ShellUser = {
  name: string;
  photoUrl: string | null;
  unread: number;
  verified: boolean;
  isActive: boolean;
  /** Signed-in account, for the account switcher. */
  account: SwitcherCurrent;
};

const NAV = [
  { href: "/pandit/dashboard", key: "navDashboard", icon: LayoutDashboard },
  { href: "/pandit/bookings", key: "navBookings", icon: NotebookPen },
  { href: "/pandit/services", key: "navServices", icon: Flower2 },
  { href: "/pandit/availability", key: "navAvailability", icon: CalendarClock },
  { href: "/pandit/earnings", key: "navEarnings", icon: Wallet },
  { href: "/pandit/profile", key: "navProfile", icon: CircleUserRound },
] as const;

const SIDEBAR_EXTRA = [{ href: "/pandit/reviews", key: "navReviews", icon: Star }] as const;

function useIsActive() {
  const pathname = usePathname() || "";
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

export function PanditShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  const t = useT();
  const isActive = useIsActive();

  return (
    <div className="min-h-full bg-devotional">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5">
          <Link href="/pandit/dashboard" className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-maroon text-lg leading-none text-white shadow-sm">ॐ</span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold leading-tight tracking-tight">{t("common.appName")}</span>
              <span className="block truncate text-[11px] leading-tight text-muted">{t("pandit.portalTitle")}</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <LanguageSwitch />
            <Link href="/pandit/notifications" className="relative rounded-full p-2 text-foreground hover:bg-surface-2" aria-label={t("pandit.navNotifications")}>
              <Bell className="h-5 w-5" />
              {user.unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {user.unread > 9 ? "9+" : user.unread}
                </span>
              )}
            </Link>
            <AccountAvatarButton area="pandit" current={{ ...user.account, name: user.name, avatarUrl: user.photoUrl }} size={34}>
              <span
                className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface", user.isActive ? "bg-success" : "bg-muted")}
                title={user.isActive ? t("pandit.acceptingBookings") : t("pandit.notAccepting")}
              />
            </AccountAvatarButton>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl">
        <aside className="sticky top-[57px] hidden h-[calc(100dvh-57px)] w-56 shrink-0 border-r border-border px-2 py-4 md:block">
          <nav className="flex flex-col gap-0.5">
            {[...NAV, ...SIDEBAR_EXTRA].map((item) => {
              const on = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    on ? "bg-primary-soft text-primary-700" : "text-muted hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {t(`pandit.${item.key}`)}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 border-t border-border px-3 pt-4">
            <Link href="/" className="text-xs text-muted hover:text-primary">
              ← {t("pandit.devoteeApp")}
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-[74px] md:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-safe backdrop-blur md:hidden">
        <ul className="flex items-stretch">
          {NAV.map((item) => {
            const on = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn("flex flex-col items-center gap-0.5 px-0.5 pb-1 pt-2 text-[9.5px] font-medium transition-colors", on ? "text-primary" : "text-muted")}
                >
                  <Icon className={cn("h-5 w-5", on && "fill-primary/15")} />
                  <span className="w-full truncate text-center leading-tight">{t(`pandit.${item.key}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Page heading used at the top of every portal screen. */
export function PortalHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-5">
      <div className="min-w-0">
        <h1 className="text-xl font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
