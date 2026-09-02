# HuyVo Portfolio V1.8.0 – Resume Builder Pro

Professional portfolio/CV web app built with Next.js, TypeScript and CSS. V1.8.0 upgrades the resume area into a builder-style experience with multiple templates, section toggles, target-role positioning and Admin controls for CV export defaults.

## New in V1.8.0

- Version updated to `1.8.0`
- Added Resume Builder Pro configuration in `src/data/profile.ts`
- Upgraded `/resume`, `/en/resume` and `/vi/resume`
- Added resume templates:
  - ATS Friendly
  - Modern
  - Compact
  - Executive
- Added visitor-side resume controls:
  - template switcher
  - target CV selector
  - section visibility toggles
  - featured project limit
  - Print / Save PDF remains available
- Added Admin tab: `Resume Builder`
- Admin can configure:
  - default resume template
  - target role
  - resume headline
  - summary override
  - project limit
  - skill columns
  - footer note
  - show/hide sections
  - show/hide availability
  - show/hide version in resume footer
- Added Vietnamese translation form for Resume Builder content
- Resume data is normalized when loading older Supabase records
- Improved text/textarea editing stability in Admin fields
- No new Supabase table is required

## Run locally

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

Default local password:

```text
huyvo-admin
```

## Deploy to Vercel

Upload this ZIP or push the source to GitHub and import it in Vercel.

Keep Vercel output directory empty/default. Do not set it to `out`.

Recommended environment variables:

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

V1.8.0 does not require a new table. It keeps using:

```text
portfolio_profiles
portfolio_events
```

If this is a fresh setup, run:

```text
supabase/schema.sql
```

Older live records are normalized automatically when loaded, so they receive default Resume Builder settings.
