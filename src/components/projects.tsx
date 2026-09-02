import Link from "next/link";
import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, localizedPath, translatedCategory, type Locale } from "@/data/i18n";
import { mediaPreviewUrl } from "@/lib/media-url";

export function Projects({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const selectedProjects = [
    ...profile.projects.filter((project) => project.featured),
    ...profile.projects.filter((project) => !project.featured),
  ].slice(0, 4);

  if (!selectedProjects.length) return null;

  return (
    <section className="section projects selected-work-pro" id="projects">
      <div className="container">
        <div className="projects-heading">
          <div>
            <div className="section-label"><span>02</span> {copy.sections.selectedWork}</div>
            <h2>{copy.sections.projectsTitle}</h2>
          </div>
          <p>{copy.sections.projectsDescription}</p>
        </div>

        <div className="selected-work-list">
          {selectedProjects.map((project, index) => {
            const thumbnailUrl = mediaPreviewUrl(project.media?.thumbnailUrl, 1200);
            const caseStudy = project.caseStudy;
            const impact = caseStudy?.impact?.[0] || caseStudy?.result || project.summary;

            return (
              <article className={thumbnailUrl ? "work-showcase has-image" : "work-showcase"} key={project.title}>
                <div className="work-showcase-index">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>{project.year}</small>
                </div>

                <div className="work-showcase-copy">
                  <div className="project-type-row">
                    <span className="project-category">{translatedCategory(project.category, activeLocale)}</span>
                    {project.featured && <span className="featured-badge">{copy.projects.featured}</span>}
                  </div>
                  <h3>{project.title}</h3>
                  <p className="project-role">{project.role}</p>
                  <p className="project-summary">{project.summary}</p>

                  <div className="work-proof-grid">
                    <div>
                      <span>{copy.caseStudy.problem}</span>
                      <p>{caseStudy?.problem || project.contributions[0]}</p>
                    </div>
                    <div>
                      <span>{copy.projects.contribution}</span>
                      <p>{project.contributions.slice(0, 2).join(" · ")}</p>
                    </div>
                    <div>
                      <span>{copy.caseStudy.impact}</span>
                      <p>{impact}</p>
                    </div>
                  </div>

                  <div className="project-tags">
                    {project.technologies.slice(0, 5).map((technology) => <span key={technology}>{technology}</span>)}
                  </div>

                  <Link className="project-case-link" href={localizedPath(activeLocale, `/projects/${project.slug}`)} data-track-event="cta_click" data-track-label={`View case study: ${project.title}`}>
                    {copy.projects.viewCaseStudy} <span>↗</span>
                  </Link>
                </div>

                <div className={thumbnailUrl ? "project-thumb work-thumb has-image" : "project-thumb work-thumb"} aria-hidden={!thumbnailUrl}>
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={project.media?.thumbnailAlt || `${project.title} project preview`} loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{project.media?.icon || project.title.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
