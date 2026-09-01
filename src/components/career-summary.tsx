import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, type Locale } from "@/data/i18n";

export function CareerSummary({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const copy = getUiCopy(getLocale(locale));

  return (
    <section className="section career-summary" id="summary">
      <div className="container">
        <div className="section-label"><span>02</span> {copy.sections.summary}</div>
        <div className="summary-layout">
          <div>
            <p className="section-kicker">{profile.careerSummary.title}</p>
            <h2>{copy.sections.summaryTitle.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h2>
          </div>
          <div className="summary-content">
            <p className="summary-intro">{profile.careerSummary.text}</p>
            <div className="snapshot-grid">
              {profile.careerSummary.highlights.map((item) => (
                <div className="snapshot-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
