import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioPage } from "@/components/portfolio-page";
import { absoluteUrl, siteConfigFor } from "@/data/seo";
import { getLocale, isLocale, locales, localizeProfile } from "@/data/i18n";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = getLocale(localeParam);
  const config = siteConfigFor(locale);
  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: absoluteUrl("/en"),
        vi: absoluteUrl("/vi"),
      },
    },
    openGraph: {
      type: "website",
      locale: config.locale,
      url: `/${locale}`,
      siteName: config.name,
      title: config.title,
      description: config.description,
      images: [absoluteUrl(`/opengraph-image?locale=${locale}`)],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [absoluteUrl(`/opengraph-image?locale=${locale}`)],
    },
  };
}

export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = getLocale(localeParam);
  const { profile } = await readPortfolioProfile();
  const localizedProfile = localizeProfile(profile, locale);
  return <PortfolioPage profile={localizedProfile} locale={locale} />;
}
