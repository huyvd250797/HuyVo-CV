import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/data/seo";
import { locales, localizedPath } from "@/data/i18n";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { profile } = await readPortfolioProfile();

  const localizedStaticRoutes = locales.flatMap((locale) => [
    { url: absoluteUrl(localizedPath(locale)), lastModified: now, changeFrequency: "monthly" as const, priority: locale === "en" ? 1 : 0.95 },
    { url: absoluteUrl(localizedPath(locale, "/resume")), lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: absoluteUrl(localizedPath(locale, "/contact")), lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
  ]);

  const legacyRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/resume"), lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) => profile.projects.map((project) => ({
    url: absoluteUrl(localizedPath(locale, `/projects/${project.slug}`)),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: project.featured ? 0.8 : 0.65,
  })));

  return [...localizedStaticRoutes, ...legacyRoutes, ...projectRoutes];
}
