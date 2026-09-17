/** Client-safe shapes for the support chat (see `src/lib/support.ts`). */

export type SupportMessageDTO = {
  id: string;
  body: string;
  fromAdmin: boolean;
  /** Which admin replied — only filled in for the admin console. */
  senderName: string | null;
  /** ISO timestamp. */
  createdAt: string;
  /** Booking the message is about, if any. */
  booking: { id: string; code: string; nameEn: string; nameHi: string | null } | null;
};

export type SupportThreadDTO = {
  id: string;
  status: "OPEN" | "RESOLVED";
  userUnread: number;
  adminUnread: number;
};

/** Poll response of both chat endpoints. */
export type SupportPollResponse = {
  thread: SupportThreadDTO | null;
  messages: SupportMessageDTO[];
  hasMore: boolean;
};
