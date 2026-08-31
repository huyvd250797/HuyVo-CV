# HuyVo Portfolio Version

## V0.9.0 — Portfolio CMS / Admin

Current version: **V0.9.0**

### Added
- Added `/admin` route for Portfolio CMS / Admin Lite.
- Added simple client-side password gate.
- Added browser draft saving with `localStorage`.
- Added Profile editor.
- Added Experience editor.
- Added Project Portfolio editor.
- Added Project Case Study editor.
- Added Skill Group editor.
- Added Education and Certification editor.
- Added Contact and Social editor.
- Added generated `profile.ts` export and JSON download.
- Added noindex/nofollow metadata for admin.

### Changed
- `package.json` version updated to `0.9.0`.
- UI version source updated in `src/data/version.ts`.
- README updated with Admin Lite usage and Vercel environment variables.

### Admin limitation
V0.9.0 does not write to a database. Admin changes are saved as browser drafts and must be exported back into `src/data/profile.ts` before deployment.

### Version consistency
UI version is sourced from `src/data/version.ts` and package version is `0.9.0`.
