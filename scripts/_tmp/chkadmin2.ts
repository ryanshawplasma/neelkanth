import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
db.user.findMany({ where: { role: "ADMIN" }, select: { id: true, email: true, isBlocked: true, passwordHash: true } })
  .then((r) => console.log(r.map((x) => ({ ...x, passwordHash: x.passwordHash ? "set" : null }))))
  .finally(() => db.$disconnect());
