# HuyVo Portfolio Version

## V0.9.1 — Real CMS / Supabase Admin

Current version: **V0.9.1**

### Added
- Added Supabase REST integration without adding extra runtime dependencies.
- Added server-side CMS helper in `src/lib/portfolio-cms.ts`.
- Added protected API route `src/app/api/admin/profile/route.ts`.
- Added live profile read/write flow for `/admin`.
- Added `Save live` and `Load live` actions.
- Added CMS status panel showing source, table, record id and write readiness.
- Added `supabase/schema.sql` for the required `portfolio_profiles` table.
- Added fallback behavior to source profile when Supabase is not configured.

### Changed
- `package.json` version updated to `0.9.1`.
- UI version source updated in `src/data/version.ts`.
- Home, Resume, Contact, Project Case Study and Sitemap can read live data.
- Admin is now described as Real CMS / Supabase Admin instead of Admin Lite.
- Export remains available as a backup, not the main publishing method.

### Required production environment variables
```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
```

### Optional production environment variables
```bash
NEXT_PUBLIC_SITE_URL
SUPABASE_PORTFOLIO_TABLE
SUPABASE_PORTFOLIO_ID
PORTFOLIO_REVALIDATE_SECONDS
```

### Version consistency
UI version is sourced from `src/data/version.ts` and package version is `0.9.1`.
