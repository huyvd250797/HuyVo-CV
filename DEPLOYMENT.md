# Deployment Guide – HuyVo Portfolio V1.5.0

## 1. Install and run locally

```bash
npm install
npm run dev
```

Open `/admin` and unlock with `ADMIN_PASSWORD` or the local fallback `huyvo-admin`.

## 2. Supabase

Run `supabase/schema.sql` if you have not already created the CMS and analytics tables.

V1.5.0 does not add a new database table. It improves the Admin CMS UI and uses the same tables:

```text
portfolio_profiles
portfolio_events
```

## 3. Vercel variables

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

## 4. After deploy

1. Open `/admin`.
2. Click Load live.
3. Update content.
4. Use the Content health panel to fix required errors.
5. Click Save live.
6. Check `/`, `/resume`, `/projects/[slug]` and `/blog`.

## 5. Important notes

- Do not commit `SUPABASE_SERVICE_ROLE_KEY` to GitHub.
- Keep Vercel Output Directory empty/default.
- If duplicated projects or blog posts are created, V1.5.0 generates unique slugs automatically.
- If the Unsaved badge is visible, Save draft or Save live before leaving.
