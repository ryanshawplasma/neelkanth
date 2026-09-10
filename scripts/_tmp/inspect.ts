import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  console.log("ADMINS", await db.user.findMany({ where: { role: "ADMIN" }, select: { email: true, passwordHash: true, name: true } }));
  console.log("PANDITS", await db.panditProfile.findMany({ select: { id: true, displayName: true, kycStatus: true, verified: true, userId: true, city: true, _count: { select: { documents: true, services: true } } } }));
  console.log("BOOKINGS", await db.booking.findMany({ select: { id: true, code: true, status: true, panditId: true, serviceId: true, scheduledDate: true } }));
  console.log("CONSULTS", await db.consultation.count(), "REVIEWS", await db.review.count());
  console.log("SERVICES", (await db.service.findMany({ select: { id: true, slug: true, requiresPandit: true } })).slice(0, 12));
}
main().finally(() => db.$disconnect());
