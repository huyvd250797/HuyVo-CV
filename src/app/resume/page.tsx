import type { Metadata } from "next";
import { ResumePageContent } from "@/components/resume-page";
import { profile } from "@/data/profile";
import { absoluteUrl } from "@/data/seo";
import { localizeProfile } from "@/data/i18n";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export const metadata: Metadata = {
  title: `Resume | ${profile.name}`,
  description: `ATS-friendly professional resume for ${profile.name}, ${profile.role}.`,
  alternates: { canonical: "/en/resume", languages: { en: absoluteUrl("/en/resume"), vi: absoluteUrl("/vi/resume") } },
  openGraph: {
    title: `Resume | ${profile.name}`,
    description: `ATS-friendly professional resume for ${profile.name}, ${profile.role}.`,
    url: "/en/resume",
  },
};

export default async function ResumePage() {
  const { profile } = await readPortfolioProfile();
  return <ResumePageContent profile={localizeProfile(profile, "en")} locale="en" />;
}
