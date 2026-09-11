/**
 * Production build (used by `npm run build`, which Vercel runs):
 *   1. pick the Prisma provider from DATABASE_URL (sqlite for file:, postgresql otherwise)
 *   2. prisma generate
 *   3. optional schema push when DB_PUSH_ON_BUILD=1 (or SEED_ON_BUILD=1); off by default so a
 *      database that is unreachable from the build machine can never break a deploy — run
 *      `npm run db:push` from your machine instead (see README → Deploying to Vercel)
 *   4. optional first-time seed when SEED_ON_BUILD=1 (idempotent, but it overwrites catalog rows
 *      edited in the admin console — turn it off after the first deploy)
 *   5. next build
 */
import { spawnSync } from "node:child_process";

const run = (cmd, args) => {
  console.log(`[build] ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) {
    console.error(`[build] step failed: ${cmd} ${args.join(" ")} (exit ${r.status})`);
    process.exit(r.status ?? 1);
  }
};

run("node", ["scripts/prisma-provider.mjs"]);
run("npx", ["prisma", "generate"]);

const url = process.env.DATABASE_URL ?? "";
const hosted = /^postgres(ql)?:\/\//i.test(url);
const wantPush = process.env.DB_PUSH_ON_BUILD === "1" || process.env.SEED_ON_BUILD === "1";

if (!url) {
  console.warn("[build] DATABASE_URL is not set — the app will have no database at runtime.");
} else if (!hosted) {
  console.warn("[build] DATABASE_URL points to SQLite; on serverless hosts this file will not persist.");
}

if (hosted && wantPush) {
  run("npx", ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"]);
  if (process.env.SEED_ON_BUILD === "1") run("npx", ["tsx", "prisma/seed.ts"]);
}

run("npx", ["next", "build"]);
