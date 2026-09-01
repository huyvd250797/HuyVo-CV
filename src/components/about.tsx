import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, type Locale } from "@/data/i18n";

export function About({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const copy = getUiCopy(getLocale(locale));

  return (
    <section className="section about" id="about">
      <div className="container">
        <div className="section-label"><span>01</span> {copy.sections.about}</div>
        <div className="about-grid">
          <h2>{copy.sections.aboutTitle}</h2>
          <div className="about-copy">
            {profile.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className="skill-row">
              {profile.specialties.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
