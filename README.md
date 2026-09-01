# HuyVo Portfolio V1.7.0 – Career Case Study Pro

Professional portfolio/CV web app built with Next.js, TypeScript and CSS. V1.7.0 upgrades project detail pages into stronger career case studies and improves the Admin editing experience with a sticky compact editing header.

## New in V1.7.0

- Version updated to `1.7.0`
- Project case-study pages upgraded to Career Case Study Pro layout
- Added case-study blocks for:
  - Overview metrics
  - Stakeholders
  - Responsibilities
  - Delivery timeline
  - Challenges
  - Solution
  - Impact / outcomes
  - Competencies demonstrated
  - Lessons learned
- Added case-study CTA group: View Resume, Contact Me and Explore Other Projects
- Added Admin fields to edit the new case-study content
- Added Vietnamese translation inputs for the new case-study content
- Added sticky compact Admin editing header
- Admin header now stays visible while scrolling and keeps:
  - current section name
  - saved/unsaved state
  - Save draft
  - Save live
  - English gốc / Tiếng Việt toggle
- Improved Admin text entry for long textarea content and translation fields
- Updated CMS normalization so older Supabase records receive V1.7.0 case-study defaults automatically

## Stack

- Next.js
- TypeScript
- CSS custom properties
- Supabase CMS fallback support
- Vercel-ready structure

## Local setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

## Admin

Open:

```text
/admin
```

Default local fallback password:

```text
huyvo-admin
```

For Vercel production, set:

```env
ADMIN_PASSWORD=your-secure-password
```

## Supabase

V1.7.0 does not require a new Supabase table. It keeps using:

```text
portfolio_profiles
portfolio_events
```

If you have not created the tables yet, run:

```text
supabase/schema.sql
```

## Required Vercel environment variables

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

## Deploy to Vercel

1. Upload the ZIP to a GitHub repository or import the folder into Vercel.
2. Keep Vercel Output Directory empty/default.
3. Add the environment variables above.
4. Deploy.
5. Open `/admin`, load live data and save once.

## Notes

- Public pages read Supabase live data when configured.
- If Supabase is missing or not configured, pages fall back to `src/data/profile.ts`.
- Google Drive media URLs are supported through direct thumbnail conversion.
- Admin draft data is also stored in browser `localStorage` as a safety draft.
