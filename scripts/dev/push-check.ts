import webpush from "web-push";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
const env = Object.fromEntries(readFileSync(".env", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }));
webpush.setVapidDetails(env.VAPID_SUBJECT, env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
console.log("VAPID keys accepted by web-push:", env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.length, "chars public");
const db = new PrismaClient();
db.user.findFirstOrThrow({ where: { phone: "+919000000077" } })
  .then((u) => db.notification.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 3 }))
  .then((n) => console.log(n.map((x) => `${x.type} | ${x.titleEn} | ${x.titleHi}`).join("\n")))
  .finally(() => db.$disconnect());
