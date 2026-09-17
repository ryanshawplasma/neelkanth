"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Flower2, Home, MapPin, Sparkles, User } from "lucide-react";
import type { ReactNode } from "react";
import { useT } from "@/i18n/client";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { cn } from "@/lib/utils";

/** Routes that get no app chrome at all (own full-screen layout). */
const BARE = ["/login", "/onboarding"];
/** Inner screens that bring their own PageHeader. */
const NO_TOPBAR = ["/pooja/", "/chadhava/", "/prasad/", "/temple/", "/festivals/", "/library/", "/bookings/", "/pandits/", "/checkout/", "/search", "/notifications", "/legal/", "/support"];
/** Screens with a sticky CTA where the bottom nav would be in the way. */
const NO_BOTTOMNAV = ["/checkout/", "/pooja/", "/chadhava/", "/prasad/", "/temple/", "/library/", "/festivals/", "/bookings/", "/pandits/", "/support"];

const startsWithAny = (path: string, list: string[]) => list.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p || path.startsWith(p + "?")));

export function AppChrome({ children, city, unread, isLoggedIn }: { children: ReactNode; city: string; unread: number; isLoggedIn: boolean }) {
  const pathname = usePathname() || "/";
  const bare = BARE.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const showTop = !bare && !startsWithAny(pathname, NO_TOPBAR);
  const showNav = !bare && !startsWithAny(pathname, NO_BOTTOMNAV);

  return (
    <>
      {showTop && <TopBar city={city} unread={unread} isLoggedIn={isLoggedIn} />}
      <main className={cn("flex-1", showNav && "pb-[76px]")}>{children}</main>
      {showNav && <BottomNav />}
    </>
  );
}

function TopBar({ city, unread, isLoggedIn }: { city: string; unread: number; isLoggedIn: boolean }) {
  const t = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Link href="/" className="flex shrink-0 items-center" aria-label={t("common.appName")}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-kesari text-lg leading-none text-white shadow-sm">ॐ</span>
        </Link>
        <div className="min-w-0">
          <Link href="/" className="block truncate text-[15px] font-bold leading-tight tracking-tight">
            {t("common.appName")}
          </Link>
          <Link href="/panchang" className="flex items-center gap-0.5 text-[11px] leading-tight text-muted hover:text-primary">
            <MapPin className="h-3 w-3" />
            <span className="max-w-[110px] truncate">{city}</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <LanguageSwitch />
          <Link
            href={isLoggedIn ? "/notifications" : "/login?next=%2Fnotifications"}
            className="relative rounded-full p-2 text-foreground hover:bg-surface-2"
            aria-label={t("common.notifications")}
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const t = useT();
  const pathname = usePathname() || "/";
  const items = [
    { href: "/", label: t("common.home"), icon: Home, exact: true },
    { href: "/poojas", label: t("common.poojas"), icon: Flower2 },
    { href: "/chadhava", label: t("common.chadhava"), icon: Sparkles },
    { href: "/panchang", label: t("common.panchang"), icon: CalendarDays },
    { href: "/account", label: t("common.account"), icon: User },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-surface/95 pb-safe backdrop-blur">
      <ul className="flex items-stretch">
        {items.map((it) => {
          const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/");
          const Icon = it.icon;
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={cn("flex flex-col items-center gap-0.5 px-1 pt-2 pb-1 text-[10.5px] font-medium transition-colors", active ? "text-primary" : "text-muted")}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "fill-primary/15")} />
                <span className="truncate">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
