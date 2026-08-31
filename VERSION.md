# Version History

## V1.0.0 — Production Portfolio

Current version: **V1.0.0**

This release turns the portfolio into a production-ready public CV website.

### Included
- Portfolio landing page
- Professional CV sections
- Selected projects and project filters
- Project case-study detail pages
- ATS-friendly `/resume`
- Print / Save PDF resume support
- `/contact` page and contact cards
- Animation and UX polish
- SEO metadata, sitemap, robots, manifest, OpenGraph and JSON-LD
- Supabase-backed Real CMS Admin
- Fallback to `src/data/profile.ts`
- Production readiness section
- Friendlier Supabase setup errors
- Production deployment checklist

### Version sync
- `package.json` version updated to `1.0.0`
- `src/data/version.ts` label updated to `V1.0.0`
- Admin storage/session keys updated for the production release
- README updated for production deployment

## Notes
Run `supabase/schema.sql` in Supabase before using Save live in `/admin`.

UI version is sourced from `src/data/version.ts` and package version is `1.0.0`.
