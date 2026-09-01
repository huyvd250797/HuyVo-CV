import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPageContent } from "@/components/contact-page";
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
  const title = locale === "vi" ? `Liên hệ | ${sourceProfile.name}` : `Contact | ${sourceProfile.name}`;
  const description = locale === "vi"
    ? `Liên hệ ${sourceProfile.name} về quản lý dự án, tư vấn chức năng và triển khai phần mềm.`
    : `Contact ${sourceProfile.name} for project management, functional consulting and software implementation opportunities.`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/contact`, languages: { en: absoluteUrl("/en/contact"), vi: absoluteUrl("/vi/contact") } },
    openGraph: { title, description, url: `/${locale}/contact` },
  };
}

export default async function LocalizedContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = getLocale(localeParam);
  const { profile } = await readPortfolioProfile();
  return <ContactPageContent profile={localizeProfile(profile, locale)} locale={locale} />;
}
