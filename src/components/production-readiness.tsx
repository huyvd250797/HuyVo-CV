import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { appVersion } from "@/data/version";
import { getLocale, getUiCopy, type Locale } from "@/data/i18n";

type ProductionReadinessProps = {
  profileData?: PortfolioProfile;
  locale?: Locale;
};

export function ProductionReadiness({ profileData = fallbackProfile, locale = "en" }: ProductionReadinessProps) {
  const profile = profileData;
  const copy = getUiCopy(getLocale(locale));

  return (
    <section className="section production-readiness" id="production">
      <div className="container">
        <div className="production-heading">
          <div>
            <div className="section-label"><span>08</span> {copy.production.kicker}</div>
            <h2>{appVersion.label} {copy.production.title}</h2>
          </div>
          <p>{profile.name}: {copy.production.description}</p>
        </div>
        <div className="production-grid">
          {copy.production.items.map((item, index) => (
            <article key={item.title} className="production-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
