# HuyVo Portfolio — V0.8.1 OpenGraph Build Fix

Professional personal portfolio built with Next.js, TypeScript and CSS, ready for Vercel deployment.

## V0.8.1 highlights
- Existing portfolio foundation, professional CV, project portfolio, case studies, resume PDF support, contact page and Animation/UX upgrades.
- Fixed Vercel prerender error on `/opengraph-image` by adding explicit flex display to OpenGraph image containers.
- Central version source updated to `V0.8.1` in `src/data/version.ts`.
- SEO metadata upgraded in `src/app/layout.tsx`.
- Added `src/data/seo.ts` for canonical URL, title, description and keywords.
- Added structured data JSON-LD for Person, WebSite, Project Case Study and Breadcrumbs.
- Added `sitemap.xml` via `src/app/sitemap.ts`.
- Added `robots.txt` via `src/app/robots.ts`.
- Added `manifest.webmanifest` via `src/app/manifest.ts`.
- Added dynamic OpenGraph image via `src/app/opengraph-image.tsx`.
- Added SVG favicon/app icons in `public/`.
- Added security/performance response headers in `next.config.ts`.
- Added a polished 404 page.

## Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Production check
```bash
npm run build
```

## Deploy to Vercel
Import the repository/project into Vercel. Keep the framework preset as Next.js and leave Output Directory at its default value.

Recommended environment variable before publishing:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

If you do not set it, the app falls back to `https://huyvo-portfolio.vercel.app` for sitemap, robots, OpenGraph and canonical URLs.

## Customize your information
Edit `src/data/profile.ts`.

Important fields to replace before publishing:
- `email`
- `contact.methods`
- `social.linkedin`
- `social.github`
- education/certifications if you want them displayed

The contact form uses `mailto:`, so messages are sent through the visitor's email app instead of a backend API.
