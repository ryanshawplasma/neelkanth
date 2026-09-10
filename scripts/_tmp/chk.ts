import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const keys = ["service","temple","festival","category","contentItem","banner","panditProfile","user","coupon","servicePackage","serviceAddon","review"];
  for (const k of keys) {
    try { const c = await (db as any)[k].count(); console.log(k, c); } catch (e) { console.log(k, "ERR", (e as Error).message.slice(0,80)); }
  }
  const s = await db.service.findMany({ take: 5, select: { slug: true, type: true, nameEn: true, coverUrl: true } });
  console.log(JSON.stringify(s, null, 1));
}
main().finally(() => db.$disconnect());
