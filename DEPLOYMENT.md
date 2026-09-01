# Deployment Guide — HuyVo Portfolio V1.2.1

## 1. Deploy source to Vercel

Use the ZIP source or push it to GitHub, then import the project into Vercel.

Do not set Output Directory to `out`. Keep it as the default Next.js output.

## 2. Add environment variables

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

Optional:

```env
SUPABASE_PORTFOLIO_TABLE=portfolio_profiles
SUPABASE_PORTFOLIO_ID=default
PORTFOLIO_REVALIDATE_SECONDS=60
SUPABASE_ANALYTICS_TABLE=portfolio_events
ANALYTICS_MAX_ROWS=5000
```

## 3. Run Supabase SQL

Open Supabase SQL Editor and run:

```text
supabase/schema.sql
```

This creates the CMS table and analytics table. V1.2.1 media data is saved inside `portfolio_profiles.data`, so no separate media table is required.

## 4. Save live CMS data

Open:

```text
/admin
```

Login with `ADMIN_PASSWORD`, edit your profile and click **Save live**.

## 5. Add Google Drive media assets

Open:

```text
/admin → Media
```

Paste Google Drive share links or normal public URLs for:

- Avatar image
- Resume/CV PDF file
- Project thumbnail
- Case-study screenshots, diagrams, documents, videos or links

Supported Drive formats:

```text
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
https://drive.google.com/open?id=FILE_ID
https://drive.google.com/uc?export=view&id=FILE_ID
FILE_ID
```

For images to display publicly, set each Google Drive file to:

```text
Share → General access → Anyone with the link → Viewer
```

Click **Save live** after updating media.

## 6. Check analytics

Visit the public portfolio pages, then open:

```text
/admin → Analytics
```

Click **Refresh analytics**.

## 7. Disable analytics if needed

Set:

```env
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

Then redeploy.
