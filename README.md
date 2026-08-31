# HuyVo Portfolio — V0.9.1 Real CMS / Supabase Admin

Professional personal portfolio built with Next.js, TypeScript and CSS, ready for Vercel deployment.

## V0.9.1 highlights
- Existing portfolio foundation, professional CV, project portfolio, case studies, resume PDF support, contact page, Animation/UX, SEO/Performance and Admin UI.
- Upgraded `/admin` from Admin Lite to Real CMS mode.
- Added Supabase-backed profile storage through a protected Next.js API route.
- Public portfolio pages now read live profile data from Supabase when configured.
- `/resume`, `/contact`, `/projects/[slug]` and sitemap can use live Supabase data.
- Added fallback to `src/data/profile.ts` when Supabase is not configured or the profile record does not exist.
- Added `Save live` action in `/admin` to write profile data to Supabase.
- Added `Load live` action to reload the current Supabase/source profile.
- Added browser draft saving and export tools as backup options.
- Added Supabase schema at `supabase/schema.sql`.
- Central version source updated to `V0.9.1` in `src/data/version.ts`.

## Supabase setup
1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run the SQL inside `supabase/schema.sql`.
4. Add these Vercel environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

Optional variables:

```bash
SUPABASE_PORTFOLIO_TABLE=portfolio_profiles
SUPABASE_PORTFOLIO_ID=default
PORTFOLIO_REVALIDATE_SECONDS=60
```

Important: never expose `SUPABASE_SERVICE_ROLE_KEY` in client code. Keep it only as a server-side Vercel environment variable.

## How publishing works in V0.9.1
```text
/admin
↓
Unlock admin
↓
Edit Profile / Experience / Projects / Skills / Contact
↓
Click Save live
↓
Next.js API writes to Supabase
↓
Portfolio / Resume / Project pages read live data
```

If Supabase is not configured, the website safely falls back to `src/data/profile.ts`.

## Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

Admin route:

```bash
http://localhost:3000/admin
```

Local fallback admin password:

```bash
huyvo-admin
```

## Production check
```bash
npm run build
```

## Deploy to Vercel
Import the repository/project into Vercel. Keep the framework preset as Next.js and leave Output Directory at its default value.

## Manual fallback
You can still edit `src/data/profile.ts` directly, or use `/admin` → Export Backup → Copy `profile.ts` if you want to commit profile changes into source code.
