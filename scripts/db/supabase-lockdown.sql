-- Close Supabase's auto-generated REST/GraphQL API over the app's tables.
--
-- DivyaDham talks to Postgres directly through Prisma, as the `postgres` role (owner of every table,
-- with BYPASSRLS), so none of this affects the app. Without it, anyone holding the project's
-- publishable (anon) key can read and write every table in `public` through
-- https://<project>.supabase.co/rest/v1/… — users, bookings, KYC, OTP codes.
--
-- Idempotent: re-run after every production schema change (new tables get RLS turned on here).
--   npx prisma db execute --url "$DATABASE_URL" --file scripts/db/supabase-lockdown.sql

-- 1. Row level security on every table, with no policies: the API roles see nothing.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- 2. The API roles lose their grants on existing objects…
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- 3. …and on tables Prisma creates later (it connects as postgres).
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
