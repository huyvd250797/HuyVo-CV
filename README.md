# HuyVo Portfolio — V1.2.1 Google Drive Media URL Support

A professional portfolio/CV web app built with Next.js, TypeScript, Supabase CMS, visitor analytics and media asset management.

## Current version

**V1.2.1 — Google Drive Media URL Support**

## Main features

- Portfolio landing page
- Professional CV sections
- Project portfolio and project case-study detail pages
- ATS-friendly `/resume`
- Print / Save PDF resume support
- Contact page and contact cards
- SEO, sitemap, robots, manifest, OpenGraph and JSON-LD
- Supabase-backed Real CMS Admin
- `/admin` Light / Dark / System theme switcher
- Visitor analytics dashboard in `/admin`
- Media & Project Assets management in `/admin`
- Google Drive media URL support for avatar, thumbnails and gallery images
- Fallback to `src/data/profile.ts` when Supabase is not configured

## Google Drive media support

V1.2.1 automatically detects common Google Drive links and converts them to an image preview URL when rendering public pages or the Admin preview.

Supported inputs:

```text
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
https://drive.google.com/open?id=FILE_ID
https://drive.google.com/uc?export=view&id=FILE_ID
FILE_ID
```

You can paste a Google Drive share link directly into:

- Avatar image URL
- Project thumbnail image URL
- Case-study gallery asset URL
- Resume/CV file URL

For images to display publicly, set the Drive file permission to:

```text
Share → General access → Anyone with the link → Viewer
```

The app preserves the URL you entered in CMS data, but uses the normalized Google Drive preview URL for image rendering.

## Media & Project Assets

In `/admin → Media`, you can manage:

- Profile avatar image URL
- Resume/CV file URL
- Project icon / initials
- Project thumbnail image URL
- Project case-study gallery assets
- Asset type: Image, Screenshot, Diagram, Document, Video or Link
- Asset caption and alt text

Media is stored inside the existing `portfolio_profiles.data` JSONB field, so no extra Supabase table is required for this version.

Use public URLs only. For confidential work screenshots, sanitize the image before publishing.

## Analytics events

V1.1.0+ tracks public-site interactions through `/api/analytics` and stores them in Supabase table `portfolio_events`:

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

# Optional CMS
SUPABASE_PORTFOLIO_TABLE=portfolio_profiles
SUPABASE_PORTFOLIO_ID=default
PORTFOLIO_REVALIDATE_SECONDS=60

# Optional Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true
SUPABASE_ANALYTICS_TABLE=portfolio_events
ANALYTICS_MAX_ROWS=5000
```

No extra environment variable is required for Google Drive URL support.

## Supabase setup

Run the full SQL file before using Save live or Analytics:

```text
supabase/schema.sql
```

This creates:

- `portfolio_profiles`
- `portfolio_events`

## Local development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Deploy notes

- Keep Vercel Output Directory as default.
- Do not commit `.env.local`.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code or GitHub.
- After changing Vercel environment variables, redeploy the project.
