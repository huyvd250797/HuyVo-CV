import { notFound } from "next/navigation";
import { CaseStudyPageContent } from "@/components/case-study-page";
import { absoluteUrl } from "@/data/seo";
import { getLocale, isLocale, locales, localizeProfile } from "@/data/i18n";
import { readPortfolioProfile } from "@/lib/portfolio-cms";
import { mediaPreviewUrl } from "@/lib/media-url";

export const dynamicParams = true;

export async function generateStaticParams() {
  const { profile } = await readPortfolioProfile();
  return locales.flatMap((locale) => profile.projects.map((project) => ({ locale, slug: project.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = getLocale(localeParam);
  const { profile } = await readPortfolioProfile();
  const localizedProfile = localizeProfile(profile, locale);
  const project = localizedProfile.projects.find((item) => item.slug === slug);
  const previewImage = mediaPreviewUrl(project?.media?.thumbnailUrl) || `/opengraph-image?locale=${locale}`;

  return project
    ? {
        title: `${project.title} Case Study`,
        description: project.summary,
        alternates: { canonical: `/${locale}/projects/${project.slug}`, languages: { en: absoluteUrl(`/en/projects/${project.slug}`), vi: absoluteUrl(`/vi/projects/${project.slug}`) } },
        openGraph: {
          title: `${project.title} Case Study | ${localizedProfile.name}`,
          description: project.summary,
          url: `/${locale}/projects/${project.slug}`,
          type: "article",
          images: [absoluteUrl(previewImage)],
        },
        twitter: {
          card: "summary_large_image",
          title: `${project.title} Case Study | ${localizedProfile.name}`,
          description: project.summary,
          images: [absoluteUrl(previewImage)],
        },
      }
    : {};
}

export default async function LocalizedProjectCaseStudy({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = getLocale(localeParam);
  const { profile } = await readPortfolioProfile();
  const localizedProfile = localizeProfile(profile, locale);
  const project = localizedProfile.projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return <CaseStudyPageContent profile={localizedProfile} project={project as NonNullable<typeof project>} locale={locale} />;
}
