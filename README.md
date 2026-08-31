# HuyVo Portfolio — V0.5.0 Resume & PDF

Professional personal portfolio built with Next.js, TypeScript and CSS, ready for Vercel deployment.

## V0.5.0 highlights
- Existing portfolio foundation, professional CV, project portfolio and project case studies.
- New `/resume` ATS-friendly resume page.
- Print / Save PDF directly from the browser.
- A4 print styles for clean PDF export.
- Resume content reuses `src/data/profile.ts` so the website and printable CV stay synchronized.
- Central version source at `src/data/version.ts`.

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

## Customize your information
Edit `src/data/profile.ts`. Replace placeholder email/social links before publishing.
