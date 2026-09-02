# Deployment Guide – HuyVo Portfolio V1.8.0

## 1. Install and test locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
http://localhost:3000/resume
http://localhost:3000/admin
```

## 2. Deploy on Vercel

Use default Vercel settings for a Next.js project.

Do not configure Output Directory as `out`.

## 3. Environment variables

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

## 4. Supabase SQL

V1.8.0 does not add a new table. Continue using the existing schema.

For a fresh Supabase project, run:

```text
supabase/schema.sql
```

## 5. Resume Builder Pro flow

```text
/admin
→ Resume Builder
→ Choose default template
→ Configure target role, headline, summary and sections
→ Save live
→ Open /resume or /vi/resume
→ Choose template/sections if needed
→ Print / Save PDF
```

## 6. Notes

- Visitors can adjust the resume preview before printing without changing CMS data.
- Admin defaults are saved to Supabase in `portfolio_profiles.data.resumeBuilder`.
- Vietnamese fields are saved in `portfolio_profiles.data.translations.vi.resumeBuilder`.
- Existing V1.7.0 data is normalized automatically.
