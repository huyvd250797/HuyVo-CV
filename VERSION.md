# Version

**V1.9.0 – Professional Architecture**

## Purpose

This release restructures the public portfolio for recruiter-first reading. It keeps the existing CMS, Resume, i18n, analytics, blog, contact and case-study foundation, but changes the homepage hierarchy so visitors see professional positioning, selected work and experience much sooner.

## Highlights

- Version updated to `1.9.0`
- `src/data/version.ts` updated to `V1.9.0 – Professional Architecture`
- Replaced the old public homepage sequence with a recruiter-first architecture:
  - Hero
  - Professional Snapshot
  - Selected Work
  - Professional Experience
  - Expertise
  - How I Work
  - Credentials
  - Insights
  - Contact
- Added `ProfessionalSnapshot` to merge the previous About, Career Summary and Personal Branding concepts into one focused section
- Moved Selected Work above Experience so recruiters see project proof earlier
- Reworked `Projects` into recruiter-friendly mini case studies with problem, contribution and impact blocks
- Simplified public navigation to Work, Experience, Expertise, Profile, Insights and Resume
- Removed `ProductionReadiness` from the public homepage while keeping the component available in source for internal/admin reuse
- Removed public version display from Hero and Footer
- Added V1.9.0 CSS architecture overrides for professional layout, selected work, snapshot, sticky/floating nav and responsive recruiter flow
- No new Supabase table is required

## Notes

This is an architecture release, not a full visual redesign. V2.0.0 should build on this structure with deeper typography, spacing, project imagery and case-study polish.
