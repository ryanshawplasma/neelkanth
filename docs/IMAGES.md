# Images & artwork

All catalog imagery ships as generated SVG art so the app works offline and looks consistent.
Real photographs can replace any of it at any time.

## What is generated, and where

| Folder | Used by | Naming |
|---|---|---|
| `public/images/services/` | service cards, detail gallery | `<service-slug>.svg`, `<service-slug>-2.svg` (second gallery image), `_fallback-<TYPE>.svg` |
| `public/images/temples/` | temple cards & pages | `<temple-slug>.svg`, `<temple-slug>-2.svg` |
| `public/images/festivals/` | festival cards, reminders, banners | `<art-key>.svg` (e.g. `diwali.svg`, `ekadashi.svg`) |
| `public/images/categories/` | category tiles on home | `<category-slug>.svg` |
| `public/images/hero.svg`, `og.svg`, `placeholder.svg` | hero art, social card, fallback | fixed names |
| `public/icons/` | PWA / favicon | `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `badge.png` |
| `public/uploads/demo/` | demo pandit avatars and demo KYC documents | seeded only |

Regenerate everything (deterministic, ~5 s):

```bash
npx tsx scripts/generate-art.ts
```

The generator reads `src/data/*.ts`, so a new service added to the seed automatically gets art on the next run.
Compositions are chosen from the service's deity, type and tags (see `scripts/art/mapping.ts`);
palettes per deity live in `scripts/art/palette.ts`, emblems in `scripts/art/emblems.ts`.

## Replacing art with real photos

**From the admin console (recommended)**

- Services → open a service → *Media*: upload photos (first image is the cover) or paste an image URL.
- Temples → open a temple → upload cover/gallery images.
- Festivals → open a festival → image upload or URL.
- Banners, categories and library items have an image field in their editors too.

Uploads are stored under `public/uploads/<folder>/` via `POST /api/upload` and referenced by URL,
so nothing else needs to change. Swap the `store()` function in `src/app/api/upload/route.ts` for S3 or
Cloudinary in production.

**By file**

Drop a same-named file into the folder (e.g. `public/images/services/rudrabhishek-kashi-vishwanath.jpg`)
and update the row's `images` / `coverUrl` in the admin console or in `src/data/services.ts` (then `npm run db:seed`).

## Guidelines for photos

- Landscape 4:3 (800×600 or larger), under 500 KB for cards.
- Keep the subject centred; cards crop the edges on narrow phones.
- Prefer temple-supplied or licensed photography; the generated art is a safe default while you collect them.
