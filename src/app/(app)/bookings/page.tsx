import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listBookings } from "@/lib/app/queries";
import { BookingsList, type BookingRow } from "@/components/app/bookings-list";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fbookings");
  const bookings = await listBookings(user.id);
  return <BookingsList bookings={bookings as unknown as BookingRow[]} />;
}
