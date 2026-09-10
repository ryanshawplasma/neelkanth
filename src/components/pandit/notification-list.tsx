"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { BellOff, Check, CheckCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { useLocale, useT } from "@/i18n/client";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/pandit/misc-actions";
import { cn, formatDateTime } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  titleEn: string;
  titleHi: string;
  bodyEn: string | null;
  bodyHi: string | null;
  href: string | null;
  read: boolean;
  createdAt: Date | string;
};

export function NotificationList({ items, unread, compact }: { items: NotificationItem[]; unread: number; compact?: boolean }) {
  const t = useT();
  const locale = useLocale();
  const [rows, setRows] = useState(items);
  const [, start] = useTransition();

  function markOne(id: string) {
    setRows((xs) => xs.map((x) => (x.id === id ? { ...x, read: true } : x)));
    start(() => void markNotificationReadAction(id));
  }
  function markAll() {
    setRows((xs) => xs.map((x) => ({ ...x, read: true })));
    start(() => void markAllNotificationsReadAction());
  }

  if (!rows.length)
    return (
      <EmptyState
        icon={<BellOff className="h-6 w-6" />}
        title={t(compact ? "pandit.allCaughtUp" : "pandit.noNotifications")}
        hint={compact ? undefined : t("pandit.noNotificationsHint")}
        className={compact ? "py-8" : undefined}
      />
    );

  return (
    <div className="space-y-2">
      {unread > 0 && (
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={markAll} icon={<CheckCheck className="h-4 w-4" />}>
            {t("pandit.markAllRead")}
          </Button>
        </div>
      )}
      <ul className="space-y-2">
        {rows.map((n) => {
          const title = (locale === "hi" ? n.titleHi : n.titleEn) || n.titleEn;
          const body = (locale === "hi" ? n.bodyHi : n.bodyEn) || n.bodyEn;
          const inner = (
            <>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm leading-tight", n.read ? "font-medium text-muted" : "font-semibold")}>{title}</p>
                {body && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{body}</p>}
                <p className="mt-1 text-[11px] text-muted">{formatDateTime(new Date(n.createdAt), locale)}</p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </>
          );
          return (
            <li key={n.id} className={cn("rounded-2xl border p-3.5", n.read ? "border-border bg-surface" : "border-primary/30 bg-primary-soft/40")}>
              <div className="flex items-start gap-3">
                {n.href ? (
                  <Link href={n.href} onClick={() => !n.read && markOne(n.id)} className="flex min-w-0 flex-1 items-start gap-3">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </div>
              {!n.read && (
                <button type="button" onClick={() => markOne(n.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  <Check className="h-3.5 w-3.5" /> {t("pandit.markRead")}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
