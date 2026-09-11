/**
 * Production build (used by `npm run build`, which Vercel runs):
 *   1. pick the Prisma provider from DATABASE_URL
 *   2. prisma generate
 *   3. on a hosted database: `prisma db push` so the schema always matches the deploy
 *   4. optional first-time seed when SEED_ON_BUILD=1 (idempotent, but it overwrites catalog rows
 *      edited in the admin console — turn it off after the first deploy)
 *   5. next build
 */
import { spawnSync } from "node:child_process";

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run("node", ["scripts/prisma-provider.mjs"]);
run("npx", ["prisma", "generate"]);

const url = process.env.DATABASE_URL ?? "";
const hosted = /^postgres(ql)?:\/\//i.test(url);
if (hosted) {
  run("npx", ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"]);
  if (process.env.SEED_ON_BUILD === "1") run("npx", ["tsx", "prisma/seed.ts"]);
} else if (!url) {
  console.warn("[build] DATABASE_URL is not set — the app will have no database at runtime.");
}

run("npx", ["next", "build"]);
