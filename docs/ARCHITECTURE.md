# DivyaDham — Architecture & Conventions

Temple-services platform in the style of Sri Mandir: online poojas performed at temples, chadhava
(offerings), pandit-at-home rituals, astrology consultations, prasad delivery, daily panchang,
festival calendar with reminders, a pandit portal with KYC, and a full admin console.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions), TypeScript strict |
| Styling | Tailwind CSS v4 with design tokens in `src/app/globals.css` (saffron/maroon/gold palette) |
| DB | Prisma 6 + SQLite (`prisma/schema.prisma`). Prod: change provider to postgresql. |
| Auth | Phone OTP (dev OTP `123456`) → JWT cookie `dd_session` (jose). Admin: email+password. |
| i18n | Custom, cookie-based (`dd_locale`), **en + hi**. Per-module dictionaries. |
| Icons | lucide-react |
| Push | web-push (VAPID) + service worker `public/sw.js`; in-app `Notification` table |
| Panchang | `mhah-panchang` + `suncalc` wrapped in `src/lib/panchang.ts` |
| Payments | Provider abstraction `src/lib/payments.ts`: `mock` (built-in simulator page) or `razorpay` |
| Uploads | `POST /api/upload` → Vercel Blob if `BLOB_READ_WRITE_TOKEN`, else the database on serverless hosts (`StoredFile`, served by `/api/files/:id/:name`), else `public/uploads/`. KYC is always private (see below) |

## Roles & route groups

```
src/app/
  (app)/        devotee app  — mobile-first PWA, bottom nav. Public browsing; booking needs login.
  (pandit)/     pandit portal — /pandit/*  (login, register, kyc, dashboard, bookings, services, availability, earnings)
  (admin)/      admin console — /admin/*   (sidebar on desktop; drawer + bottom bar on phones)
  api/          route handlers (upload, push, cron, payments webhook, panchang)
  pay/          mock payment gateway page (provider = mock)
```

`src/middleware.ts` enforces: `/admin/*` → ADMIN, `/pandit/*` → PANDIT|ADMIN (except login/register),
`/bookings /account /onboarding /notifications /checkout` → logged in.

## Key modules (already built — use these, don't reinvent)

