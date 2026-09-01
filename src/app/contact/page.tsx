import type { Metadata } from "next";
import { ContactPageContent } from "@/components/contact-page";
import { profile } from "@/data/profile";
import { absoluteUrl } from "@/data/seo";
import { localizeProfile } from "@/data/i18n";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export const metadata: Metadata = {
  title: `Contact | ${profile.name}`,
  description: `Contact ${profile.name} for project management, functional consulting and software implementation opportunities.`,
  alternates: { canonical: "/en/contact", languages: { en: absoluteUrl("/en/contact"), vi: absoluteUrl("/vi/contact") } },
  openGraph: {
    title: `Contact | ${profile.name}`,
    description: `Contact ${profile.name} for project management, functional consulting and software implementation opportunities.`,
    url: "/en/contact",
  },
};

export default async function ContactPage() {
  const { profile: portfolio } = await readPortfolioProfile();
  return <ContactPageContent profile={localizeProfile(portfolio, "en")} locale="en" />;
}
