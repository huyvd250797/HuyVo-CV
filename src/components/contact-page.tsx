import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { PortfolioProfile } from "@/data/profile";
import type { Locale } from "@/data/i18n";

export function ContactPageContent({ profile, locale }: { profile: PortfolioProfile; locale: Locale }) {
  return (
    <main id="top">
      <Header profileData={profile} locale={locale} />
      <div className="contact-page-spacer" />
      <Contact profileData={profile} locale={locale} />
      <Footer profileData={profile} locale={locale} />
    </main>
  );
}
