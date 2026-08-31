# HuyVo Portfolio — V0.9.0 Portfolio CMS / Admin

Professional personal portfolio built with Next.js, TypeScript and CSS, ready for Vercel deployment.

## V0.9.0 highlights
- Existing portfolio foundation, professional CV, project portfolio, case studies, resume PDF support, contact page, Animation/UX and SEO/Performance upgrades.
- Added `/admin` Portfolio CMS / Admin Lite.
- Added client-side password gate for the admin screen.
- Added browser draft saving with `localStorage`.
- Added editing screens for Profile, Experience, Projects, Skills, Education, Certifications, Contact and Social links.
- Added project case-study editor for context, problem, process, solution, result and lessons learned.
- Added export tools to copy generated `src/data/profile.ts` or download a JSON draft.
- Admin route is marked `noindex, nofollow`.
- Central version source updated to `V0.9.0` in `src/data/version.ts`.

## Important admin note
V0.9.0 is **Admin Lite**. It does not include a database yet.

Edits made at `/admin` are saved only in the current browser. To publish changes:

1. Open `/admin`.
2. Edit your profile data.
3. Click **Copy profile.ts**.
4. Replace the content of `src/data/profile.ts` with the copied code.
5. Commit/redeploy to Vercel.

For production, set this Vercel environment variable:

```bash
NEXT_PUBLIC_ADMIN_PASSWORD=your-password
```

If this is not set, the local fallback password is:

```bash
huyvo-admin
```

This is only a simple client-side gate. A future CMS/database version should use real server-side authentication.

## Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

Admin route:

```bash
http://localhost:3000/admin
```

## Production check
```bash
npm run build
```

## Deploy to Vercel
Import the repository/project into Vercel. Keep the framework preset as Next.js and leave Output Directory at its default value.

Recommended environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_ADMIN_PASSWORD=your-password
```

If `NEXT_PUBLIC_SITE_URL` is not set, the app falls back to `https://huyvo-portfolio.vercel.app` for sitemap, robots, OpenGraph and canonical URLs.

## Customize your information manually
You can still edit `src/data/profile.ts` directly.

Important fields to replace before publishing:
- `email`
- `contact.methods`
- `social.linkedin`
- `social.github`
- education/certifications if you want them displayed

The contact form uses `mailto:`, so messages are sent through the visitor's email app instead of a backend API.
