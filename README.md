# HuyVo Portfolio — V0.4.0 Project Case Study

Professional portfolio / interactive CV built with Next.js, TypeScript and modern responsive CSS.

## V0.4.0 highlights
- Full Professional CV landing page
- Filterable project portfolio
- Dedicated case-study route for every project: `/projects/[slug]`
- Case-study structure: Context → Problem → Contribution → Process → Solution → Result → Lessons Learned
- Light / Dark / System theme
- Responsive desktop / tablet / mobile
- Centralized content in `src/data/profile.ts`
- Centralized visible app version in `src/data/version.ts`
- Vercel-ready, no database required

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

## Deploy to Vercel
Import the project/repository into Vercel. Keep the framework preset as Next.js and leave Output Directory at its default value.

## Where to edit
- Portfolio content: `src/data/profile.ts`
- Visible version: `src/data/version.ts`
- Global styles: `src/app/globals.css`
