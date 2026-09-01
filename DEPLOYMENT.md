# Deployment Guide – HuyVo Portfolio V1.7.0

## 1. Install and run locally

```bash
npm install
npm run dev
```

## 2. Build locally

```bash
npm run build
```

## 3. Vercel settings

Use default Vercel settings for a Next.js app.

Do not set Output Directory to `out`.

## 4. Environment variables

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

## 5. Supabase schema

V1.7.0 does not add a new table. If this is a fresh setup, run:

```text
supabase/schema.sql
```

Existing V1.6.0 Supabase data will be normalized automatically when loaded, so older records will receive default V1.7.0 case-study fields in Admin.

## 6. Admin workflow

```text
/admin
→ Load live
→ Projects
→ Edit Case Study Pro blocks
→ Toggle English gốc / Tiếng Việt when needed
→ Save live
```

The Admin editing header becomes sticky and compact after scrolling so the current tab, save state, Save buttons and language toggle remain accessible.
