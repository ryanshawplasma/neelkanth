import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const counts = {
    users: await db.user.count(), admins: await db.user.count({ where: { role: "ADMIN" } }),
    services: await db.service.count(), temples: await db.temple.count(),
    festivals: await db.festival.count(), bookings: await db.booking.count(),
    pandits: await db.panditProfile.count(), categories: await db.category.count(),
    payments: await db.payment.count(), content: await db.contentItem.count(),
    banners: await db.banner.count(), coupons: await db.coupon.count(),
    settings: await db.setting.count(), reviews: await db.review.count(),
    consultations: await db.consultation.count(), campaigns: await db.campaign.count(),
    payouts: await db.payout.count(), audit: await db.auditLog.count(),
  };
  console.log(JSON.stringify(counts, null, 1));
}
main().finally(() => db.$disconnect());
