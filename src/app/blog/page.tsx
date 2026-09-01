import type { Metadata } from "next";
import { BlogListPage } from "@/components/blog-page";
import { absoluteUrl } from "@/data/seo";
import { localizeProfile } from "@/data/i18n";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export const metadata: Metadata = {
  title: "Blog / Notes",
  description: "Professional notes on software implementation, project delivery, business analysis and practical product work.",
  alternates: { canonical: "/en/blog", languages: { en: absoluteUrl("/en/blog"), vi: absoluteUrl("/vi/blog") } },
  openGraph: {
    title: "Blog / Notes",
    description: "Professional notes on software implementation, project delivery, business analysis and practical product work.",
    url: "/en/blog",
    type: "website",
  },
};

export default async function BlogPage() {
  const { profile } = await readPortfolioProfile();
  return <BlogListPage profile={localizeProfile(profile, "en")} locale="en" />;
}
