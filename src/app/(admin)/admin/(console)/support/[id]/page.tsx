import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { getSupportThreadDetail, listSupportMessages } from "@/lib/support";
import { formatPhone } from "@/lib/account-types";
import { bookingTone } from "@/lib/admin/util";
import { BOOKING_STATUSES, labelOf } from "@/lib/constants";
import { formatDate, formatINR, loc } from "@/lib/utils";
import { AdminSupportThread } from "@/components/support/admin-support-thread";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Support chat" };

export default async function SupportThreadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const thread = await getSupportThreadDetail(id);
  if (!thread) notFound();
  const { t, locale } = await getT();
  const initial = await listSupportMessages(thread.id, "admin");
  const u = thread.user;
  const phone = formatPhone(u.phone);

  return (
    <AdminSupportThread
      threadId={thread.id}
      initialMessages={initial.messages}
      initialHasMore={initial.hasMore}
      initialStatus={thread.status}
      customer={{
        id: u.id,
        name: u.name || phone || u.email || "—",
        phone,
        rawPhone: u.phone,
        email: u.email,
        avatarUrl: u.avatarUrl,
        place: [u.city, u.state].filter(Boolean).join(", ") || null,
        joined: formatDate(u.createdAt, locale),
        bookingsLabel: t("admin.supportTotalBookings", { n: u._count.bookings }),
      }}
      bookings={u.bookings.map((b) => ({
        id: b.id,
        code: b.code,
        name: loc(b.service, "name", locale),
        statusLabel: labelOf(BOOKING_STATUSES, b.status, locale),
        tone: bookingTone(b.status),
        when: formatDate(b.scheduledDate, locale),
        amount: formatINR(b.amountTotal, locale),
      }))}
    />
  );
}
