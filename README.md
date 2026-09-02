# HuyVo Portfolio V1.8.1 – CV Export Polish & Smart Navbar

Professional portfolio/CV web app built with Next.js, TypeScript and CSS.

V1.8.1 is a focused UX release after Resume Builder Pro. It keeps the resume feature practical instead of overly complex: users can quickly choose a clean CV form, keep the sections they need and export/save a polished A4 PDF from the browser. It also improves the public navbar so visitors can always access navigation, language toggle and theme controls while scrolling.

## New in V1.8.1

- Version updated to `1.8.1`
- `src/data/version.ts` updated to `V1.8.1 – CV Export Polish & Smart Navbar`
- Default resume template changed to `Modern`
- Resume page copy simplified around CV export
- Print button label changed to `Export CV / Save PDF`
- Added polished A4 print CSS for the Modern resume form
- Added smart navbar visibility behavior:
  - hide/fade while scrolling down
  - show again after about 1 second of no scrolling
  - show immediately when scrolling up
  - stay available when menu is open or the header is focused/hovered
- No new Supabase table is required

## Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

Default local password:

```text
huyvo-admin
```

## Deploy to Vercel

Upload this source to GitHub or import it directly into Vercel.

Build settings:

```text
Framework Preset: Next.js
Build Command: npm run build
Output Directory: leave empty / default
Install Command: npm install
```

Required environment variables for live Supabase CMS:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

If Supabase is not configured, public pages fall back to `src/data/profile.ts`.
