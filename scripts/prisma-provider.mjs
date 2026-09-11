/**
 * Prisma needs a literal `provider` in schema.prisma, but we want SQLite for zero-config local
 * development and Postgres in production (Vercel / Neon / Supabase / RDS). This script rewrites
 * the datasource provider to match DATABASE_URL before any prisma command runs.
 *
 *   file:…            → sqlite
 *   postgres(ql)://…  → postgresql
 *
 * It never fails the build: an unrecognised or missing URL just leaves the schema as it is.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const schemaPath = path.join(root, "prisma", "schema.prisma");

const unquote = (v) => String(v ?? "").trim().replace(/^["'](.*)["']$/s, "$1").trim();

function loadEnv() {
  if (unquote(process.env.DATABASE_URL)) return;
  for (const f of [".env.local", ".env"]) {
    const p = path.join(root, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      if (!process.env[m[1]]) process.env[m[1]] = unquote(m[2]);
    }
  }
}

loadEnv();
const url = unquote(process.env.DATABASE_URL);
const provider = /^postgres(ql)?:\/\//i.test(url) ? "postgresql" : /^file:/i.test(url) ? "sqlite" : null;

if (!provider) {
  console.warn(`[prisma-provider] DATABASE_URL is ${url ? `an unsupported scheme (${url.split(":")[0]})` : "not set"}; leaving schema.prisma unchanged.`);
  process.exit(0);
}

const schema = readFileSync(schemaPath, "utf8");
const next = schema.replace(/(datasource\s+db\s*\{[^}]*?provider\s*=\s*)"[a-z]+"/s, `$1"${provider}"`);
if (next !== schema) {
  writeFileSync(schemaPath, next);
  console.log(`[prisma-provider] provider set to ${provider}`);
} else {
  console.log(`[prisma-provider] provider already ${provider}`);
}
