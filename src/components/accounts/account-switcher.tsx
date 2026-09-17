"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  ChevronRight,
  Flower2,
  Home,
  Loader2,
  LogOut,
  Plus,
  ShieldCheck,
  UserRound,
  UserPlus,
  X,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/misc";
import { Badge, type Tone } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { ROLE_LABEL_KEY, type AccountArea, type AccountRole, type DeviceAccount } from "@/lib/account-types";
import { forgetAccountAction, getDeviceAccountsAction, signOutAction, switchAccountAction } from "@/lib/auth-actions";

export type SwitcherCurrent = Omit<DeviceAccount, "current">;

const ROLE_TONE: Record<AccountRole, Tone> = { ADMIN: "maroon", PANDIT: "gold", USER: "muted" };

export function RoleBadge({ role, className }: { role: AccountRole; className?: string }) {
  const t = useT();
  return (
    <Badge tone={ROLE_TONE[role]} className={cn("shrink-0", className)}>
      {t(ROLE_LABEL_KEY[role])}
    </Badge>
  );
}

/** Full navigation to a new identity: drops every client cache that belonged to the old account. */
function go(href: string) {
  window.location.assign(href);
}

/**
 * Account sheet: shortcuts to the areas the current account can open, one-tap switching between
 * accounts signed in on this device, adding another account, and signing out.
 */
