# HuyVo Portfolio V1.6.0 – Public Polish & Personal Branding

Professional portfolio/CV web app built with Next.js, TypeScript and CSS. V1.6.0 focuses on the public-facing experience: a stronger personal brand section, cleaner navigation, refined card styling and better positioning for recruiters, partners and customers.

## What's included

- Landing portfolio page
- Resume page with print/save PDF support
- Project portfolio and case-study pages
- Contact page and mailto contact form
- Blog / Notes
- Supabase-backed CMS Admin
- Analytics dashboard
- Multi-language routes: English and Vietnamese
- Google Drive media URL support
- Public polish and personal branding section

## New in V1.6.0

- Version updated to `1.6.0`
- Added **Personal Brand** public section
- Added brand statement, signature, brand metrics, pillars and keywords
- Added EN/VI translation support for the new branding content
- Added Admin fields to edit branding content in English source mode and Vietnamese override mode
- Added `Brand` navigation anchor
- Improved visual polish: softer rounded cards, refined CTAs, better text wrapping and public page spacing
- Fixed undefined CSS variable usage from older blog styles
- Updated CMS normalization so older Supabase records automatically receive V1.6.0 branding defaults

## Quick start

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

Local fallback password:

```text
huyvo-admin
```

## Environment variables

Create `.env.local` or configure the same values on Vercel:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-secure-admin-password
NEXT_PUBLIC_ENABLE_ANALYTICS=true
SUPABASE_ANALYTICS_TABLE=portfolio_events
ANALYTICS_MAX_ROWS=5000
```

## Supabase setup

Run this SQL in Supabase SQL Editor:

```text
supabase/schema.sql
```

V1.6.0 does not require a new Supabase table. It keeps using:

```text
portfolio_profiles
portfolio_events
```

The new `personalBranding` data is stored inside:

```text
portfolio_profiles.data.personalBranding
portfolio_profiles.data.translations.vi.personalBranding
```

## Admin workflow

```text
/admin
↓
Unlock admin
↓
Profile → Personal branding
↓
Edit English source data
↓
Toggle Tiếng Việt to edit Vietnamese branding text
↓
Save live
```

## Deploy to Vercel

1. Push this source to GitHub or import the ZIP source into your project.
2. On Vercel, keep **Output Directory** empty/default.
3. Add the environment variables above.
4. Deploy.
5. Run `supabase/schema.sql` if you have not done it before.
6. Open `/admin`, load live, update content, then save live.

## Notes

- Do not commit `.env.local`.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Media URLs can be public HTTPS links or Google Drive share links.
- If Supabase is not configured, the site falls back to `src/data/profile.ts`.
