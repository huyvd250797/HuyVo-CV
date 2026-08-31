# HuyVo Portfolio — V1.0.0 Production Portfolio

Professional personal portfolio, interactive CV, project case studies and Supabase-backed CMS built with Next.js, TypeScript and CSS. This release is Vercel-ready and intended for public portfolio use.

## V1.0.0 highlights
- Production release after the Portfolio Foundation, Professional CV, Project Portfolio, Case Study, Resume/PDF, Contact/Social, Animation/UX, SEO/Performance and Real CMS milestones.
- Public pages read live profile data from Supabase when configured and safely fall back to `src/data/profile.ts` when Supabase is unavailable.
- `/admin` supports Load live, Save live, Save draft, Export backup and production readiness status.
- Friendlier Supabase setup errors when the `portfolio_profiles` table is missing.
- Added production-readiness section to the public landing page.
- Added production deployment checklist and environment example.
- Central version source updated to `V1.0.0` in `src/data/version.ts`.

## Pages
```text
/
/resume
/contact
/projects/[slug]
/admin
```

## Supabase setup
1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run the SQL inside `supabase/schema.sql`.
4. Add these Vercel environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

Optional variables:

```bash
SUPABASE_PORTFOLIO_TABLE=portfolio_profiles
SUPABASE_PORTFOLIO_ID=default
PORTFOLIO_REVALIDATE_SECONDS=60
```

Important: never expose `SUPABASE_SERVICE_ROLE_KEY` in client code, GitHub public commits, screenshots or any variable starting with `NEXT_PUBLIC_`. Keep it only as a server-side Vercel environment variable.

## Production publishing flow
```text
/admin
↓
Unlock admin
↓
Load live
↓
Edit Profile / Experience / Projects / Skills / Contact
↓
Save live
↓
Next.js API writes to Supabase
↓
Portfolio / Resume / Contact / Case Study pages read live data
```

If Supabase is not configured, the website safely falls back to `src/data/profile.ts`.

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

Local fallback admin password:

```bash
huyvo-admin
```

## Production check before deploy
```bash
npm run build
```

Then verify:
- `/` loads portfolio content.
- `/resume` opens and print layout works.
- `/contact` uses your real email/social links.
- `/projects/[slug]` works for each project.
- `/admin` unlocks with `ADMIN_PASSWORD`.
- `Save live` succeeds after running `supabase/schema.sql`.
- Footer and Hero display `V1.0.0`.

## Deploy to Vercel
Import the repository/project into Vercel. Keep the framework preset as Next.js and leave Output Directory at its default value. Do not set Output Directory to `out`.

## Manual fallback
You can still edit `src/data/profile.ts` directly, or use `/admin` → Export Backup → Copy `profile.ts` if you want to commit profile changes into source code.
