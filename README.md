# DivyaDham (दिव्यधाम)

A Sri-Mandir-style temple services platform: online poojas performed at famous temples (with live link + video),
chadhava offerings, pandit-at-home rituals, astrology consultations, prasad delivery, daily panchang,
a festival calendar with push reminders, an aarti/chalisa library, a pandit portal with KYC, and a full admin console.
UI in **English and Hindi**.

## Quick start

```bash
npm run setup     # install deps, generate Prisma client, create SQLite DB, seed demo data
npm run dev       # http://localhost:3000
```

| Who | Where | Login |
|---|---|---|
| Devotee app | http://localhost:3000 | any 10-digit mobile, OTP `123456` |
| Seeded devotee | same | `9111111111` (Ramesh Kumar, has bookings) |
| Pandit portal | http://localhost:3000/pandit/login | `9000000001` … `9000000006`, OTP `123456` |
| Admin console | http://localhost:3000/admin/login | `admin@divyadham.app` / `Admin@123` |

The OTP is fixed in development (`OTP_DEV_CODE` in `.env`) and also printed to the server console.

## What's inside

- **Devotee app** (mobile-first PWA): home with today's panchang + festival countdowns, pooja/chadhava/prasad catalog,
  service detail with packages & add-ons, checkout (devotees + gotra, date/slot, address, coupon), mock payment gateway,
  booking tracking with timeline / live link / video, temples with live darshan, full panchang (tithi, nakshatra, yoga,
  karana, rahu kaal, abhijit …), festival calendar, aarti/chalisa/mantra reader, pandit directory, astrology consults,
  onboarding, notifications, favourites, family members.
- **Pandit portal**: OTP login, registration with classification (Vedic, Purohit, Jyotishi, Karmakandi, Shakta, Vastu,
  Kathavachak) & specialities, KYC (Aadhaar/PAN/photo/certificates/bank), dashboard, bookings (set live link, start,
  complete with video + photos), services offered, weekly availability & blocked dates, earnings & payouts, reviews.
- **Admin console**: overview KPIs, bookings (assign pandit, status, refunds), pandit KYC review, users, services editor
  (bilingual, packages, add-ons, images), categories, temples, festivals (reminder offsets, send now), content library,
  banners, coupons, notifications/campaigns, payments, payouts, reviews, consultations, settings, audit log.
- **Reminders**: festival "near-date" pushes (7/3/1/0 days before by default), booking reminders, scheduled campaigns —
  run every 30 min on long-running hosts and via `GET /api/cron/reminders` (Vercel Cron) in production.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for conventions and module map, [`docs/IMAGES.md`](docs/IMAGES.md)
for artwork and photo uploads.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | dev server on :3000 |
| `npm run build && npm start` | production build (`scripts/build.mjs`: provider switch → generate → db push on hosted DBs → next build) |
| `npm run db:push` | apply schema to the database in `DATABASE_URL` |
| `npm run db:seed` | (re)seed demo data — idempotent |
| `npm run db:reset` | wipe DB and reseed |
| `npx tsx scripts/generate-art.ts` | regenerate SVG artwork + PWA icons |
| `npm run typecheck` | `tsc --noEmit` |
| `npx tsx scripts/dev/smoke.ts` | fetch every route as anonymous / devotee / pandit / admin against a running dev server |
| `npx tsx scripts/dev/cookie.ts 9111111111` | print a signed session cookie for curl-based testing |

## Deploying to Vercel

The GitHub repo is connected to Vercel (neelkanth-alpha.vercel.app). A serverless host cannot use the local SQLite file,
local uploads folder, or the in-process scheduler, so the app switches to hosted services when their variables exist:

1. **Database** — in the Vercel project open *Storage → Create Database → Postgres (Neon)* and connect it to the
   project. That adds `DATABASE_URL`. Any Postgres works (Neon, Supabase, Railway). For Supabase use the **Session pooler**
   URI (port 5432, IPv4-friendly) and URL-encode special characters in the password (`@` → `%40`). Create the tables and
   demo data from your machine once:

   ```bash
   DATABASE_URL="postgresql://…" npm run db:push
   DATABASE_URL="postgresql://…" npm run db:seed
   ```

   (Alternatively set `SEED_ON_BUILD=1` for one deploy: the build then pushes the schema and seeds, but it also
   overwrites catalog rows edited in the admin console, so remove it afterwards. `DB_PUSH_ON_BUILD=1` pushes the schema
   without seeding.)
2. **Uploads** — *Storage → Create → Blob* adds `BLOB_READ_WRITE_TOKEN`; service images, pandit photos and KYC documents
   are then stored in Vercel Blob (local disk is only used in dev / on a VPS).
3. **Reminders** — `vercel.json` schedules `/api/cron/reminders` daily at 07:00 IST. Vercel authenticates the call with
   `CRON_SECRET`, so that variable must be set.

Environment variables (*Settings → Environment Variables*, Production):

| Variable | Value |
|---|---|
| `DATABASE_URL` | added by the Postgres integration |
| `BLOB_READ_WRITE_TOKEN` | added by the Blob integration |
| `AUTH_SECRET` | long random string (`openssl rand -base64 48`) |
| `CRON_SECRET` | long random string |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first admin login (used by the seed) |
| `NEXT_PUBLIC_APP_URL` | `https://neelkanth-alpha.vercel.app` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | web push (`npx web-push generate-vapid-keys`) |
| `SMS_PROVIDER`, `RENFLAIR_API_KEY` | `renflair` + your key for real OTP SMS; leave unset to keep the fixed dev OTP |
| `SEED_ON_BUILD` / `DB_PUSH_ON_BUILD` | optional, see above |

Set the function region to Mumbai (*Settings → Functions → Function Region → bom1*) so it sits next to a Supabase
ap-south-1 database. Then *Deployments → Redeploy*. `/admin` → Notifications shows the reminder engine, `/admin/settings` shows the
environment card (payment provider, push, OTP mode).

## Production notes

- Set a strong `AUTH_SECRET` and `CRON_SECRET`.
- **Push notifications**: VAPID keys go in `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`. Users tap
  *Enable notifications* on the home screen or in Account; festival, booking and campaign notifications are then delivered
  as web push in addition to the in-app inbox. Web push needs HTTPS (or localhost) and a browser that allows the prompt.
- **OTP SMS via Renflair**: set `SMS_PROVIDER=renflair`, `RENFLAIR_API_KEY=<your key>` and optionally
  `RENFLAIR_CHANNEL=voice` for voice-call OTPs. A random 6-digit OTP is then sent through Renflair's gateway and the dev
  hint disappears. With `SMS_PROVIDER=console` (default) the OTP is fixed to `OTP_DEV_CODE` and printed to the console.
- Switch `PAYMENT_PROVIDER=razorpay` and add keys; the provider abstraction is in `src/lib/payments.ts`.
- Other SMS gateways: add a provider next to Renflair in `src/lib/otp.ts`.
- Postgres vs SQLite is chosen automatically from `DATABASE_URL` (`scripts/prisma-provider.mjs`).
- Uploads use Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, else `public/uploads`; add S3/Cloudinary in
  `src/app/api/upload/route.ts` if needed.
