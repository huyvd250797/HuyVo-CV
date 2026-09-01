# HuyVo Portfolio V1.4.0 – Blog / Notes

Professional portfolio/CV web app built with Next.js, TypeScript and CSS. V1.4.0 extends the production portfolio with a bilingual Blog / Notes module for publishing professional notes from the Admin CMS.

## Main features

- Portfolio landing page
- ATS-friendly Resume page
- Project case-study pages
- Contact page and mailto form
- Supabase CMS Admin
- Analytics & visitor insights
- Media/project assets with Google Drive URL support
- Admin dark/light/system theme
- English/Vietnamese public routes
- Blog / Notes public pages
- Blog / Notes Admin editor with English/Tiếng Việt toggle
- SEO, sitemap, robots, manifest, OpenGraph and JSON-LD

## New in V1.4.0

- Added public Blog / Notes pages:
  - `/blog`
  - `/blog/[slug]`
  - `/en/blog`
  - `/vi/blog`
  - `/en/blog/[slug]`
  - `/vi/blog/[slug]`
- Added Blog preview section on the landing page.
- Added Blog / Notes tab inside `/admin`.
- Blog posts support title, slug, date, status, featured, tags, summary, content paragraphs and cover image URL.
- Only `Published` blog posts appear on public pages.
- Blog supports English source content and Vietnamese translation fields through the existing Admin language toggle.
- Added blog SEO metadata, sitemap entries and JSON-LD BlogPosting data.
- Blog content is stored in the existing `portfolio_profiles.data` JSON column, so no new Supabase table is required.

## Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000/en
http://localhost:3000/vi
http://localhost:3000/blog
http://localhost:3000/admin
```

## Build

```bash
npm run build
npm run start
```

## Vercel deploy

Import the project to Vercel and keep Output Directory empty/default. Do not set Output Directory to `out`.

## Environment variables

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
NEXT_PUBLIC_ENABLE_ANALYTICS=true
SUPABASE_ANALYTICS_TABLE=portfolio_events
ANALYTICS_MAX_ROWS=5000
```

## Supabase setup

Run this file in Supabase SQL Editor:

```text
supabase/schema.sql
```

V1.4.0 does not require a new Supabase table. Blog posts are saved inside:

```text
portfolio_profiles.data.blog
portfolio_profiles.data.translations.vi.blog
```

## Admin workflow

```text
/admin
↓
Login with ADMIN_PASSWORD
↓
Open Blog / Notes
↓
Create or edit English source notes
↓
Switch to Tiếng Việt to translate each note in-place
↓
Save live
```
