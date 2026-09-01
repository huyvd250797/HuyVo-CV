# HuyVo Portfolio V1.3.1 – Admin Translation Toggle UX

Professional portfolio/CV web app built with Next.js, TypeScript and CSS. This patch improves the Admin multilingual editing experience with an English/Tiếng Việt toggle in content tabs, while keeping the English source data untouched.

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
- SEO, sitemap, robots, manifest, OpenGraph and JSON-LD

## New in V1.3.1

- Added an Admin content toggle: **English gốc / Tiếng Việt**.
- Vietnamese fields now appear directly inside Profile, Media, Experience, Projects, Skills and Credentials tabs.
- Removed the need to edit raw translation JSON for normal bilingual content updates.
- English source data remains unchanged when editing in Tiếng Việt mode.
- Empty Vietnamese fields continue to fall back to English source content.

## From V1.3.0

- `/en` and `/vi` landing pages
- `/en/resume` and `/vi/resume`
- `/en/contact` and `/vi/contact`
- `/en/projects/[slug]` and `/vi/projects/[slug]`
- Navigation language switcher: EN / VI
- Localized UI labels for public pages
- Vietnamese content overrides with fallback to English source data
- Admin **Language** tab for editing `translations` JSON
- Fixed Admin textarea line-break issue when entering multi-line list content

## Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000/en
http://localhost:3000/vi
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

V1.3.1 does not require a new table compared with V1.2.x/V1.1.x. Multilingual content is stored inside `portfolio_profiles.data.translations`.

## Editing multilingual content

Go to:

```text
/admin → Language
```

The main profile fields are treated as English content. Vietnamese content is stored as overrides inside:

```text
translations.vi
```

If a Vietnamese field is missing, the app automatically falls back to the English source value.

## Admin textarea fix

Line-list textareas now keep the cursor/new line while typing. Blank rows are cleaned only when leaving the field, so pressing Enter works normally.
