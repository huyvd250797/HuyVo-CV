# HuyVo Portfolio V1.5.0 – Advanced Admin CMS

Professional portfolio/CV web app built with Next.js, TypeScript and CSS. V1.5.0 upgrades the Admin CMS experience so it is easier to maintain real CV content in production.

## Highlights

- Public portfolio, resume, contact, project case studies and blog notes
- Supabase-powered live CMS with source fallback
- Bilingual English/Vietnamese content support
- Analytics dashboard for visitor insights
- Media/project assets with Google Drive URL support
- Advanced Admin CMS controls for adding, duplicating, deleting and reordering content
- Safer text fields and textarea editing behavior
- Production validation and unsaved-change protection

## New in V1.5.0

- Version updated to `1.5.0`
- Admin storage/session keys updated to V1.5.0
- Added content health validation panel
- Added quick CMS statistics panel
- Added unsaved-change indicator
- Added browser warning when leaving with unsaved changes
- Added section-level Save draft / Save live actions
- Added duplicate/reorder/delete controls for:
  - Experience
  - Projects
  - Project gallery assets
  - Skill groups
  - Education
  - Certifications
  - Contact method cards
  - Blog / Notes
- Blog/project duplicate actions auto-generate unique slugs
- Save live is blocked when required errors exist
- Improved all shared text inputs/textareas:
  - Enter/newline behavior stays stable
  - no aggressive trimming while typing
  - stop admin shortcut/key bubbling from text controls
  - safer multiline wrapping
- Updated README, VERSION and deployment notes

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

Local fallback password:

```text
huyvo-admin
```

## Vercel environment variables

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

Run:

```text
supabase/schema.sql
```

V1.5.0 does not require a new Supabase table. It keeps using:

```text
portfolio_profiles
portfolio_events
```

## Deploy on Vercel

1. Upload/import the project to GitHub.
2. Create a Vercel project.
3. Keep Output Directory empty/default.
4. Add environment variables.
5. Deploy.
6. Open `/admin`, load live data, edit content, then Save live.
