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
  ArrowLeftRight,
  Menu,
  MessageCircle,
  MoreHorizontal,
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
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/misc";
import { AccountAvatarButton, RoleBadge, SwitchAccountTrigger, type SwitcherCurrent } from "@/components/accounts/account-switcher";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

const ICONS = {
  overview: LayoutDashboard,
  bookings: CalendarCheck,
  support: MessageCircle,
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

type NavKey = keyof typeof ICONS;
type NavItem = { href: string; key: NavKey };
type NavGroup = { titleKey: string; items: NavItem[] };
type Badges = Partial<Record<NavKey, number>>;

const NAV: NavGroup[] = [
  { titleKey: "admin.navOverview", items: [{ href: "/admin", key: "overview" }] },
  {
    titleKey: "admin.navOperations",
    items: [
      { href: "/admin/bookings", key: "bookings" },
      { href: "/admin/support", key: "support" },
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

const LABEL_KEY: Record<NavKey, string> = {
  overview: "admin.navOverviewItem",
  bookings: "admin.navBookings",
  support: "admin.navSupport",
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

/** Phone bottom bar: the four most-used destinations plus "More" (opens the drawer). */
const BOTTOM: { href: string; key: NavKey; labelKey: string }[] = [
  { href: "/admin", key: "overview", labelKey: "admin.navHome" },
  { href: "/admin/bookings", key: "bookings", labelKey: "admin.navBookings" },
  { href: "/admin/support", key: "support", labelKey: "admin.navSupport" },
  { href: "/admin/pandits", key: "pandits", labelKey: "admin.navPandits" },
];

const STORAGE_KEY = "dd_admin_sidebar";

export function AdminShell({
  children,
  account,
  pendingKyc,
  supportUnread = 0,
}: {
  children: ReactNode;
  /** Signed-in admin, for the account switcher. */
  account: SwitcherCurrent;
  pendingKyc: number;
  supportUnread?: number;
}) {
  const t = useT();
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [search, setSearch] = useState("");

  const badges: Badges = { pandits: pendingKyc, support: supportUnread };

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  // Navigating closes the drawer and the phone search row.
  useEffect(() => {
    setDrawer(false);
    setMobileSearch(false);
  }, [pathname]);

  // Drawer: Escape closes it, the page behind does not scroll, and widening to desktop closes it.
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onWide = () => mq.matches && setDrawer(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
      document.body.style.overflow = prev;
    };
  }, [drawer]);

  function toggleCollapsed() {
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

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/admin/search?q=${encodeURIComponent(q)}` : "/admin/search");
  };
  const onBottomItem = BOTTOM.some((b) => isActive(b.href));

  return (
    <div className="flex min-h-dvh bg-background">
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className={cn("flex h-14 items-center gap-2 border-b border-border px-3", collapsed && "justify-center px-0")}>
          <Brand compact={collapsed} />
        </div>
        <NavList collapsed={collapsed} badges={badges} isActive={isActive} />
        <button
          type="button"
          onClick={toggleCollapsed}
          className="flex h-11 items-center justify-center gap-2 border-t border-border text-xs font-medium text-muted hover:bg-surface-2"
          aria-label={collapsed ? t("admin.expandSidebar") : t("admin.collapseSidebar")}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && t("admin.collapseSidebar")}
        </button>
      </aside>

      {/* ── Phone / tablet drawer ── */}
      {drawer && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label={t("admin.navMore")}>
          <div className="absolute inset-0 bg-black/45" onClick={() => setDrawer(false)} />
          <aside className="animate-drawer-in absolute inset-y-0 left-0 flex w-[84vw] max-w-[310px] flex-col bg-surface shadow-2xl">
            <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
              <Brand />
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="ml-auto rounded-full p-2 text-muted hover:bg-surface-2"
                aria-label={t("admin.closeMenu")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList collapsed={false} badges={badges} isActive={isActive} large />
            <div className="shrink-0 border-t border-border p-3 pb-safe">
              <DrawerAccount account={account} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-2.5 sm:px-4">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="rounded-xl p-2 text-foreground hover:bg-surface-2 lg:hidden"
              aria-label={t("admin.openMenu")}
              aria-expanded={drawer}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 lg:hidden">
              <Brand compact />
            </div>

            <form className="relative hidden max-w-md flex-1 sm:block" onSubmit={submitSearch}>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.globalSearchPlaceholder")}
                aria-label={t("admin.globalSearch")}
                className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </form>

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setMobileSearch((v) => !v)}
                className={cn("rounded-full p-2 hover:bg-surface-2 sm:hidden", mobileSearch ? "text-primary" : "text-foreground")}
                aria-label={t("admin.globalSearch")}
                aria-expanded={mobileSearch}
              >
                <Search className="h-5 w-5" />
              </button>
              <LanguageSwitch />
              <Link
                href="/"
                className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-2 md:inline-flex"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t("admin.openApp")}
              </Link>
              <AccountAvatarButton area="admin" current={account} />
            </div>
          </div>

          {mobileSearch && (
            <form className="relative border-t border-border px-2.5 py-2 sm:hidden" onSubmit={submitSearch}>
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.globalSearchPlaceholder")}
                aria-label={t("admin.globalSearch")}
                enterKeyHint="search"
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-[16px] placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </form>
          )}
        </header>

        <main className="min-w-0 flex-1 p-4 pb-24 md:pb-6 lg:p-6">{children}</main>
      </div>

      {/* ── Phone bottom bar ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-safe backdrop-blur md:hidden"
        aria-label={t("admin.consoleTitle")}
      >
        <ul className="flex items-stretch">
          {BOTTOM.map((item) => {
            const Icon = ICONS[item.key];
            const on = isActive(item.href);
            const badge = badges[item.key];
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 px-0.5 pb-1 pt-2 text-[10.5px] font-medium",
                    on ? "text-primary" : "text-muted",
                  )}
                >
                  <span className="relative">
                    <Icon className={cn("h-5 w-5", on && "fill-primary/15")} />
                    {!!badge && badge > 0 && <CountBadge n={badge} className="absolute -right-2.5 -top-1.5" />}
                  </span>
                  <span className="w-full truncate text-center leading-tight">{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-expanded={drawer}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 px-0.5 pb-1 pt-2 text-[10.5px] font-medium",
                !onBottomItem ? "text-primary" : "text-muted",
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="w-full truncate text-center leading-tight">{t("admin.navMore")}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  const t = useT();
  return (
    <Link href="/admin" className="flex min-w-0 items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-kesari text-sm font-bold text-white">ॐ</span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold leading-tight">{t("common.appName")}</span>
          <span className="block truncate text-[10px] uppercase tracking-wide text-muted">{t("admin.consoleTitle")}</span>
        </span>
      )}
    </Link>
  );
}

function NavList({
  collapsed,
  badges,
  isActive,
  large,
}: {
  collapsed: boolean;
  badges: Badges;
  isActive: (href: string) => boolean;
  large?: boolean;
}) {
  const t = useT();
  return (
    <nav className="hide-scrollbar flex-1 overflow-y-auto overscroll-contain px-2 py-3">
      {NAV.map((group) => (
        <div key={group.titleKey} className="mb-3">
          {!collapsed && <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">{t(group.titleKey)}</p>}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.key];
              const active = isActive(item.href);
              const badge = badges[item.key];
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? t(LABEL_KEY[item.key]) : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-xl px-2.5 text-sm transition-colors",
                      large ? "py-2.5" : "py-2",
                      active ? "bg-primary-soft font-semibold text-primary-700" : "text-foreground hover:bg-surface-2",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className={cn("h-4.5 w-4.5 shrink-0", active ? "text-primary" : "text-muted group-hover:text-foreground")} />
                    {!collapsed && <span className="min-w-0 flex-1 truncate">{t(LABEL_KEY[item.key])}</span>}
                    {!!badge && badge > 0 && <CountBadge n={badge} className={cn(collapsed && "absolute right-1 top-0.5")} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function CountBadge({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn("min-w-4 rounded-full bg-danger px-1 text-center text-[10px] font-bold leading-4 text-white", className)}>
      {n > 99 ? "99+" : n}
    </span>
  );
}

/** Bottom of the phone drawer: who is signed in, switch account, and a link to the devotee app. */
function DrawerAccount({ account }: { account: SwitcherCurrent }) {
  const t = useT();
  return (
    <>
      <div className="flex items-center gap-2.5">
        <Avatar src={account.avatarUrl} name={account.name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{account.name}</p>
          {account.detail && <p className="truncate text-xs text-muted">{account.detail}</p>}
        </div>
        <RoleBadge role={account.role} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <SwitchAccountTrigger
          area="admin"
          current={account}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary-soft text-xs font-semibold text-primary-700 hover:bg-primary-soft/70"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {t("common.switchAccount")}
        </SwitchAccountTrigger>
        <Link href="/" className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-surface-2">
          <ExternalLink className="h-3.5 w-3.5" />
          {t("admin.openApp")}
        </Link>
      </div>
    </>
  );
}
