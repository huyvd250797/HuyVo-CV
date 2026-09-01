import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { absoluteUrl, siteConfigFor } from "@/data/seo";
import { getLocale, localizedPath, type Locale } from "@/data/i18n";
import { mediaPreviewUrl, mediaViewUrl } from "@/lib/media-url";

type Project = PortfolioProfile["projects"][number];

export function personJsonLdFor(profile: PortfolioProfile = fallbackProfile, localeInput?: string | null) {
  const locale = getLocale(localeInput);
  const config = siteConfigFor(locale);
  const sameAs = [profile.social.linkedin, profile.social.github].filter((url) => url && url !== "#");

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: profile.description,
    email: `mailto:${profile.email}`,
    url: absoluteUrl(localizedPath(locale)),
    image: profile.media?.avatarUrl ? absoluteUrl(mediaPreviewUrl(profile.media.avatarUrl)) : undefined,
    inLanguage: locale,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },
    knowsAbout: [
      ...profile.specialties,
      ...profile.skillGroups.flatMap((group) => group.skills),
    ],
    sameAs,
    mainEntityOfPage: config.url,
  };
}

export function websiteJsonLdFor(profile: PortfolioProfile = fallbackProfile, localeInput?: string | null) {
  const locale = getLocale(localeInput);
  const config = siteConfigFor(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    url: absoluteUrl(localizedPath(locale)),
    description: config.description,
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: profile.name,
    },
  };
}

export const personJsonLd = personJsonLdFor();
export const websiteJsonLd = websiteJsonLdFor();

export function projectJsonLd(project: Project, profile: PortfolioProfile = fallbackProfile, localeInput?: string | null) {
  const locale = getLocale(localeInput);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: absoluteUrl(localizedPath(locale, `/projects/${project.slug}`)),
    datePublished: project.year === "Current" ? undefined : project.year,
    keywords: project.technologies.join(", "),
    image: project.media?.thumbnailUrl ? absoluteUrl(mediaPreviewUrl(project.media.thumbnailUrl)) : undefined,
    inLanguage: locale,
    associatedMedia: project.media?.assets?.filter((asset) => asset.url).map((asset) => ({
      "@type": asset.type === "Video" ? "VideoObject" : "MediaObject",
      name: asset.title,
      contentUrl: absoluteUrl(mediaViewUrl(asset.url)),
      description: asset.caption,
    })),
    author: {
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.role,
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
