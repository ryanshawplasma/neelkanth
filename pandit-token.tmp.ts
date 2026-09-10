import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
(async () => {
  const u = await db.user.findUnique({ where: { phone: "+919000000001" } });
  if (!u) throw new Error("no user");
  const token = await new SignJWT({ uid: u.id, role: u.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret"));
  console.log(token);
  await db.$disconnect();
})();
