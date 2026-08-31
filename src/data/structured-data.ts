import { profile } from "@/data/profile";
import { absoluteUrl, siteConfig } from "@/data/seo";

type Project = (typeof profile.projects)[number];

const sameAs = [profile.social.linkedin, profile.social.github].filter((url) => url && url !== "#");

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  description: profile.description,
  email: `mailto:${profile.email}`,
  url: siteConfig.url,
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
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  author: {
    "@type": "Person",
    name: profile.name,
  },
};

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.slug}`),
    datePublished: project.year === "Current" ? undefined : project.year,
    keywords: project.technologies.join(", "),
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
