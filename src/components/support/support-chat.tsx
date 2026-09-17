"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useT } from "@/i18n/client";
import { BackButton } from "@/components/app/bits";
import { EmptyState } from "@/components/ui/misc";
import { sendSupportMessageAction } from "@/lib/support-actions";
import type { SupportMessageDTO } from "@/lib/support-types";
import { ChatThread, type ChatBookingRef } from "./chat-thread";

/** Customer side of the support chat (full-screen page in the devotee app). */
export function SupportChat({
  initialMessages,
  initialHasMore,
  initialStatus,
  booking,
}: {
  initialMessages: SupportMessageDTO[];
  initialHasMore: boolean;
  initialStatus: "OPEN" | "RESOLVED";
  /** Booking opened from "Need help with this booking?", attached to the next message. */
  booking: ChatBookingRef | null;
}) {
  const t = useT();
  const [attached, setAttached] = useState(booking);
  const [status, setStatus] = useState(initialStatus);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-border bg-surface/95 px-3 py-2.5 backdrop-blur">
        <BackButton fallback="/account" className="bg-transparent shadow-none" />
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-kesari text-base leading-none text-white">ॐ</span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold leading-tight">{t("app.supportTitle")}</h1>
          <p className="truncate text-[11.5px] text-muted">{t("app.supportSubtitle")}</p>
        </div>
      </header>

      <ChatThread
        side="user"
        pollUrl="/api/support/messages"
        className="flex-1"
        initialMessages={initialMessages}
        initialHasMore={initialHasMore}
        send={sendSupportMessageAction}
        bookingHref={(id) => `/bookings/${id}`}
        attachedBooking={attached}
        onDetachBooking={() => setAttached(null)}
        onThread={(th) => setStatus(th.status)}
        emptyState={
          <EmptyState
            className="py-10"
            icon={<MessageCircle className="h-6 w-6" />}
            title={t("app.supportEmptyTitle")}
            hint={t("app.supportEmptyHint")}
          />
        }
        suggestions={[t("app.supportTopicBooking"), t("app.supportTopicPayment"), t("app.supportTopicVideo")]}
        notice={
          status === "RESOLVED" ? (
            <p className="mx-auto flex max-w-xs items-start justify-center gap-1.5 text-center text-xs text-muted">
              <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-success" />
              {t("app.supportResolvedNote")}
            </p>
          ) : null
        }
      />
    </div>
  );
}
