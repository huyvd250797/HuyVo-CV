# HuyVo Portfolio Version

## V0.8.1 — OpenGraph Build Fix

Current version: **V0.8.1**

### Fixed
- Fixed Next.js/Satori prerender error for `/opengraph-image` during Vercel build.
- Added explicit `display: flex` to OpenGraph image `<div>` nodes that may contain more than one child.
- Replaced mixed text/expression rendering in the OpenGraph title node with a single template expression.

### Changed
- `package.json` version updated to `0.8.1`.
- UI version source updated in `src/data/version.ts`.

### Inherited from V0.8.0
- SEO metadata.
- `src/data/seo.ts`.
- JSON-LD structured data.
- Dynamic sitemap and robots.
- Web app manifest.
- Dynamic OpenGraph image route.
- SVG favicon and app icon assets.
- Security/performance headers.
- 404 page.

### Version consistency
UI version is sourced from `src/data/version.ts` and package version is `0.8.1`.
