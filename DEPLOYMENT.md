# Deployment Guide – HuyVo Portfolio V1.4.0

## 1. Deploy to Vercel

1. Push the source to GitHub.
2. Import the repository into Vercel.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Output Directory: leave empty/default.

## 2. Environment variables

Add these in Vercel Project → Settings → Environment Variables:

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

Then redeploy.

## 3. Supabase SQL

Run:

```text
supabase/schema.sql
```

This creates/keeps:

- `portfolio_profiles`
- `portfolio_events`

V1.4.0 Blog / Notes uses the existing `portfolio_profiles.data` JSON column. No new table is required.

## 4. Public routes

English:

```text
/en
/en/resume
/en/contact
/en/projects/[slug]
/en/blog
/en/blog/[slug]
```

Vietnamese:

```text
/vi
/vi/resume
/vi/contact
/vi/projects/[slug]
/vi/blog
/vi/blog/[slug]
```

Legacy English routes still work:

```text
/
/resume
/contact
/projects/[slug]
/blog
/blog/[slug]
```

## 5. Admin workflow

```text
/admin
↓
Login with ADMIN_PASSWORD
↓
Open Blog / Notes
↓
Edit English source content or switch to Tiếng Việt for translations
↓
Save live
```

Only blog posts with `Published` status are visible on the public website.

## 6. Media URLs

Google Drive image links are supported for avatar, project media and blog cover images. Make sure each Drive file is shared as:

```text
Anyone with the link → Viewer
```
