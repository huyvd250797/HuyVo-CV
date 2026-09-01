import { profile } from "@/data/profile";
import { getLocale, type Locale } from "@/data/i18n";

const fallbackSiteUrl = "https://huyvo-portfolio.vercel.app";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;

export const siteUrl = rawSiteUrl.replace(/\/$/, "");

const descriptions: Record<Locale, string> = {
  en: "Professional portfolio and ATS-friendly resume for Huy Vo, a Project Manager and Functional Consultant focused on business analysis, software implementation, data validation and delivery for education technology.",
  vi: "Portfolio và CV chuyên nghiệp của Huy Vo, Project Manager và Functional Consultant tập trung vào phân tích nghiệp vụ, triển khai phần mềm, kiểm tra dữ liệu và bàn giao giải pháp cho lĩnh vực giáo dục.",
};

const titles: Record<Locale, string> = {
  en: `${profile.name} | ${profile.role}`,
  vi: `${profile.name} | Project Manager & Functional Consultant`,
};

export function siteConfigFor(localeInput?: string | null) {
  const locale = getLocale(localeInput);
  return {
    name: `${profile.name} Portfolio`,
    title: titles[locale],
    description: descriptions[locale],
    url: siteUrl,
    locale: locale === "vi" ? "vi_VN" : "en_US",
    keywords: [
      profile.name,
      profile.role,
      "Project Manager",
      "Functional Consultant",
      "Business Analysis",
      "Software Implementation",
      "Education Technology",
      "SQL Server",
      "UAT",
      "Portfolio",
      "Resume",
      "CV",
      "Blog",
      "Professional Notes",
    ],
  } as const;
}

export const siteConfig = siteConfigFor("en");

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
