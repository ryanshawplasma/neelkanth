import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const out: Record<string, number> = {};
  out.users = await db.user.count(); out.pandits = await db.panditProfile.count(); out.kycDocs = await db.kycDocument.count();
  out.categories = await db.category.count(); out.temples = await db.temple.count(); out.services = await db.service.count();
  out.packages = await db.servicePackage.count(); out.festivals = await db.festival.count(); out.content = await db.contentItem.count();
  out.bookings = await db.booking.count(); out.payments = await db.payment.count(); out.reviews = await db.review.count();
  out.banners = await db.banner.count(); out.coupons = await db.coupon.count(); out.settings = await db.setting.count(); out.notifications = await db.notification.count();
  console.log(JSON.stringify(out));
  console.log((await db.user.findMany({ select: { phone: true, email: true, role: true, name: true } })).map(u => `${u.role} ${u.phone ?? u.email} ${u.name ?? ""}`).join("\n"));
}
main().finally(() => db.$disconnect());
