/* Promote (or create) a user as ADMIN by phone: npx tsx scripts/dev/make-admin.ts 6394792821 "Name" */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const raw = process.argv[2]; const name = process.argv[3] ?? "Admin";
  const phone = raw.startsWith("+") ? raw : `+91${raw.replace(/\D/g, "").slice(-10)}`;
  const u = await db.user.upsert({ where: { phone }, update: { role: "ADMIN", onboarded: true }, create: { phone, role: "ADMIN", name, onboarded: true, locale: "hi" } });
  console.log(`ADMIN: ${u.phone} (${u.name ?? "no name"}) id=${u.id}`);
}
main().finally(() => db.$disconnect());
