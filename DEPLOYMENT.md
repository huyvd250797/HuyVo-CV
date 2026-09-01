# Deployment Guide – HuyVo Portfolio V1.6.0

## 1. Install locally

```bash
npm install
npm run dev
```

## 2. Build locally

```bash
npm run build
```

## 3. Supabase

Run the SQL file if this is your first CMS/Analytics setup:

```text
supabase/schema.sql
```

V1.6.0 does not add a new table. Branding content is saved into the existing profile JSON.

## 4. Vercel Environment Variables

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

## 5. Vercel settings

- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: leave empty/default
- Install Command: default

## 6. After deploy

```text
/admin
↓
Load live
↓
Profile → Personal branding
↓
Update brand statement, metrics, pillars and keywords
↓
Toggle Tiếng Việt to add Vietnamese content
↓
Save live
```

## 7. Production checklist

- Replace placeholder email
- Replace placeholder LinkedIn/GitHub links
- Add avatar/resume/media URLs
- Save live once from Admin
- Check `/`, `/en`, `/vi`, `/resume`, `/blog`, `/contact`
- Check one project case-study page
- Check analytics dashboard after public page views
