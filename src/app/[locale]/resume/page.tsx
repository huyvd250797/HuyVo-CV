import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResumePageContent } from "@/components/resume-page";
import { absoluteUrl } from "@/data/seo";
import { getLocale, isLocale, locales, localizeProfile } from "@/data/i18n";
import { profile as sourceProfile } from "@/data/profile";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = getLocale(localeParam);
  const title = locale === "vi" ? `CV | ${sourceProfile.name}` : `Resume | ${sourceProfile.name}`;
  const description = locale === "vi"
    ? `CV chuyên nghiệp tối ưu xuất PDF của ${sourceProfile.name}, ${sourceProfile.role}.`
    : `Professional A4 CV export for ${sourceProfile.name}, ${sourceProfile.role}.`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/resume`, languages: { en: absoluteUrl("/en/resume"), vi: absoluteUrl("/vi/resume") } },
    openGraph: { title, description, url: `/${locale}/resume` },
  };
}

export default async function LocalizedResumePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = getLocale(localeParam);
  const { profile } = await readPortfolioProfile();
  return <ResumePageContent profile={localizeProfile(profile, locale)} locale={locale} />;
}
