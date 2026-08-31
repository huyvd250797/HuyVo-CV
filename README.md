# HuyVo Portfolio — V0.6.0 Contact & Social

Professional personal portfolio built with Next.js, TypeScript and CSS, ready for Vercel deployment.

## V0.6.0 highlights
- Existing portfolio foundation, professional CV, project portfolio, case studies and resume PDF support.
- New dedicated `/contact` page.
- Upgraded contact section on the homepage.
- Contact method cards for Email, LinkedIn and GitHub.
- Client-side quick message form that opens a prepared email draft with `mailto:`.
- No backend/database required for the contact form in this version.
- Header CTA now routes to `/contact`.
- Central version source at `src/data/version.ts` updated to `V0.6.0`.

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
Edit `src/data/profile.ts`.

Important fields to replace before publishing:
- `email`
- `contact.methods`
- `social.linkedin`
- `social.github`
- education/certifications if you want them displayed

The contact form uses `mailto:` in V0.6.0, so messages are sent through the visitor's email app instead of a backend API.
