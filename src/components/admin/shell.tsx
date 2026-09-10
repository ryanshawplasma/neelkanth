"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Banknote,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  ExternalLink,
  Flame,
  Image as ImageIcon,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Search,
  Settings,
  Sparkles,
  Star,
  TicketPercent,
  UserCheck,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/misc";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useT } from "@/i18n/client";
import { logoutAction } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

const ICONS = {
  overview: LayoutDashboard,
  bookings: CalendarCheck,
  consultations: Sparkles,
  payments: CreditCard,
  payouts: Banknote,
  users: Users,
  pandits: UserCheck,
  reviews: Star,
  services: Flame,
  categories: LayoutGrid,
  temples: Landmark,
  festivals: CalendarDays,
  content: BookOpen,
  banners: ImageIcon,
  coupons: TicketPercent,
  notifications: Bell,
  settings: Settings,
  audit: ScrollText,
} as const;

type NavItem = { href: string; key: keyof typeof ICONS; badge?: number };
type NavGroup = { titleKey: string; items: NavItem[] };

const NAV: NavGroup[] = [
  { titleKey: "admin.navOverview", items: [{ href: "/admin", key: "overview" }] },
  {
    titleKey: "admin.navOperations",
    items: [
      { href: "/admin/bookings", key: "bookings" },
      { href: "/admin/consultations", key: "consultations" },
      { href: "/admin/payments", key: "payments" },
      { href: "/admin/payouts", key: "payouts" },
    ],
  },
  {
    titleKey: "admin.navPeople",
    items: [
      { href: "/admin/users", key: "users" },
      { href: "/admin/pandits", key: "pandits" },
      { href: "/admin/reviews", key: "reviews" },
    ],
  },
  {
    titleKey: "admin.navCatalog",
    items: [
      { href: "/admin/services", key: "services" },
      { href: "/admin/categories", key: "categories" },
      { href: "/admin/temples", key: "temples" },
      { href: "/admin/festivals", key: "festivals" },
      { href: "/admin/content", key: "content" },
      { href: "/admin/banners", key: "banners" },
      { href: "/admin/coupons", key: "coupons" },
    ],
  },
  { titleKey: "admin.navEngage", items: [{ href: "/admin/notifications", key: "notifications" }] },
  {
    titleKey: "admin.navSystem",
    items: [
      { href: "/admin/settings", key: "settings" },
      { href: "/admin/audit", key: "audit" },
    ],
  },
];

const LABEL_KEY: Record<keyof typeof ICONS, string> = {
  overview: "admin.navOverviewItem",
  bookings: "admin.navBookings",
  consultations: "admin.navConsultations",
  payments: "admin.navPayments",
  payouts: "admin.navPayouts",
  users: "admin.navUsers",
  pandits: "admin.navPandits",
  reviews: "admin.navReviews",
  services: "admin.navServices",
  categories: "admin.navCategories",
  temples: "admin.navTemples",
  festivals: "admin.navFestivals",
  content: "admin.navContent",
  banners: "admin.navBanners",
  coupons: "admin.navCoupons",
  notifications: "admin.navNotifications",
  settings: "admin.navSettings",
  audit: "admin.navAudit",
};

const STORAGE_KEY = "dd_admin_sidebar";

export function AdminShell({
  children,
  user,
  pendingKyc,
  q,
}: {
  children: ReactNode;
  user: { name: string | null; email: string | null; avatarUrl: string | null };
  pendingKyc: number;
  q?: string;
}) {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(q ?? "");

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="flex min-h-dvh bg-background">
      <aside
        className={cn(
          "sticky top-0 z-40 flex h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className={cn("flex h-14 items-center gap-2 border-b border-border px-3", collapsed && "justify-center px-0")}>
          <Link href="/admin" className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-kesari text-sm font-bold text-white">ॐ</span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold leading-tight">{t("common.appName")}</span>
                <span className="block truncate text-[10px] uppercase tracking-wide text-muted">{t("admin.consoleTitle")}</span>
              </span>
            )}
          </Link>
        </div>

        <nav className="hide-scrollbar flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((group) => (
            <div key={group.titleKey} className="mb-3">
              {!collapsed && <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">{t(group.titleKey)}</p>}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = ICONS[item.key];
                  const active = isActive(item.href);
                  const badge = item.key === "pandits" && pendingKyc > 0 ? pendingKyc : undefined;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? t(LABEL_KEY[item.key]) : undefined}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                          active ? "bg-primary-soft font-semibold text-primary-700" : "text-foreground hover:bg-surface-2",
                          collapsed && "justify-center px-0",
                        )}
                      >
                        <Icon className={cn("h-4.5 w-4.5 shrink-0", active ? "text-primary" : "text-muted group-hover:text-foreground")} />
                        {!collapsed && <span className="min-w-0 flex-1 truncate">{t(LABEL_KEY[item.key])}</span>}
                        {badge !== undefined && (
                          <span
                            className={cn(
                              "rounded-full bg-danger px-1.5 text-[10px] font-bold leading-4 text-white",
                              collapsed && "absolute ml-6 -translate-y-3",
                            )}
                          >
                            {badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={toggle}
          className="flex h-11 items-center justify-center gap-2 border-t border-border text-xs font-medium text-muted hover:bg-surface-2"
          aria-label={collapsed ? t("admin.expandSidebar") : t("admin.collapseSidebar")}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && t("admin.collapseSidebar")}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur">
          <form
            className="relative max-w-md flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/admin/search?q=${encodeURIComponent(search)}`);
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.globalSearchPlaceholder")}
              aria-label={t("admin.globalSearch")}
              className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>

          <LanguageSwitch />

          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-2 sm:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("admin.openApp")}
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              className="flex items-center gap-2 rounded-full p-0.5 hover:bg-surface-2"
              aria-label={t("admin.accountMenu")}
              aria-expanded={menu}
            >
              <Avatar src={user.avatarUrl} name={user.name ?? user.email ?? "A"} size={32} />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-lg">
                  <div className="px-2.5 py-2">
                    <p className="truncate text-sm font-semibold">{user.name ?? t("admin.administrator")}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <Link href="/admin/settings" onClick={() => setMenu(false)} className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm hover:bg-surface-2">
                    <Settings className="h-4 w-4 text-muted" />
                    {t("common.settings")}
                  </Link>
                  <form action={() => logoutAction("/admin/login")}>
                    <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm text-danger hover:bg-danger-soft">
                      <LogOut className="h-4 w-4" />
                      {t("common.logout")}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
