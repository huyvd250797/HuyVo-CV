# HuyVo Portfolio — V0.1.0 Portfolio Foundation

Professional personal portfolio / CV landing page built with Next.js 16 + React 19 + TypeScript.

## Included in V0.1.0

- Professional responsive landing page
- Sticky desktop/mobile navigation
- Hero profile section
- About section
- Working approach section
- Contact CTA
- Light / Dark / System theme switcher
- Profile data centralized in `src/data/profile.ts`
- SEO base metadata
- Vercel-ready configuration

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production check

```bash
npm run build
npm start
```

## Customize your information

Edit:

```text
src/data/profile.ts
```

Replace at minimum:

- name
- role
- headline
- description
- email
- location
- LinkedIn/GitHub links

## Deploy to Vercel

### Method 1 — GitHub + Vercel

1. Create a new GitHub repository.
2. Push this source code to the repository.
3. Log in to Vercel.
4. Choose **Add New → Project**.
5. Import the GitHub repository.
6. Framework Preset should be detected as **Next.js**.
7. Build Command: leave default (`next build`).
8. Output Directory: leave default. **Do not set it to `out`.**
9. Click **Deploy**.

No environment variables are required in V0.1.0.

### Method 2 — Vercel CLI

```bash
npm i -g vercel
vercel
```

## Version roadmap

- V0.1.0 — Portfolio Foundation ✅
- V0.2.0 — Experience & Skills
- V0.3.0 — Project Portfolio
- V0.4.0 — Project Case Study
- V0.5.0 — Resume & PDF
- V0.6.0 — Contact & Social
- V0.7.0 — Animation & UX
- V0.8.0 — SEO & Performance
- V0.9.0 — CMS / Admin
- V1.0.0 — Professional Portfolio Release
