import type { Metadata } from "next";
import { NotebookPen } from "lucide-react";
import { getT } from "@/i18n/server";
import { getBookingsForTab } from "@/lib/pandit/queries";
import { isBookingTab, type BookingTab } from "@/lib/pandit/shared";
import { EmptyState } from "@/components/ui/misc";
import { PortalHeader } from "@/components/pandit/shell";
import { BookingCard } from "@/components/pandit/common";
import { BookingTabs } from "@/components/pandit/booking-tabs";

export const metadata: Metadata = { title: "Bookings" };

export default async function PanditBookingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { t } = await getT();
  const sp = await searchParams;
  const tab: BookingTab = isBookingTab(sp.tab) ? sp.tab : "upcoming";
  const { pandit, bookings, counts } = await getBookingsForTab(tab);

  return (
    <div className="pb-8">
      <PortalHeader title={t("pandit.bookingsTitle")} />
      <BookingTabs value={tab} counts={counts} />
      <div className="space-y-2.5 px-4 pt-4">
        {bookings.length ? (
          bookings.map((b) => <BookingCard key={b.id} booking={b} commissionPct={pandit.commissionPct} showStatus={tab !== "upcoming"} />)
        ) : (
          <EmptyState icon={<NotebookPen className="h-6 w-6" />} title={t("pandit.noBookings")} hint={t("pandit.noBookingsHint")} />
        )}
      </div>
    </div>
  );
}
