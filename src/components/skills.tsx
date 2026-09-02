import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, type Locale } from "@/data/i18n";

export function Skills({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const copy = getUiCopy(getLocale(locale));

  return (
    <section className="section skills" id="skills">
      <div className="container">
        <div className="section-label"><span>04</span> {copy.sections.skills}</div>
        <div className="skills-heading">
          <h2>{copy.sections.skillsTitle}</h2>
          <p>{copy.sections.skillsDescription}</p>
        </div>
        <div className="skill-groups">
          {profile.skillGroups.map((group, groupIndex) => (
            <article className="skill-group" key={group.title}>
              <div className="skill-group-title"><span>0{groupIndex + 1}</span><h3>{group.title}</h3></div>
              <div className="skill-list">
                {group.skills.map((skill) => <span key={skill}>{skill}</span>)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
