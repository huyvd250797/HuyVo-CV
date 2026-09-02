import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, localizedPath, type Locale } from "@/data/i18n";

export function ProfessionalSnapshot({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const brand = profile.personalBranding ?? fallbackProfile.personalBranding;

  return (
    <section className="section professional-snapshot" id="about">
      <div className="container">
        <div className="section-label"><span>01</span> {copy.sections.about}</div>
        <div className="snapshot-pro-layout">
          <div className="snapshot-pro-heading">
            <p className="section-kicker">{profile.careerSummary.title}</p>
            <h2>{copy.sections.aboutTitle}</h2>
            <div className="snapshot-pro-copy">
              {profile.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>

          <aside className="snapshot-pro-panel" aria-label={copy.sections.brandDescription}>
            <span>{brand.statement}</span>
            <strong>{brand.signature}</strong>
            <div className="snapshot-pro-highlights">
              {profile.careerSummary.highlights.map((item) => (
                <article key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
            <div className="snapshot-pro-tags" aria-label="Professional specialties">
              {profile.specialties.map((item) => <em key={item}>{item}</em>)}
            </div>
            <a href={localizedPath(activeLocale, "/resume")} data-track-event="cta_click" data-track-label="Snapshot Resume">
              {copy.nav.resume} ↗
            </a>
          </aside>
        </div>

        <div className="snapshot-pillar-grid">
          {brand.pillars.slice(0, 3).map((pillar, index) => (
            <article key={pillar.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
