import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, type Locale } from "@/data/i18n";

export function Approach({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const copy = getUiCopy(getLocale(locale));

  return (
    <section className="section approach" id="approach">
      <div className="container">
        <div className="section-label"><span>06</span> {copy.sections.process}</div>
        <div className="approach-heading">
          <h2>{copy.sections.processTitle}</h2>
          <p>{copy.sections.processDescription}</p>
        </div>
        <div className="approach-grid process-grid">
          {profile.workingProcess.map((item) => (
            <article className="approach-card" key={item.index}>
              <span className="card-index">{item.index}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <span className="corner-arrow">↘</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
