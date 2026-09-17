"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { audit, getCurrentUser, requireAdmin } from "./auth";
import type { ActionResult } from "./auth-actions";
import { cleanSupportBody, ensureSupportThread, postSupportMessage, setSupportThreadStatus } from "./support";
import type { SupportMessageDTO, SupportThreadDTO } from "./support-types";

type SendResult = ActionResult<{ message: SupportMessageDTO; thread: SupportThreadDTO }>;

/** Per-sender flood guard: at most this many messages per rolling minute. */
const MAX_PER_MINUTE = 20;

async function tooFast(senderId: string) {
  const recent = await db.supportMessage.count({ where: { senderId, createdAt: { gt: new Date(Date.now() - 60_000) } } });
  return recent >= MAX_PER_MINUTE;
}

/** Customer → support team. Creates the conversation on the first message. */
export async function sendSupportMessageAction(body: string, bookingId?: string | null): Promise<SendResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "loginRequired" };
  const clean = cleanSupportBody(body);
  if (!clean) return { ok: false, error: "supportMessageInvalid" };
  if (await tooFast(user.id)) return { ok: false, error: "supportTooFast" };

  const res = await postSupportMessage({ customerId: user.id, senderId: user.id, fromAdmin: false, body: clean, bookingId });
  after(res.notify);
  return { ok: true, data: { message: res.message, thread: res.thread } };
}

/** Support team → customer. */
export async function adminSendSupportMessageAction(threadId: string, body: string): Promise<SendResult> {
  const admin = await requireAdmin();
  const clean = cleanSupportBody(body);
  if (!clean) return { ok: false, error: "supportMessageInvalid" };
  if (await tooFast(admin.id)) return { ok: false, error: "supportTooFast" };
  const thread = await db.supportThread.findUnique({ where: { id: threadId }, select: { userId: true } });
  if (!thread) return { ok: false, error: "notFound" };

  const res = await postSupportMessage({ customerId: thread.userId, senderId: admin.id, fromAdmin: true, body: clean });
  after(res.notify);
  return { ok: true, data: { message: res.message, thread: res.thread } };
}

export async function adminSetSupportStatusAction(threadId: string, status: "OPEN" | "RESOLVED"): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (status !== "OPEN" && status !== "RESOLVED") return { ok: false, error: "invalid" };
  const exists = await db.supportThread.findUnique({ where: { id: threadId }, select: { id: true } });
  if (!exists) return { ok: false, error: "notFound" };
  await setSupportThreadStatus(threadId, status);
  await audit(admin.id, status === "RESOLVED" ? "support.resolve" : "support.reopen", "SupportThread", threadId);
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${threadId}`);
  return { ok: true };
}

/** Start (or open) the conversation with a customer from the admin console. */
export async function adminOpenSupportThreadAction(userId: string): Promise<ActionResult<{ threadId: string }>> {
  await requireAdmin();
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return { ok: false, error: "notFound" };
  const thread = await ensureSupportThread(userId);
  return { ok: true, data: { threadId: thread.id } };
}
