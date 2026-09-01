import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListPage } from "@/components/blog-page";
import { absoluteUrl } from "@/data/seo";
import { getLocale, getUiCopy, isLocale, locales, localizeProfile } from "@/data/i18n";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = getLocale(localeParam);
  const copy = getUiCopy(locale);
  return {
    title: copy.blog.allPostsTitle,
    description: copy.blog.allPostsDescription,
    alternates: { canonical: `/${locale}/blog`, languages: { en: absoluteUrl("/en/blog"), vi: absoluteUrl("/vi/blog") } },
    openGraph: {
      title: copy.blog.allPostsTitle,
      description: copy.blog.allPostsDescription,
      url: `/${locale}/blog`,
      type: "website",
      images: [absoluteUrl(`/opengraph-image?locale=${locale}`)],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.blog.allPostsTitle,
      description: copy.blog.allPostsDescription,
      images: [absoluteUrl(`/opengraph-image?locale=${locale}`)],
    },
  };
}

export default async function LocalizedBlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = getLocale(localeParam);
  const { profile } = await readPortfolioProfile();
  return <BlogListPage profile={localizeProfile(profile, locale)} locale={locale} />;
}
