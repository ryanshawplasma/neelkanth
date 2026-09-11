import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const admin = await db.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  const n = await db.notification.findMany({ where: { userId: admin.id }, orderBy: { createdAt: "desc" }, take: 3 });
  console.log(n.map((x) => `${x.type} | ${x.titleEn} | ${x.href} | pushed=${x.pushed}`).join("\n"));
  const p = await db.panditProfile.findFirst({ where: { user: { phone: "+919000000077" } }, include: { documents: true } });
  console.log("pandit:", p?.displayName, p?.kycStatus, "docs:", p?.documents.map((d) => `${d.type}:${d.status}:${d.docNumber ?? ""}`).join(", "));
  console.log("push subs:", await db.pushSubscription.count());
}
main().finally(() => db.$disconnect());
