/**
 * Prisma needs a literal `provider` in schema.prisma, but we want SQLite for zero-config local
 * development and Postgres in production (Vercel / Neon / Supabase / RDS). This script rewrites
 * the datasource provider to match DATABASE_URL before any prisma command runs.
 *
 *   file:…            → sqlite
 *   postgres(ql)://…  → postgresql
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const schemaPath = path.join(root, "prisma", "schema.prisma");

function loadEnv() {
  if (process.env.DATABASE_URL) return;
  for (const f of [".env.local", ".env"]) {
    const p = path.join(root, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const v = m[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      if (process.env[m[1]] === undefined) process.env[m[1]] = v;
    }
  }
}

loadEnv();
const url = process.env.DATABASE_URL ?? "file:./dev.db";
const provider = /^postgres(ql)?:\/\//i.test(url) ? "postgresql" : url.startsWith("file:") ? "sqlite" : null;
if (!provider) {
  console.error(`[prisma-provider] Unsupported DATABASE_URL scheme: ${url.split(":")[0]}`);
  process.exit(1);
}

const schema = readFileSync(schemaPath, "utf8");
const next = schema.replace(/(datasource\s+db\s*\{[^}]*?provider\s*=\s*)"[a-z]+"/s, `$1"${provider}"`);
if (next !== schema) {
  writeFileSync(schemaPath, next);
  console.log(`[prisma-provider] provider set to ${provider}`);
} else {
  console.log(`[prisma-provider] provider already ${provider}`);
}
