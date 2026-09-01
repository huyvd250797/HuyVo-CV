import Link from "next/link";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/data/seo";
import { breadcrumbJsonLd, projectJsonLd } from "@/data/structured-data";
import type { PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, localizedPath, translatedCategory, type Locale } from "@/data/i18n";
import { mediaPreviewUrl, mediaViewUrl } from "@/lib/media-url";

type Project = PortfolioProfile["projects"][number];

export function CaseStudyPageContent({ profile, project, locale }: { profile: PortfolioProfile; project: Project; locale: Locale }) {
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const study = project.caseStudy;
  const projectAssets = project.media?.assets?.filter((asset) => asset.url?.trim()) ?? [];
  const thumbnailUrl = mediaPreviewUrl(project.media?.thumbnailUrl);
  const hasMedia = Boolean(thumbnailUrl || projectAssets.length);
  const projectsPath = `${localizedPath(activeLocale)}/#projects`;
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: absoluteUrl(localizedPath(activeLocale)) },
    { name: copy.nav.projects, url: absoluteUrl(projectsPath) },
    { name: project.title, url: absoluteUrl(localizedPath(activeLocale, `/projects/${project.slug}`)) },
  ]);

  return (
    <main id="top" className="case-study-page">
      <JsonLd data={[projectJsonLd(project, profile, activeLocale), breadcrumb]} />
      <div className="case-nav container">
        <Link href={projectsPath} className="case-back" data-track-event="cta_click" data-track-label="Case study back to projects">{copy.caseStudy.back}</Link>
        <span>{profile.shortName}<i>.</i></span>
      </div>

      <header className={thumbnailUrl ? "case-hero has-preview" : "case-hero"}>
        <div className="container case-hero-grid">
          <div>
            <div className="case-eyebrow">
              <span>{translatedCategory(project.category, activeLocale)}</span><span>{project.year}</span><span>{copy.caseStudy.label}</span>
            </div>
            <h1>{project.title}</h1>
            <p className="case-role">{project.role}</p>
            <p className="case-lead">{project.summary}</p>
            <div className="project-tags case-tags">
              {project.technologies.map((technology) => <span key={technology}>{technology}</span>)}
            </div>
          </div>
          {thumbnailUrl && (
            <figure className="case-preview-card">
              <img src={thumbnailUrl} alt={project.media?.thumbnailAlt || `${project.title} preview`} referrerPolicy="no-referrer" />
              <figcaption>{project.media?.thumbnailAlt || copy.caseStudy.projectPreview}</figcaption>
            </figure>
          )}
        </div>
      </header>

      {hasMedia && (
        <section className="case-section case-media-section">
          <div className="container">
            <p className="section-kicker">{copy.caseStudy.mediaKicker}</p>
            <div className="case-media-heading">
              <h2>{copy.caseStudy.mediaTitle}</h2>
              <p>{copy.caseStudy.mediaDescription}</p>
            </div>
            <div className="case-media-grid">
              {projectAssets.map((asset) => (
                <a key={`${asset.title}-${asset.url}`} className="case-media-card" href={mediaViewUrl(asset.url)} target="_blank" rel="noreferrer" data-track-event="cta_click" data-track-label={`Project media: ${project.title} - ${asset.title}`}>
                  <div className="case-media-image">
                    {asset.type === "Image" || asset.type === "Screenshot" || asset.type === "Diagram" ? (
                      <img src={mediaPreviewUrl(asset.url)} alt={asset.alt || asset.title} loading="lazy" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{asset.type}</span>
                    )}
                  </div>
                  <div>
                    <span>{asset.type}</span>
                    <h3>{asset.title}</h3>
                    {asset.caption && <p>{asset.caption}</p>}
                  </div>
                </a>
              ))}
              {projectAssets.length === 0 && thumbnailUrl && (
                <article className="case-media-card static-card">
                  <div className="case-media-image"><img src={thumbnailUrl} alt={project.media?.thumbnailAlt || `${project.title} preview`} referrerPolicy="no-referrer" /></div>
                  <div><span>{copy.caseStudy.preview}</span><h3>{copy.caseStudy.thumbnail}</h3><p>{project.media?.thumbnailAlt || copy.caseStudy.primaryVisual}</p></div>
                </article>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="case-section">
        <div className="container case-two-col">
          <div><p className="section-kicker">01 — {copy.caseStudy.context}</p><h2>{copy.caseStudy.contextTitle}</h2></div>
          <p className="case-copy">{study.context}</p>
        </div>
      </section>

      <section className="case-section case-alt">
        <div className="container case-two-col">
          <div><p className="section-kicker">02 — {copy.caseStudy.problem}</p><h2>{copy.caseStudy.problemTitle}</h2></div>
          <p className="case-copy">{study.problem}</p>
        </div>
      </section>

      <section className="case-section">
        <div className="container">
          <p className="section-kicker">03 — {copy.caseStudy.contribution}</p>
          <div className="case-contribution-grid">
            {project.contributions.map((item, index) => (
              <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section case-dark">
        <div className="container">
          <p className="section-kicker">04 — {copy.caseStudy.process}</p>
          <h2>{copy.caseStudy.processTitle}</h2>
          <div className="case-process-grid">
            {study.process.map((item, index) => (
              <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section">
        <div className="container case-two-col">
          <div><p className="section-kicker">05 — {copy.caseStudy.solution}</p><h2>{copy.caseStudy.solutionTitle}</h2></div>
          <p className="case-copy">{study.solution}</p>
        </div>
      </section>

      <section className="case-section case-alt">
        <div className="container case-two-col">
          <div><p className="section-kicker">06 — {copy.caseStudy.result}</p><h2>{copy.caseStudy.resultTitle}</h2></div>
          <p className="case-copy">{study.result}</p>
        </div>
      </section>

      <section className="case-section">
        <div className="container">
          <p className="section-kicker">07 — {copy.caseStudy.lessons}</p>
          <div className="case-lessons">
            {study.lessons.map((lesson, index) => <div key={lesson}><span>{String(index + 1).padStart(2, "0")}</span><p>{lesson}</p></div>)}
          </div>
          <div className="case-next"><Link href={projectsPath} data-track-event="cta_click" data-track-label="Case study explore other projects">{copy.caseStudy.exploreOther} ↗</Link></div>
        </div>
      </section>
      <Footer profileData={profile} locale={activeLocale} />
    </main>
  );
}
