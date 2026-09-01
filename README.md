# HuyVo Portfolio — V1.1.0 Analytics & Visitor Insights

A professional portfolio/CV web app built with Next.js, TypeScript and Supabase CMS.

## Current version

**V1.1.0 — Analytics & Visitor Insights**

## Main features

- Portfolio landing page
- Professional CV sections
- Project portfolio and project case-study detail pages
- ATS-friendly `/resume`
- Print / Save PDF resume support
- Contact page and contact cards
- SEO, sitemap, robots, manifest, OpenGraph and JSON-LD
- Supabase-backed Real CMS Admin
- `/admin` dark mode with Light / Dark / System theme switcher
- Visitor analytics dashboard in `/admin`
- Fallback to `src/data/profile.ts` when Supabase is not configured

## Analytics events

V1.1.0 tracks public-site interactions through `/api/analytics` and stores them in Supabase table `portfolio_events`:

- `page_view`
- `project_view`
- `cta_click`
- `resume_download`
- `contact_click`

Admin pages are not tracked.

## Environment variables

Create these variables on Vercel:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password

# Optional
SUPABASE_PORTFOLIO_TABLE=portfolio_profiles
SUPABASE_PORTFOLIO_ID=default
PORTFOLIO_REVALIDATE_SECONDS=60
NEXT_PUBLIC_ENABLE_ANALYTICS=true
SUPABASE_ANALYTICS_TABLE=portfolio_events
ANALYTICS_MAX_ROWS=5000
```

## Supabase setup

Run the full SQL file before using Save live or Analytics:

```text
supabase/schema.sql
```

The SQL creates:

- `portfolio_profiles`
- `portfolio_events`
- indexes for analytics queries
- public read policy for portfolio profile data only

Visitor analytics stays private because `portfolio_events` has no public select policy. Admin analytics reads through the protected API route using `SUPABASE_SERVICE_ROLE_KEY`.

## Local development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

## Deploy on Vercel

- Upload/push the project source
- Keep Output Directory empty/default
- Add the environment variables above
- Redeploy after changing environment variables

## Version source

UI version is read from:

```text
src/data/version.ts
```
