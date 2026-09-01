"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { profile as fallbackProfile, type PortfolioProfile, type ProjectCategory } from "@/data/profile";
import { getLocale, getUiCopy, localizedPath, translatedCategory, type Locale } from "@/data/i18n";
import { mediaPreviewUrl } from "@/lib/media-url";

type Filter = "All" | ProjectCategory;
const filters: Filter[] = ["All", "Professional", "Product", "Tool"];

export function Projects({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const [active, setActive] = useState<Filter>("All");
  const visible = useMemo(
    () => profile.projects.filter((project) => active === "All" || project.category === active),
    [active, profile.projects],
  );

  const filterLabel = (filter: Filter) => {
    if (filter === "All") return copy.projects.all;
    return translatedCategory(filter, activeLocale);
  };

  return (
    <section className="section projects" id="projects">
      <div className="container">
        <div className="projects-heading">
          <div>
            <div className="section-label"><span>04</span> {copy.sections.selectedWork}</div>
            <h2>{copy.sections.projectsTitle}</h2>
          </div>
          <p>{copy.sections.projectsDescription}</p>
        </div>

        <div className="project-filters" role="group" aria-label={copy.projects.filterLabel}>
          {filters.map((filter) => (
            <button
              type="button"
              className={active === filter ? "project-filter active" : "project-filter"}
              onClick={() => setActive(filter)}
              key={filter}
            >
              {filterLabel(filter)}
            </button>
          ))}
        </div>
        <p className="project-result-count" aria-live="polite">
          {copy.projects.showing} {visible.length} {visible.length === 1 ? copy.projects.project : copy.projects.projects} · {filterLabel(active)}
        </p>

        <div className="project-grid">
          {visible.map((project, index) => {
            const thumbnailUrl = mediaPreviewUrl(project.media?.thumbnailUrl, 1000);
            const assetCount = project.media?.assets?.filter((asset) => asset.url?.trim()).length ?? 0;

            return (
              <article className={project.featured ? "project-card featured" : "project-card"} key={project.title}>
                <div className="project-card-top">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{project.year}</span>
                </div>

                <div className={thumbnailUrl ? "project-thumb has-image" : "project-thumb"} aria-hidden={!thumbnailUrl}>
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={project.media?.thumbnailAlt || `${project.title} project preview`} loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{project.media?.icon || project.title.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="project-type-row">
                  <span className="project-category">{translatedCategory(project.category, activeLocale)}</span>
                  {project.featured && <span className="featured-badge">{copy.projects.featured}</span>}
                  {assetCount > 0 && <span className="media-badge">{assetCount} {assetCount === 1 ? copy.projects.asset : copy.projects.assets}</span>}
                </div>
                <h3>{project.title}</h3>
                <p className="project-role">{project.role}</p>
                <p className="project-summary">{project.summary}</p>
                <div className="project-contribution">
                  <span>{copy.projects.contribution}</span>
                  <ul>
                    {project.contributions.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="project-tags">
                  {project.technologies.map((technology) => <span key={technology}>{technology}</span>)}
                </div>
                <Link className="project-case-link" href={localizedPath(activeLocale, `/projects/${project.slug}`)} data-track-event="cta_click" data-track-label={`View case study: ${project.title}`}>{copy.projects.viewCaseStudy} <span>↗</span></Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
