import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupportThreadForUser, listSupportMessages, markSupportSeen } from "@/lib/support";
import type { SupportPollResponse } from "@/lib/support-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Re-send this much history on every poll so a message committed slightly out of order is never skipped. */
const OVERLAP_MS = 15_000;
const NO_STORE = { "Cache-Control": "no-store" };

function parseDate(v: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * GET /api/support/messages — the signed-in customer's conversation with support.
 * `after=<iso>` new messages (polling) · `before=<iso>` older page · `read=1` the chat is on screen.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: NO_STORE });

  const thread = await getSupportThreadForUser(user.id);
  if (!thread) {
    const empty: SupportPollResponse = { thread: null, messages: [], hasMore: false };
    return NextResponse.json(empty, { headers: NO_STORE });
  }

  const params = req.nextUrl.searchParams;
  const after = parseDate(params.get("after"));
  const before = parseDate(params.get("before"));
  const read = params.get("read") === "1" && !before;
  if (read) await markSupportSeen(thread, "user", user.id);

  const { messages, hasMore } = await listSupportMessages(thread.id, "user", {
    after: after ? new Date(after.getTime() - OVERLAP_MS) : null,
    before,
  });
  const body: SupportPollResponse = {
    thread: { id: thread.id, status: thread.status, userUnread: read ? 0 : thread.userUnread, adminUnread: thread.adminUnread },
    messages,
    hasMore,
  };
  return NextResponse.json(body, { headers: NO_STORE });
}