export function AccountSwitcherSheet({
  open,
  onClose,
  area,
  current,
}: {
  open: boolean;
  onClose: () => void;
  area: AccountArea;
  current: SwitcherCurrent;
}) {
  const t = useT();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<DeviceAccount[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setAdding(false);
    setBusy(null);
    getDeviceAccountsAction()
      .then((list) => alive && setAccounts(list))
      .catch(() => alive && setAccounts([]));
    return () => {
      alive = false;
    };
  }, [open]);

  const others = (accounts ?? []).filter((a) => !a.current && a.id !== current.id);
  const canPandit = (current.role === "PANDIT" || current.role === "ADMIN") && current.hasPanditProfile;
  const shortcuts: { href: string; label: string; icon: ReactNode }[] = [];
  if (current.role === "ADMIN" && area !== "admin") shortcuts.push({ href: "/admin", label: t("common.adminConsole"), icon: <ShieldCheck className="h-4.5 w-4.5" /> });
  if (canPandit && area !== "pandit") shortcuts.push({ href: "/pandit/dashboard", label: t("common.panditPortal"), icon: <Flower2 className="h-4.5 w-4.5" /> });
  if (area === "pandit") shortcuts.push({ href: "/pandit/profile", label: t("common.panditProfile"), icon: <UserRound className="h-4.5 w-4.5" /> });
  if (area !== "app") shortcuts.push({ href: "/", label: t("common.devoteeApp"), icon: <Home className="h-4.5 w-4.5" /> });
  const offerAdmin = area === "admin" || current.role === "ADMIN" || (accounts ?? []).some((a) => a.role === "ADMIN");

  async function switchTo(uid: string) {
    setBusy(uid);
    const res = await switchAccountAction(uid).catch(() => null);
    if (!res || !res.ok) {
      setBusy(null);
      toast(t(res ? `common.${res.error}` : "common.somethingWrong"), "error");
      setAccounts((list) => list?.filter((a) => a.id !== uid) ?? null);
      return;
    }
    go(res.data!.href);
  }

  async function forget(uid: string) {
    const res = await forgetAccountAction(uid).catch(() => null);
    if (res?.ok) setAccounts((list) => list?.filter((a) => a.id !== uid) ?? null);
    else toast(t(res ? `common.${res.error}` : "common.somethingWrong"), "error");
  }

  async function signOut(scope: "current" | "all") {
    setBusy(`signout:${scope}`);
    const res = await signOutAction(scope, area).catch(() => null);
    if (!res || !res.ok) {
      setBusy(null);
      toast(t("common.somethingWrong"), "error");
      return;
    }
    go(res.data!.href);
  }

  return (
    <Sheet open={open} onClose={onClose} title={t("common.accounts")}>
      <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary-soft/60 p-3">
        <Avatar src={current.avatarUrl} name={current.name} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight">{current.name}</p>
          {current.detail && <p className="mt-0.5 truncate text-xs text-muted">{current.detail}</p>}
        </div>
        <RoleBadge role={current.role} />
      </div>

      {shortcuts.length > 0 && (
        <Section title={t("common.goTo")}>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
            {shortcuts.map((s) => (
              <a key={s.href} href={s.href} className="flex min-h-12 items-center gap-3 px-3.5 py-2.5 text-sm font-medium hover:bg-surface-2">
                <span className="text-primary">{s.icon}</span>
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                <ChevronRight className="h-4 w-4 text-muted" />
              </a>
            ))}
          </div>
        </Section>
      )}

      <Section title={t("common.accountsOnDevice")}>
        <div className="overflow-hidden rounded-2xl border border-border">
          {accounts === null ? (
            <div className="flex h-14 items-center justify-center text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : others.length === 0 ? (
            <p className="px-3.5 py-3 text-[13px] text-muted">{t("common.noOtherAccounts")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {others.map((a) => (
                <li key={a.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => switchTo(a.id)}
                    disabled={!!busy}
                    className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-3.5 py-2.5 text-left hover:bg-surface-2 disabled:opacity-60"
                    aria-label={t("common.continueAs", { name: a.name })}
                  >
                    <Avatar src={a.avatarUrl} name={a.name} size={38} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{a.name}</span>
                      {a.detail && <span className="block truncate text-xs text-muted">{a.detail}</span>}
                    </span>
                    <RoleBadge role={a.role} />
                    {busy === a.id ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <ArrowLeftRight className="h-4 w-4 shrink-0 text-muted" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => forget(a.id)}
                    disabled={!!busy}
                    className="mr-1.5 rounded-full p-2 text-muted hover:bg-surface-2 hover:text-danger disabled:opacity-60"
                    aria-label={t("common.removeFromDevice")}
                    title={t("common.removeFromDevice")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border">
            {!adding ? (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex min-h-12 w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm font-semibold text-primary hover:bg-surface-2"
              >
                <UserPlus className="h-4.5 w-4.5" />
                {t("common.addAccount")}
              </button>
            ) : (
              <div className="p-3">
                <p className="mb-2 text-xs font-medium text-muted">{t("common.addAccountAs")}</p>
                <div className="grid gap-2">
                  <AddOption href="/login?add=1" icon={<Home className="h-4 w-4" />} title={t("common.roleUser")} hint={t("common.addDevoteeHint")} />
                  <AddOption href="/pandit/login?add=1" icon={<Flower2 className="h-4 w-4" />} title={t("common.rolePandit")} hint={t("common.addPanditHint")} />
                  {offerAdmin && (
                    <AddOption href="/admin/login?add=1" icon={<ShieldCheck className="h-4 w-4" />} title={t("common.roleAdmin")} hint={t("common.addAdminHint")} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={() => signOut("current")}
          disabled={!!busy}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-danger/35 text-sm font-semibold text-danger hover:bg-danger-soft disabled:opacity-60"
        >
          {busy === "signout:current" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          {t("common.signOutAccount")}
        </button>
        {others.length > 0 && (
          <button
            type="button"
            onClick={() => signOut("all")}
            disabled={!!busy}
            className="flex h-10 items-center justify-center gap-2 rounded-xl text-[13px] font-medium text-muted hover:bg-surface-2 hover:text-danger disabled:opacity-60"
          >
            {busy === "signout:all" && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.signOutAll")}
          </button>
        )}
      </div>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h4 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</h4>
      {children}
    </section>
  );
}

function AddOption({ href, icon, title, hint }: { href: string; icon: ReactNode; title: string; hint: string }) {
  return (
    <a href={href} className="flex min-h-12 items-center gap-3 rounded-xl border border-border px-3 py-2 hover:border-primary/40 hover:bg-primary-soft/40">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted">{hint}</span>
      </span>
      <Plus className="h-4 w-4 text-muted" />
    </a>
  );
}

/** Avatar button that opens the account sheet (top bars). */
export function AccountAvatarButton({
  area,
  current,
  size = 32,
  className,
  children,
}: {
  area: AccountArea;
  current: SwitcherCurrent;
  size?: number;
  className?: string;
  /** Optional overlay rendered inside the button (e.g. a status dot). */
  children?: ReactNode;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("relative flex shrink-0 items-center rounded-full p-0.5 hover:bg-surface-2", className)}
        aria-label={t("common.accounts")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Avatar src={current.avatarUrl} name={current.name} size={size} />
        {children}
      </button>
      <AccountSwitcherSheet open={open} onClose={() => setOpen(false)} area={area} current={current} />
    </>
  );
}

/** Any element that opens the account sheet (drawer footers, account page rows). */
export function SwitchAccountTrigger({
  area,
  current,
  className,
  children,
}: {
  area: AccountArea;
  current: SwitcherCurrent;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} aria-haspopup="dialog" aria-expanded={open}>
        {children}
      </button>
      <AccountSwitcherSheet open={open} onClose={() => setOpen(false)} area={area} current={current} />
    </>
  );
}

/**
 * Login pages: accounts still signed in on this device, offered as one-tap "Continue as".
 * `to` is where to go afterwards when that account may open it (otherwise its own home).
 */
export function DeviceAccountChooser({ accounts, to, className }: { accounts: DeviceAccount[]; to?: string; className?: string }) {
  const t = useT();
  const { toast } = useToast();
  const [list, setList] = useState(accounts);
  const [busy, setBusy] = useState<string | null>(null);
  if (!list.length) return null;

  async function continueAs(uid: string) {
    setBusy(uid);
    const res = await switchAccountAction(uid, to).catch(() => null);
    if (!res || !res.ok) {
      setBusy(null);
      toast(t(res ? `common.${res.error}` : "common.somethingWrong"), "error");
      setList((l) => l.filter((a) => a.id !== uid));
      return;
    }
    go(res.data!.href);
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow)]", className)}>
      <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{t("common.signedInHere")}</p>
      <ul className="space-y-1">
        {list.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => continueAs(a.id)}
              disabled={!!busy}
              className="flex min-h-13 w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-surface-2 disabled:opacity-60"
            >
              <Avatar src={a.avatarUrl} name={a.name} size={38} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{t("common.continueAs", { name: a.name })}</span>
                {a.detail && <span className="block truncate text-xs text-muted">{a.detail}</span>}
              </span>
              <RoleBadge role={a.role} />
              {busy === a.id ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <ChevronRight className="h-4 w-4 text-muted" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Banner on login pages opened from "Add another account". */
export function AddingAccountBanner({ className }: { className?: string }) {
  const t = useT();
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border border-info/30 bg-info-soft px-3.5 py-3", className)}>
      <UserPlus className="mt-0.5 h-4.5 w-4.5 shrink-0 text-info" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{t("common.addingAccountTitle")}</p>
        <p className="mt-0.5 text-xs text-muted">{t("common.addingAccountHint")}</p>
      </div>
      <button type="button" onClick={() => history.back()} className="-mr-1 -mt-1 rounded-full p-1.5 text-muted hover:bg-surface-2" aria-label={t("common.cancel")}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