| File | Exports |
|---|---|
| `src/lib/db.ts` | `db` Prisma client singleton |
| `src/lib/auth.ts` | `getSession()`, `getCurrentUser()`, `requireUser(roles?)`, `requireAdmin()`, `requirePandit()`, `createSession`, `destroySession`, `normalizePhone`, `audit()` |
| `src/lib/auth-actions.ts` | server actions: `requestOtpAction(phone)`, `verifyOtpAction(phone, code, intent)`, `adminLoginAction(email, pw)`, `logoutAction()` |
| `src/lib/otp.ts` | `requestOtp`, `verifyOtp` (server only) |
| `src/lib/utils.ts` | `cn`, `formatINR`, `parseJson`, `toJson`, `toDateKey`, `fromDateKey`, `addDays`, `daysUntil`, `formatDate`, `formatDateTime`, `generateBookingCode`, `slugify`, `maskDoc`, `initials`, `loc(obj, field, locale)`, `locJson` |
| `src/lib/constants.ts` | bilingual lists: `PANDIT_CLASSIFICATIONS`, `SPECIALITIES`, `LANGUAGES`, `SAMPRADAYAS`, `GOTRAS`, `RASHIS`, `INDIAN_STATES`, `SERVICE_TYPES`, `BOOKING_STATUSES`, `KYC_STATUSES`, `KYC_DOC_TYPES`, `FESTIVAL_TYPES`, `CONSULT_TOPICS`, `WEEKDAYS`, helpers `pickBi`, `labelOf` |
| `src/lib/panchang.ts` | `getPanchang(date, lat, lng)` → tithi/nakshatra/yoga/karana/paksha/masa/samvat/sunrise/sunset/rahu kaal/abhijit, bilingual names |
| `src/lib/notify.ts` | `notifyUser({userId, type, titleEn, titleHi, bodyEn, bodyHi, href, dedupeKey})` — creates in-app notification + sends web push |
| `src/lib/payments.ts` | `createPaymentForBooking(bookingId)` → `{ redirectUrl }`, `markPaid(...)`, `refund(...)` |
| `src/lib/reminders.ts` | `runFestivalReminders()`, `runBookingReminders()` — idempotent via `dedupeKey` |
| `src/i18n/server.ts` | `getT()` → `{ t, locale }` (server components/actions), `getLocale()` |
| `src/i18n/client.tsx` | `useT()`, `useLocale()`, `useLoc()` (client components) |
| `src/i18n/messages/*.ts` | dictionaries: `common` (shared), `app`, `pandit`, `admin` — **each module owns one file** |
| `src/components/ui/*` | `Button`, `ButtonLink`, `Card`, `CardHeader`, `CardBody`, `SectionHeader`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Toggle`, `ChipGroup`, `Badge`, `Sheet`, `ConfirmDialog`, `Skeleton`, `EmptyState`, `Avatar`, `Stars`, `PageHeader`, `Tabs`, `Accordion`, `Stat`, `Divider`, `useToast`, `LanguageSwitch`, `LanguagePicker`, `ImageUpload`, `MultiImageUpload`, `uploadFile` |

## Conventions

- **Bilingual data**: DB rows carry `xxxEn` / `xxxHi` columns. Read with `loc(row, "name", locale)`
  on the server or `useLoc()(row, "name")` on the client. JSON columns (`benefitsEn`, `images`,
  `devotees`, …) are strings — parse with `parseJson(row.images, [])`.
- **UI strings**: never hard-code English in JSX. Add the key to the module's dictionary
  (both `en` and `hi`) and call `t("app.key")`. `common.*` holds shared words.
- **Server first**: pages are async server components that fetch with Prisma and pass plain
  objects to small client components. Mutations are server actions in `actions.ts` next to the
  route (or `src/lib/*-actions.ts`), returning `{ ok, error? }`, and calling `revalidatePath`.
- **Auth in actions**: always re-check with `getCurrentUser()` / `requireAdmin()` inside server
  actions and route handlers — middleware is only the first gate.
- **Money**: integer rupees. Display with `formatINR`.
- **Dates**: `YYYY-MM-DD` strings for calendar dates (`toDateKey`), `DateTime` only for timestamps.
- **Images**: services/temples/festivals reference `/images/<kind>/<slug>.svg` (generated art) or
  `/uploads/...` (admin uploads). Render with a plain `<img>` (`next/image` needs remote config).
- **Mobile-first**: the devotee app is designed for 360–430px widths inside `max-w-md mx-auto`,
  with a bottom navigation bar. The admin console must also work on a 375px phone: no sideways page
  scroll, secondary table columns hidden or scrolling inside their card. Form fields render at 16px on
  touch devices (globals.css) so iOS never zooms the page on focus.
- **Accessibility**: labels on inputs, `aria-label` on icon buttons, focus rings kept.
- **No new dependencies** without a good reason — the UI kit covers most needs.

## Data flow: booking

1. Service detail → choose package (+ addons) → `/checkout/[serviceId]?package=…`
2. Checkout collects devotee names + gotra, date/slot (and address for at-home), sankalp note.
3. `createBookingAction` → Booking (`PENDING_PAYMENT`) + Payment (`CREATED`) →
   `createPaymentForBooking` → redirect to `/pay/[paymentId]` (mock) or Razorpay checkout.
4. On success `markPaid` → Booking `CONFIRMED`, `BookingEvent` appended, `notifyUser` (booking + pandit if assigned).
5. Admin/pandit move status → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED` (attaches `videoUrl`, `photos`).
6. Devotee sees timeline, video, can review.

## Accounts on a device (switching)

Every sign-in (`createSession`) also records the account in a signed, httpOnly cookie `dd_accounts`
(max 5, same 30-day window as the session). The account that was signed in just before is kept too.
`switchAccountAction(uid, to?)` makes another remembered account active without OTP/password and
keeps its original sign-in time (the session JWT carries `sia`), so switching never extends a session.
`logoutAction` / `signOutAction("current")` forget the account on this device; `signOutAction("all")`
clears the list. UI: `src/components/accounts/account-switcher.tsx` — the account sheet (shortcuts to
admin console / pandit portal / devotee app, one-tap switch, add account, sign out) is opened from the
admin top bar and drawer, the pandit top bar avatar, and the app's Account page. Login pages accept
`?add=1` ("Add another account") and, when signed out, offer "Continue as" for remembered accounts.

## Support chat

One conversation per customer (`SupportThread`, `SupportMessage`) — `src/lib/support.ts`.
Customers chat at `/support` (links from Account and every booking page, which attaches the booking);
admins use `/admin/support` (inbox, filters) and `/admin/support/[id]` (full-screen on phones, customer
details + recent bookings). Sending is a server action (`src/lib/support-actions.ts`); both sides poll a
GET route (`/api/support/messages`, `/api/admin/support/[id]/messages`) every 3–15 s while visible, so it
works on serverless hosts without websockets. Unread counters live on the thread; push/in-app
notifications (type `SUPPORT`) go out for the first unread message of a burst and not while the other
side has the chat open (`userSeenAt` / `adminSeenAt`). A customer message reopens a resolved thread.

## Uploads

`src/lib/uploads.ts` decides where a file goes and who may upload it. Folders are allow-listed per role
(pandits: `kyc`, `pandits`, `pooja-photos`; devotees: `avatars`; admins: any) and only admins may upload
SVG. Files in `kyc` are always stored privately in the database and served by `/api/files/:id/:name` only
to their uploader and to admins (`Cache-Control: no-store`). Public files use Vercel Blob when configured,
otherwise the database on serverless hosts (cached a year at the CDN), otherwise `public/uploads/`.
Served files carry a sandboxing CSP so an SVG or PDF opened directly cannot run script. The browser
shrinks photos before upload (`uploadFile` in `src/components/ui/image-upload.tsx`: max 1920px,
re-encoded, EXIF/GPS stripped) because Vercel rejects request bodies over 4.5 MB; the server caps files
at 4 MB and rate-limits non-admin database uploads (40 an hour, 60 MB a day).

## Reminders ("push near-date things")

`src/lib/reminders.ts` runs from `GET /api/cron/reminders?secret=CRON_SECRET` (call from any
scheduler) and also every 30 minutes in dev via `src/instrumentation.ts`. For each active festival
with `pushEnabled`, for each `remindDaysBefore` offset matching today, it notifies every onboarded
user once (`dedupeKey = festival:<slug>:<offset>:<date>`), linking to related services. Booking
reminders fire 1 day before and on the morning of `scheduledDate`.

## Seed & dev

```
npm run setup      # install, generate, push schema, seed
npm run dev        # http://localhost:3000
```
Admin: `admin@divyadham.app` / `Admin@123` → `/admin`.
Devotee/pandit login: any 10-digit number, OTP `123456`.
Seeded pandits: phones `9000000001`–`9000000006` (OTP `123456`).
