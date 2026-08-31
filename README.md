# HuyVo Portfolio — V0.7.0 Animation & UX

Professional personal portfolio built with Next.js, TypeScript and CSS, ready for Vercel deployment.

## V0.7.0 highlights
- Existing portfolio foundation, professional CV, project portfolio, case studies, resume PDF support and contact page.
- New scroll-reveal animation system using IntersectionObserver.
- Scroll progress indicator under the fixed header.
- Active section state for the navbar while scrolling.
- Improved button, card, project, contact and profile-card micro-interactions.
- Better project filter UX with live result count.
- Respects `prefers-reduced-motion` for accessibility.
- Central version source at `src/data/version.ts` updated to `V0.7.0`.

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

The contact form uses `mailto:` in V0.7.0, so messages are sent through the visitor's email app instead of a backend API.
