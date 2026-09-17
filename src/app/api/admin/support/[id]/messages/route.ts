import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { listSupportMessages, markSupportSeen } from "@/lib/support";
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
 * GET /api/admin/support/:id/messages — one customer conversation, for admins.
 * `after=<iso>` new messages (polling) · `before=<iso>` older page · `read=1` an admin has it on screen.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: NO_STORE });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403, headers: NO_STORE });

  const { id } = await params;
  const thread = await db.supportThread.findUnique({ where: { id } });
  if (!thread) return NextResponse.json({ error: "notFound" }, { status: 404, headers: NO_STORE });

  const search = req.nextUrl.searchParams;
  const after = parseDate(search.get("after"));
  const before = parseDate(search.get("before"));
  const read = search.get("read") === "1" && !before;
  if (read) await markSupportSeen(thread, "admin", user.id);

  const { messages, hasMore } = await listSupportMessages(thread.id, "admin", {
    after: after ? new Date(after.getTime() - OVERLAP_MS) : null,
    before,
  });
  const body: SupportPollResponse = {
    thread: { id: thread.id, status: thread.status, userUnread: thread.userUnread, adminUnread: read ? 0 : thread.adminUnread },
    messages,
    hasMore,
  };
  return NextResponse.json(body, { headers: NO_STORE });
}
