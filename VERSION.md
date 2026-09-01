# Version History

## V1.1.0 — Analytics & Visitor Insights

Current version: **V1.1.0**

This release adds privacy-conscious visitor analytics and Admin dark mode on top of the production portfolio.

### Included
- Public page-view tracking
- Project case-study view tracking
- CTA click tracking
- Resume Print / Save PDF click tracking
- Contact click tracking
- Supabase-backed analytics table: `portfolio_events`
- New `/admin` Analytics tab
- Summary cards for total events, today, page views, CTA clicks, project views and resume actions
- Top pages, top CTA clicks and recent events
- Admin Light / Dark / System theme switcher
- Version sync across UI, package, README and deployment docs

### Version sync
- `package.json` version updated to `1.1.0`
- `src/data/version.ts` label updated to `V1.1.0`
- Admin storage/session keys updated to V1.1.0
- `supabase/schema.sql` updated with `portfolio_events`

## Notes
Run the updated `supabase/schema.sql` in Supabase before using the Analytics tab.

Analytics can be disabled with:

```env
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```
