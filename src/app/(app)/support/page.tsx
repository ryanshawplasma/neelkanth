import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupportThreadForUser, listSupportMessages } from "@/lib/support";
import { SupportChat } from "@/components/support/support-chat";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("app.supportTitle") };
}

export default async function SupportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const bookingId = typeof sp.booking === "string" ? sp.booking : undefined;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(bookingId ? `/support?booking=${bookingId}` : "/support")}`);

  const [thread, booking] = await Promise.all([
    getSupportThreadForUser(user.id),
    bookingId
      ? db.booking.findFirst({
          where: { id: bookingId, userId: user.id },
          select: { id: true, code: true, service: { select: { nameEn: true, nameHi: true } } },
        })
      : null,
  ]);
  const initial = thread ? await listSupportMessages(thread.id, "user") : { messages: [], hasMore: false };

  return (
    <SupportChat
      initialMessages={initial.messages}
      initialHasMore={initial.hasMore}
      initialStatus={thread?.status ?? "OPEN"}
      booking={booking ? { id: booking.id, code: booking.code, nameEn: booking.service.nameEn, nameHi: booking.service.nameHi } : null}
    />
  );
}

/** Vercel: allow slow cold starts + cross-region DB round-trips (default limit is 10s). */
export const maxDuration = 30;
