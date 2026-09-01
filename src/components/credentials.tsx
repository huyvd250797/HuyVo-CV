import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, type Locale } from "@/data/i18n";

export function Credentials({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const copy = getUiCopy(getLocale(locale));
  const hasEducation = profile.education.length > 0;
  const hasCertifications = profile.certifications.length > 0;
  if (!hasEducation && !hasCertifications) return null;

  return (
    <section className="section credentials" id="credentials">
      <div className="container">
        <div className="section-label"><span>05</span> {copy.sections.credentials}</div>
        <div className="credentials-grid">
          {hasEducation && (
            <div>
              <h2>{copy.resume.education}</h2>
              {profile.education.map((item) => (
                <article className="credential-item" key={`${item.period}-${item.institution}`}>
                  <span>{item.period}</span><h3>{item.degree}</h3><p>{item.institution}</p>{item.note && <small>{item.note}</small>}
                </article>
              ))}
            </div>
          )}
          {hasCertifications && (
            <div>
              <h2>{copy.resume.certifications}</h2>
              {profile.certifications.map((item) => (
                <article className="credential-item" key={`${item.year}-${item.name}`}>
                  <span>{item.year}</span><h3>{item.name}</h3><p>{item.issuer}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
