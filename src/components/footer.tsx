import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, type Locale } from "@/data/i18n";

export function Footer({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const copy = getUiCopy(getLocale(locale));

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© 2026 {profile.name}. All rights reserved.</span>
        <span>{copy.footer.designed}</span>
        <span>{profile.role}</span>
      </div>
    </footer>
  );
}
