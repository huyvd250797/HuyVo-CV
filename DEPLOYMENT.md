# Deployment Guide – V1.8.1

## Version

`V1.8.1 – CV Export Polish & Smart Navbar`

## Vercel settings

```text
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
Output Directory: leave empty / default
```

Do not set the output directory to `out`.

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

## Supabase

V1.8.1 does not require a new table. Keep the existing tables:

```text
portfolio_profiles
portfolio_events
```

If you are setting up a fresh Supabase project, run:

```text
supabase/schema.sql
```

## CV export

Open:

```text
/resume
/en/resume
/vi/resume
```

Choose the CV form and click `Export CV / Save PDF`. The browser print dialog can save the CV as PDF.

Recommended browser print options:

```text
Destination: Save as PDF
Paper size: A4
Margins: Default or None
Background graphics: Enabled
```
