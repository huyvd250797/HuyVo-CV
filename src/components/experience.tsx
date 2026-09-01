import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, type Locale } from "@/data/i18n";

export function Experience({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const copy = getUiCopy(getLocale(locale));

  return (
    <section className="section experience" id="experience">
      <div className="container">
        <div className="section-label"><span>04</span> {copy.sections.experience}</div>
        <div className="experience-heading">
          <h2>{copy.sections.experienceTitle}</h2>
          <p>{copy.sections.experienceDescription}</p>
        </div>
        <div className="timeline">
          {profile.experience.map((item) => (
            <article className="timeline-item" key={`${item.period}-${item.role}`}>
              <div className="timeline-period"><span className="timeline-dot" />{item.period}</div>
              <div className="timeline-content">
                <p className="timeline-org">{item.organization}</p>
                <h3>{item.role}</h3>
                <p className="timeline-summary">{item.summary}</p>
                <ul>
                  {item.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
                </ul>
                <div className="skill-row compact">
                  {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
