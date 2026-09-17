"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BellOff, CalendarHeart, Gift, Info, MessageCircle, Package, Star } from "lucide-react";
import { useLoc, useLocale, useT } from "@/i18n/client";
import { EmptyState } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/app/helpers";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/app/misc-actions";
import { BackButton } from "./bits";

export type NotificationRow = {
  id: string;
  type: string;
  titleEn: string;
  titleHi: string;
  bodyEn: string | null;
  bodyHi: string | null;
  href: string | null;
  imageUrl: string | null;
  read: boolean;
  createdAt: string;
};

const ICONS: Record<string, typeof Info> = {
  FESTIVAL_REMINDER: CalendarHeart,
  BOOKING_UPDATE: Package,
  PROMO: Gift,
  KYC: Star,
  PANCHANG: CalendarHeart,
  SYSTEM: Info,
  SUPPORT: MessageCircle,
};

export function NotificationsList({ items }: { items: NotificationRow[] }) {
  const t = useT();
  const loc = useLoc();
  const locale = useLocale();
  const router = useRouter();
  const [rows, setRows] = useState(items);
  const [, start] = useTransition();

  const unread = rows.filter((r) => !r.read).length;

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface/95 px-3 py-2.5 backdrop-blur">
        <BackButton className="bg-transparent shadow-none" />
        <h1 className="flex-1 truncate text-[15px] font-semibold">{t("app.notificationsTitle")}</h1>
        {unread > 0 && (
          <button
            onClick={() =>
              start(async () => {
                setRows((xs) => xs.map((x) => ({ ...x, read: true })));
                await markAllNotificationsReadAction();
                router.refresh();
              })
            }
            className="shrink-0 text-[12.5px] font-semibold text-primary"
          >
            {t("app.markAllRead")}
          </button>
        )}
      </header>

      {rows.length === 0 ? (
        <EmptyState icon={<BellOff className="h-6 w-6" />} title={t("app.allCaughtUp")} hint={t("app.allCaughtUpHint")} />
      ) : (
        <ul className="divide-y divide-border animate-fade-up">
          {rows.map((n) => {
            const Icon = ICONS[n.type] ?? Info;
            return (
              <li key={n.id}>
                <button
                  onClick={() => {
                    setRows((xs) => xs.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                    start(async () => {
                      await markNotificationReadAction(n.id);
                      if (n.href) router.push(n.href);
                      else router.refresh();
                    });
                  }}
                  className={cn("flex w-full items-start gap-3 px-4 py-3.5 text-left", !n.read && "bg-primary-soft/40")}
                >
                  <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", n.read ? "bg-surface-2 text-muted" : "bg-primary-soft text-primary")}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className={cn("flex-1 text-[13.5px] leading-snug", n.read ? "font-medium" : "font-semibold")}>{loc(n, "title")}</span>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </span>
                    {loc(n, "body") && <span className="mt-0.5 block text-[12px] leading-snug text-muted">{loc(n, "body")}</span>}
                    <span className="mt-1 block text-[11px] text-muted">{relativeTime(n.createdAt, locale)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
