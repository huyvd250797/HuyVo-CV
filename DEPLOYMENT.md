# Production Deployment Checklist — HuyVo Portfolio V1.0.0

## 1. Local check
```bash
npm install
npm run build
npm run dev
```

## 2. Supabase
Run this file in Supabase SQL Editor:

```text
supabase/schema.sql
```

Expected table:

```text
public.portfolio_profiles
```

Expected record after first Save live:

```text
id = default
```

## 3. Vercel environment variables
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

Do not prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`.

## 4. Vercel settings
- Framework Preset: Next.js
- Build Command: default or `npm run build`
- Output Directory: leave empty/default
- Do not use `out`

## 5. Post-deploy verification
- `/` shows the portfolio.
- `/resume` is printable.
- `/contact` uses real contact data.
- `/projects/[slug]` opens project case studies.
- `/admin` unlocks with `ADMIN_PASSWORD`.
- `/admin` → Save live succeeds.
- Footer shows `V1.0.0`.
