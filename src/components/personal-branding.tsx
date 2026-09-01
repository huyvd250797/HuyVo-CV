import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, localizedPath, type Locale } from "@/data/i18n";

export function PersonalBranding({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const brand = profile.personalBranding ?? fallbackProfile.personalBranding;

  return (
    <section className="section personal-brand" id="brand">
      <div className="container">
        <div className="brand-polish-shell">
          <div className="brand-polish-copy">
            <div className="section-label"><span>03</span> {copy.sections.brand}</div>
            <p className="section-kicker">{brand.statement}</p>
            <h2>{copy.sections.brandTitle}</h2>
            <p className="brand-signature">{brand.signature}</p>
            <div className="brand-keywords" aria-label="Personal branding keywords">
              {brand.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
            </div>
          </div>

          <div className="brand-metrics-panel" aria-label={copy.sections.brandDescription}>
            {brand.metrics.map((metric) => (
              <article key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="brand-pillar-grid">
          {brand.pillars.map((pillar, index) => (
            <article key={pillar.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
          <article className="brand-cta-card">
            <span>{profile.shortName}</span>
            <h3>{profile.role}</h3>
            <p>{profile.headline}</p>
            <a href={localizedPath(activeLocale, "/contact")} data-track-event="contact_click" data-track-label="Brand section contact">
              {copy.hero.contact} ↗
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
