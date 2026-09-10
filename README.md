# DivyaDham (दिव्यधाम)

A Sri-Mandir-style temple services platform: online poojas performed at famous temples (with live link + video),
chadhava offerings, pandit-at-home rituals, astrology consultations, prasad delivery, daily panchang,
a festival calendar with push reminders, an aarti/chalisa library, a pandit portal with KYC, and a full admin console.
UI in **English and Hindi**.

## Quick start

```bash
npm run setup     # install deps, generate Prisma client, create SQLite DB, seed demo data + artwork
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
  run every 30 min in dev and via `GET /api/cron/reminders?secret=…` in production.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for conventions and module map.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | dev server on :3000 |
| `npm run build && npm start` | production build |
| `npm run db:push` | apply schema to the SQLite DB |
| `npm run db:seed` | (re)seed demo data — idempotent |
| `npm run db:reset` | wipe DB and reseed |
| `npx tsx scripts/generate-art.ts` | regenerate SVG artwork + PWA icons |
| `npm run typecheck` | `tsc --noEmit` |
| `npx tsx scripts/dev/smoke.ts` | fetch every route as anonymous / devotee / pandit / admin against a running dev server |
| `npx tsx scripts/dev/cookie.ts 9111111111` | print a signed session cookie for curl-based testing |

## Production notes

- Set a strong `AUTH_SECRET`, `CRON_SECRET`; generate VAPID keys with `npx web-push generate-vapid-keys` to enable web push.
- Switch `PAYMENT_PROVIDER=razorpay` and add keys; the provider abstraction is in `src/lib/payments.ts`.
- Wire an SMS gateway in `src/lib/otp.ts` (`deliver()`).
- For Postgres, change `provider` in `prisma/schema.prisma` and `DATABASE_URL`.
- Uploads go to `public/uploads`; replace `store()` in `src/app/api/upload/route.ts` with S3/Cloudinary.
