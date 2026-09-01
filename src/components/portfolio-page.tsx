import { About } from "@/components/about";
import { Approach } from "@/components/approach";
import { CareerSummary } from "@/components/career-summary";
import { Contact } from "@/components/contact";
import { Credentials } from "@/components/credentials";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";
import { ProductionReadiness } from "@/components/production-readiness";
import { BlogPreview } from "@/components/blog-preview";
import type { PortfolioProfile } from "@/data/profile";
import { type Locale } from "@/data/i18n";
import { personJsonLdFor, websiteJsonLdFor } from "@/data/structured-data";

export function PortfolioPage({ profile, locale }: { profile: PortfolioProfile; locale: Locale }) {
  return (
    <main>
      <JsonLd data={[personJsonLdFor(profile, locale), websiteJsonLdFor(profile, locale)]} />
      <Header profileData={profile} locale={locale} />
      <Hero profileData={profile} locale={locale} />
      <About profileData={profile} locale={locale} />
      <CareerSummary profileData={profile} locale={locale} />
      <Experience profileData={profile} locale={locale} />
      <Projects profileData={profile} locale={locale} />
      <Skills profileData={profile} locale={locale} />
      <Credentials profileData={profile} locale={locale} />
      <Approach profileData={profile} locale={locale} />
      <ProductionReadiness profileData={profile} locale={locale} />
      <BlogPreview profileData={profile} locale={locale} />
      <Contact profileData={profile} locale={locale} />
      <Footer profileData={profile} locale={locale} />
    </main>
  );
}
