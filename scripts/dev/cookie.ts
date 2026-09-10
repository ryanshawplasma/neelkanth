/* Prints a signed dd_session cookie for a phone/email: npx tsx scripts/dev/cookie.ts 9111111111 */
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }));
const db = new PrismaClient();
async function main() {
  const key = process.argv[2];
  const user = await db.user.findFirstOrThrow({ where: key.includes("@") ? { email: key } : { phone: key.startsWith("+") ? key : `+91${key}` } });
  const token = await new SignJWT({ uid: user.id, role: user.role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1d").sign(new TextEncoder().encode(env.AUTH_SECRET));
  console.log(`dd_session=${token}`);
}
main().finally(() => db.$disconnect());
