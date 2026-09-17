"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, CheckCircle2, Info, Loader2, Mail, MapPin, MessageCircle, Phone, RotateCcw } from "lucide-react";
import { useT } from "@/i18n/client";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { Badge, type Tone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { adminSendSupportMessageAction, adminSetSupportStatusAction } from "@/lib/support-actions";
import type { SupportMessageDTO } from "@/lib/support-types";
import { ChatThread } from "./chat-thread";

export type SupportCustomer = {
  id: string;
  name: string;
  phone: string | null;
  rawPhone: string | null;
  email: string | null;
  avatarUrl: string | null;
  place: string | null;
  joined: string;
  bookingsLabel: string;
};

export type SupportBookingRow = { id: string; code: string; name: string; statusLabel: string; tone: Tone; when: string; amount: string };

/**
 * Admin conversation screen. Phones get a full-screen chat (like a messaging app) with customer
 * details in a sheet; wide screens show the chat card with a details panel beside it.
 */
export function AdminSupportThread({
  threadId,
  initialMessages,
  initialHasMore,
  initialStatus,
  customer,
  bookings,
}: {
  threadId: string;
  initialMessages: SupportMessageDTO[];
  initialHasMore: boolean;
  initialStatus: "OPEN" | "RESOLVED";
  customer: SupportCustomer;
  bookings: SupportBookingRow[];
}) {
  const t = useT();
  const { toast } = useToast();
  const [status, setStatus] = useState(initialStatus);
  const [details, setDetails] = useState(false);
  const [pending, start] = useTransition();

  function toggleStatus() {
    const next = status === "OPEN" ? "RESOLVED" : "OPEN";
    start(async () => {
      const res = await adminSetSupportStatusAction(threadId, next).catch(() => null);
      if (res?.ok) {
        setStatus(next);
        toast(t("common.saved"));
      } else toast(t("common.somethingWrong"), "error");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background md:static md:z-auto md:grid md:h-[calc(100dvh-6rem)] md:min-h-[520px] md:gap-4 lg:h-[calc(100dvh-6.5rem)] xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-surface md:rounded-2xl md:border md:border-border md:shadow-[var(--shadow)]">
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-3">
          <Link href="/admin/support" aria-label={t("admin.supportBackToInbox")} className="rounded-full p-2 text-foreground hover:bg-surface-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <button type="button" onClick={() => setDetails(true)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left xl:pointer-events-none">
            <Avatar src={customer.avatarUrl} name={customer.name} size={38} />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold leading-tight">{customer.name}</span>
              <span className="block truncate text-xs text-muted">{customer.phone ?? customer.email}</span>
            </span>
          </button>
          <Badge tone={status === "OPEN" ? "info" : "success"} className="hidden sm:inline-flex">
            {status === "OPEN" ? t("admin.supportStatusOpen") : t("admin.supportStatusResolved")}
          </Badge>
          <button
            type="button"
            onClick={toggleStatus}
            disabled={pending}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold disabled:opacity-60 sm:px-3",
              status === "OPEN" ? "border-success/40 text-success hover:bg-success/10" : "border-border text-foreground hover:bg-surface-2",
            )}
            aria-label={status === "OPEN" ? t("admin.supportMarkResolved") : t("admin.supportReopen")}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "OPEN" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{status === "OPEN" ? t("admin.supportMarkResolved") : t("admin.supportReopen")}</span>
          </button>
          <button
            type="button"
            onClick={() => setDetails(true)}
            className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-foreground xl:hidden"
            aria-label={t("admin.supportDetails")}
          >
            <Info className="h-5 w-5" />
          </button>
        </header>

        <ChatThread
          side="admin"
          pollUrl={`/api/admin/support/${threadId}/messages`}
          className="flex-1"
          initialMessages={initialMessages}
          initialHasMore={initialHasMore}
          send={(body) => adminSendSupportMessageAction(threadId, body)}
          bookingHref={(id) => `/admin/bookings/${id}`}
          onThread={(th) => setStatus(th.status)}
          emptyState={
            <EmptyState className="py-10" icon={<MessageCircle className="h-6 w-6" />} title={t("admin.supportNoMessages")} hint={t("admin.supportStartHint")} />
          }
          notice={status === "RESOLVED" ? <p className="mx-auto max-w-sm text-center text-xs text-muted">{t("admin.supportResolvedHint")}</p> : null}
        />
      </section>

      <aside className="hidden min-h-0 overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow)] xl:block">
        <CustomerDetails customer={customer} bookings={bookings} />
      </aside>

      <Sheet open={details} onClose={() => setDetails(false)} title={t("admin.supportDetails")}>
        <CustomerDetails customer={customer} bookings={bookings} />
      </Sheet>
    </div>
  );
}

function CustomerDetails({ customer, bookings }: { customer: SupportCustomer; bookings: SupportBookingRow[] }) {
  const t = useT();
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{t("admin.supportCustomer")}</p>
      <div className="flex items-center gap-3">
        <Avatar src={customer.avatarUrl} name={customer.name} size={48} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{customer.name}</p>
          <p className="text-xs text-muted">
            {customer.bookingsLabel} · {customer.joined}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {customer.phone && (
          <li>
            <a href={`tel:${customer.rawPhone ?? customer.phone}`} className="flex items-center gap-2 break-all hover:text-primary">
              <Phone className="h-4 w-4 shrink-0 text-muted" />
              {customer.phone}
            </a>
          </li>
        )}
        {customer.email && (
          <li>
            <a href={`mailto:${customer.email}`} className="flex items-center gap-2 break-all hover:text-primary">
              <Mail className="h-4 w-4 shrink-0 text-muted" />
              {customer.email}
            </a>
          </li>
        )}
        {customer.place && (
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-muted" />
            {customer.place}
          </li>
        )}
      </ul>

      <ButtonLink href={`/admin/users/${customer.id}`} variant="outline" size="sm" full className="mt-4">
        {t("admin.supportViewProfile")}
      </ButtonLink>

      <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted">{t("admin.supportRecentBookings")}</p>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted">{t("admin.supportNoBookings")}</p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link href={`/admin/bookings/${b.id}`} className="block rounded-xl border border-border p-2.5 hover:border-primary/40 hover:bg-surface-2">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs text-muted">{b.code}</span>
                  <Badge tone={b.tone}>{b.statusLabel}</Badge>
                </span>
                <span className="mt-1 block truncate text-sm font-medium">{b.name}</span>
                <span className="block text-xs text-muted">
                  {b.when} · {b.amount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
