"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, CalendarCheck, Loader2, RotateCcw, SendHorizontal, WifiOff, X } from "lucide-react";
import { useLocale, useT } from "@/i18n/client";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/auth-actions";
import type { SupportMessageDTO, SupportPollResponse, SupportThreadDTO } from "@/lib/support-types";

const MAX_LEN = 2000;
/** Poll quickly while a conversation is active, back off while it is quiet. */
const POLL_STEPS = [3000, 3000, 5000, 8000, 12000, 15000];
/** The app serves India; formatting in one fixed zone keeps server and browser output identical. */
const TIME_ZONE = "Asia/Kolkata";

export type ChatBookingRef = NonNullable<SupportMessageDTO["booking"]>;
export type ChatSendFn = (body: string, bookingId: string | null) => Promise<ActionResult<{ message: SupportMessageDTO; thread: SupportThreadDTO }>>;

type Pending = { tempId: string; body: string; booking: ChatBookingRef | null; status: "sending" | "failed"; createdAt: string };

function sortMessages(list: SupportMessageDTO[]) {
  return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const dayKey = (d: Date) => dayKeyFmt.format(d);

export function ChatThread({
  side,
  pollUrl,
  initialMessages,
  initialHasMore,
  send,
  bookingHref,
  attachedBooking,
  onDetachBooking,
  onThread,
  emptyState,
  suggestions,
  notice,
  className,
}: {
  /** Whose screen this is: "user" = customer app, "admin" = console. */
  side: "user" | "admin";
  /** GET endpoint returning `SupportPollResponse` (supports `after`, `before`, `read`). */
  pollUrl: string;
  initialMessages: SupportMessageDTO[];
  initialHasMore: boolean;
  send: ChatSendFn;
  /** Link for a booking chip. */
  bookingHref: (id: string) => string;
  /** Booking to attach to the next message (customer side). */
  attachedBooking?: ChatBookingRef | null;
  onDetachBooking?: () => void;
  /** Latest conversation state after every poll / send. */
  onThread?: (thread: SupportThreadDTO) => void;
  /** Shown when there are no messages yet. */
  emptyState?: ReactNode;
  /** Tap-to-prefill starters, shown while the conversation is empty. */
  suggestions?: string[];
  /** Shown under the last message (e.g. "this conversation was resolved"). */
  notice?: ReactNode;
  className?: string;
}) {
  const t = useT();
  const locale = useLocale();
  const { toast } = useToast();

  const [messages, setMessages] = useState<SupportMessageDTO[]>(() => sortMessages([...initialMessages]));
  const [pending, setPending] = useState<Pending[]>([]);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [offline, setOffline] = useState(false);
  const [text, setText] = useState("");
  const [unseenBelow, setUnseenBelow] = useState(0);
  const [coarse, setCoarse] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef(messages);
  const stickToBottom = useRef(true);
  const preserveScroll = useRef<{ height: number; top: number } | null>(null);
  const pokeRef = useRef<() => void>(() => {});
  const onThreadRef = useRef(onThread);
  onThreadRef.current = onThread;
  messagesRef.current = messages;

  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" }),
    [locale],
  );
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { timeZone: TIME_ZONE, weekday: "short", day: "numeric", month: "short", year: "numeric" }),
    [locale],
  );

  useEffect(() => {
    setCoarse(window.matchMedia?.("(pointer: coarse)").matches ?? false);
  }, []);

  const isNearBottom = () => {
    const el = scrollRef.current;
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  /** Merge server messages; returns how many were new. */
  const applyIncoming = useCallback(
    (incoming: SupportMessageDTO[]) => {
      if (!incoming.length) return 0;
      const known = new Set(messagesRef.current.map((m) => m.id));
      const fresh = incoming.filter((m) => !known.has(m.id));
      if (!fresh.length) return 0;
      const nearBottom = isNearBottom();
      stickToBottom.current = stickToBottom.current || nearBottom;
      const fromOthers = fresh.filter((m) => (side === "user" ? m.fromAdmin : !m.fromAdmin)).length;
      if (!nearBottom && fromOthers) setUnseenBelow((n) => n + fromOthers);
      const next = sortMessages([...messagesRef.current, ...fresh]);
      messagesRef.current = next;
      setMessages(next);
      return fresh.length;
    },
    [side],
  );

  // Polling: fast while active, slower when quiet, paused while the tab is hidden.
  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;
    let step = 0;
    let controller: AbortController | null = null;

    const schedule = (ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, ms);
    };

    async function tick() {
      if (stopped || document.hidden) return;
      controller?.abort();
      controller = new AbortController();
      const list = messagesRef.current;
      const last = list[list.length - 1]?.createdAt;
      const qs = new URLSearchParams({ read: "1" });
      if (last) qs.set("after", last);
      try {
        const res = await fetch(`${pollUrl}?${qs}`, { cache: "no-store", signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as SupportPollResponse;
        if (stopped) return;
        setOffline(false);
        const added = applyIncoming(data.messages);
        if (data.thread) onThreadRef.current?.(data.thread);
        step = added > 0 ? 0 : Math.min(step + 1, POLL_STEPS.length - 1);
      } catch (e) {
        if ((e as Error).name === "AbortError" || stopped) return;
        setOffline(true);
        step = Math.min(step + 1, POLL_STEPS.length - 1);
      }
      if (!stopped) schedule(POLL_STEPS[step]);
    }

    const wake = () => {
      if (document.hidden) return;
      step = 0;
      schedule(150);
    };
    pokeRef.current = () => {
      step = 0;
      schedule(600);
    };

    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    window.addEventListener("online", wake);
    schedule(250);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("online", wake);
    };
  }, [pollUrl, applyIncoming]);

  // Keep the view pinned to the newest message, or keep position when older messages are prepended.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (preserveScroll.current) {
      el.scrollTop = el.scrollHeight - preserveScroll.current.height + preserveScroll.current.top;
      preserveScroll.current = null;
      return;
    }
    if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
      stickToBottom.current = false;
      setUnseenBelow(0);
    }
  }, [messages, pending]);

  // Grow the composer with its content (up to ~5 lines).
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [text]);

  async function loadEarlier() {
    const first = messagesRef.current[0];
    const el = scrollRef.current;
    if (!first || !el || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const res = await fetch(`${pollUrl}?before=${encodeURIComponent(first.createdAt)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as SupportPollResponse;
      preserveScroll.current = { height: el.scrollHeight, top: el.scrollTop };
      const known = new Set(messagesRef.current.map((m) => m.id));
      const next = sortMessages([...data.messages.filter((m) => !known.has(m.id)), ...messagesRef.current]);
      messagesRef.current = next;
      setMessages(next);
      setHasMore(data.hasMore);
    } catch {
      toast(t("common.somethingWrong"), "error");
    } finally {
      setLoadingOlder(false);
    }
  }

  async function submit(retry?: Pending) {
    const body = (retry ? retry.body : text).trim();
    if (!body || body.length > MAX_LEN) return;
    const booking = retry ? retry.booking : (attachedBooking ?? null);
    const tempId = retry?.tempId ?? `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: Pending = { tempId, body, booking, status: "sending", createdAt: new Date().toISOString() };
    stickToBottom.current = true;
    setPending((p) => (retry ? p.map((x) => (x.tempId === tempId ? item : x)) : [...p, item]));
    if (!retry) {
      setText("");
      if (booking) onDetachBooking?.();
    }

    const res = await send(body, booking?.id ?? null).catch(() => null);
    if (res?.ok && res.data) {
      stickToBottom.current = true;
      applyIncoming([res.data.message]);
      setPending((p) => p.filter((x) => x.tempId !== tempId));
      onThreadRef.current?.(res.data.thread);
      pokeRef.current();
    } else {
      setPending((p) => p.map((x) => (x.tempId === tempId ? { ...x, status: "failed" } : x)));
      if (res && !res.ok && ["supportTooFast", "supportMessageInvalid"].includes(res.error)) toast(t(`common.${res.error}`), "error");
    }
  }

  const nameOf = (b: ChatBookingRef) => (locale === "hi" ? b.nameHi || b.nameEn : b.nameEn || b.nameHi || "");
  const mine = (m: { fromAdmin: boolean }) => (side === "user" ? !m.fromAdmin : m.fromAdmin);
  const over = text.trim().length - MAX_LEN;
  const empty = messages.length === 0 && pending.length === 0;

  const todayKey = dayKey(new Date());
  const yesterdayKey = dayKey(new Date(Date.now() - 86_400_000));
  const dayLabel = (d: Date) => {
    const k = dayKey(d);
    return k === todayKey ? t("common.chatToday") : k === yesterdayKey ? t("common.chatYesterday") : dateFmt.format(d);
  };

  return (
    <div className={cn("relative flex min-h-0 flex-col", className)}>
      {offline && (
        <div className="flex items-center justify-center gap-1.5 bg-warning-soft px-3 py-1.5 text-xs font-medium text-warning">
          <WifiOff className="h-3.5 w-3.5" />
          {t("common.chatOffline")}
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={() => isNearBottom() && unseenBelow && setUnseenBelow(0)}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {hasMore && (
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={loadEarlier}
              disabled={loadingOlder}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground disabled:opacity-60"
            >
              {loadingOlder && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t("common.chatLoadEarlier")}
            </button>
          </div>
        )}

        {empty && emptyState}

        <ol className="space-y-1">
          {messages.map((m, i) => {
            const d = new Date(m.createdAt);
            const prev = messages[i - 1];
            const newDay = !prev || dayKey(new Date(prev.createdAt)) !== dayKey(d);
            const own = mine(m);
            const groupStart = newDay || !prev || prev.fromAdmin !== m.fromAdmin;
            return (
              <li key={m.id}>
                {newDay && (
                  <div className="my-3 flex justify-center">
                    <span suppressHydrationWarning className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted">
                      {dayLabel(d)}
                    </span>
                  </div>
                )}
                <Bubble
                  own={own}
                  groupStart={groupStart}
                  label={!own && groupStart ? (m.fromAdmin ? t("common.chatSupportTeam") : null) : null}
                  body={m.body}
                  time={timeFmt.format(d)}
                  footer={side === "admin" && m.fromAdmin && m.senderName ? m.senderName : null}
                  booking={m.booking ? { href: bookingHref(m.booking.id), text: `${m.booking.code} · ${nameOf(m.booking)}` } : null}
                />
              </li>
            );
          })}
          {pending.map((p) => (
            <li key={p.tempId}>
              <Bubble
                own
                groupStart={false}
                body={p.body}
                time={p.status === "sending" ? t("common.chatSending") : null}
                booking={p.booking ? { href: bookingHref(p.booking.id), text: `${p.booking.code} · ${nameOf(p.booking)}` } : null}
                faded={p.status === "sending"}
                failed={p.status === "failed" ? { label: t("common.chatFailed"), retry: () => submit(p) } : null}
              />
            </li>
          ))}
        </ol>

        {notice && !empty && <div className="mt-4">{notice}</div>}
      </div>

      {unseenBelow > 0 && (
        <button
          type="button"
          onClick={() => {
            const el = scrollRef.current;
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
            setUnseenBelow(0);
          }}
          className="absolute bottom-20 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          {t("common.chatNewMessages")}
        </button>
      )}

      <div className="border-t border-border bg-surface px-2.5 pb-safe pt-2 sm:px-3">
        {empty && suggestions && suggestions.length > 0 && (
          <div className="hide-scrollbar -mx-2.5 mb-2 flex gap-2 overflow-x-auto px-2.5 sm:-mx-3 sm:px-3">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setText((cur) => (cur ? cur : `${s}: `));
                  inputRef.current?.focus();
                }}
                className="shrink-0 rounded-full border border-primary/30 bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary-700"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {attachedBooking && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-primary/25 bg-primary-soft/70 px-3 py-2 text-xs text-primary-700">
            <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate font-medium">
              {t("common.chatAboutBooking", { code: attachedBooking.code })} · {nameOf(attachedBooking)}
            </span>
            {onDetachBooking && (
              <button type="button" onClick={onDetachBooking} className="-mr-1 rounded-full p-1 hover:bg-primary/10" aria-label={t("common.chatRemoveBooking")}>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !coarse && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void submit();
              }
            }}
            rows={1}
            placeholder={t("common.chatPlaceholder")}
            aria-label={t("common.chatPlaceholder")}
            enterKeyHint="send"
            className="max-h-[132px] min-h-11 flex-1 resize-none rounded-2xl border border-border bg-background px-3.5 py-2.5 text-[15px] leading-snug placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!text.trim() || over > 0}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-opacity disabled:opacity-40"
            aria-label={t("common.chatSend")}
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </form>
        {over > 0 && <p className="mt-1 px-1 text-xs text-danger">{t("common.chatTooLong", { n: over })}</p>}
      </div>
    </div>
  );
}

function Bubble({
  own,
  groupStart,
  label,
  body,
  time,
  footer,
  booking,
  faded,
  failed,
}: {
  own: boolean;
  groupStart: boolean;
  label?: string | null;
  body: string;
  time: string | null;
  footer?: string | null;
  booking: { href: string; text: string } | null;
  faded?: boolean;
  failed?: { label: string; retry: () => void } | null;
}) {
  return (
    <div className={cn("flex flex-col", own ? "items-end" : "items-start", groupStart && "mt-2.5")}>
      {label && <span className="mb-0.5 px-1 text-[11px] font-semibold text-primary-700">{label}</span>}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-[14.5px] leading-snug shadow-sm sm:max-w-[75%]",
          own ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-border bg-surface text-foreground",
          faded && "opacity-70",
          failed && "bg-danger",
        )}
      >
        {booking && (
          <Link
            href={booking.href}
            className={cn(
              "-mx-0.5 mb-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium",
              own ? "bg-white/15 text-white hover:bg-white/25" : "bg-primary-soft text-primary-700 hover:bg-primary-soft/70",
            )}
          >
            <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 truncate">{booking.text}</span>
          </Link>
        )}
        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{body}</p>
        {time && (
          <span suppressHydrationWarning className={cn("mt-0.5 block text-right text-[10.5px]", own ? "text-white/75" : "text-muted")}>
            {time}
          </span>
        )}
      </div>
      {footer && <span className="mt-0.5 px-1 text-[10.5px] text-muted">{footer}</span>}
      {failed && (
        <button type="button" onClick={failed.retry} className="mt-1 inline-flex items-center gap-1 px-1 text-[11.5px] font-medium text-danger">
          <RotateCcw className="h-3 w-3" />
          {failed.label}
        </button>
      )}
    </div>
  );
}
