# HuyVo Portfolio Version

## V0.8.0 — SEO & Performance

Current version: **V0.8.0**

### Added
- Global metadata base, title template, canonical URL, keywords, OpenGraph and Twitter metadata.
- `src/data/seo.ts` for reusable SEO configuration and absolute URL generation.
- JSON-LD structured data for the homepage and project case studies.
- Dynamic `sitemap.xml` with homepage, resume, contact and all project case-study pages.
- Dynamic `robots.txt` with sitemap reference.
- Web app manifest for install/share metadata.
- Dynamic OpenGraph image route.
- SVG favicon and app icon assets.
- Security/performance headers through `next.config.ts`.
- 404 page for moved or invalid routes.

### Changed
- `package.json` version updated to `0.8.0`.
- UI version source updated in `src/data/version.ts`.
- Contact copy no longer hard-codes a previous version number.
- Project case-study metadata now includes canonical URLs and social preview metadata.

### Version consistency
UI version is sourced from `src/data/version.ts` and package version is `0.8.0`.
