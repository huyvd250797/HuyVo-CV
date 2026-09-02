# HuyVo Portfolio V1.9.0 – Professional Architecture

Professional portfolio/CV web app built with Next.js, TypeScript and CSS.

V1.9.0 restructures the public portfolio around a recruiter-first reading flow. Instead of presenting many equally weighted sections, the homepage now leads with professional positioning, a consolidated snapshot, selected work, experience and expertise. Existing CMS, Resume, i18n, analytics, blog, contact and case-study foundations are preserved.

## New in V1.9.0

- Version updated to `1.9.0`
- Added `ProfessionalSnapshot` to merge About, Career Summary and Personal Branding into one focused section
- Reordered homepage to prioritize recruiter decision flow:
  - Hero
  - Professional Snapshot
  - Selected Work
  - Professional Experience
  - Expertise
  - How I Work
  - Credentials
  - Insights
  - Contact
- Moved Selected Work above Experience
- Reworked projects as mini case studies with problem, contribution and impact
- Simplified navbar to Work, Experience, Expertise, Profile, Insights and Resume
- Removed Production Readiness from the public homepage
- Removed public version label from Hero and Footer
- Added responsive layout polish for the new professional architecture
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
