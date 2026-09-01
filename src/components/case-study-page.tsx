import Link from "next/link";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/data/seo";
import { breadcrumbJsonLd, projectJsonLd } from "@/data/structured-data";
import type { PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, localizedPath, translatedCategory, type Locale } from "@/data/i18n";
import { mediaPreviewUrl, mediaViewUrl } from "@/lib/media-url";

type Project = PortfolioProfile["projects"][number];
type CaseStudyOverview = { label: string; value: string; detail?: string };
type CaseStudyTimeline = { phase: string; title: string; text: string };
type CaseStudyPro = Project["caseStudy"] & {
  overview?: CaseStudyOverview[];
  responsibilities?: string[];
  stakeholders?: string[];
  timeline?: CaseStudyTimeline[];
  challenges?: string[];
  impact?: string[];
  competencies?: string[];
};

function nonEmptyList<T>(value: unknown): T[] {
  return Array.isArray(value) ? value.filter(Boolean) as T[] : [];
}

function buildCaseStudyPro(project: Project) {
  const study = project.caseStudy as CaseStudyPro;
  const overview = nonEmptyList<CaseStudyOverview>(study.overview).length ? nonEmptyList<CaseStudyOverview>(study.overview) : [
    { label: "Role", value: project.role, detail: "Primary ownership and professional contribution." },
    { label: "Project type", value: project.category, detail: "How this work should be evaluated." },
    { label: "Timeframe", value: project.year, detail: "The project period or current status." },
  ];
  const responsibilities = nonEmptyList<string>(study.responsibilities).length ? nonEmptyList<string>(study.responsibilities) : project.contributions;
  const stakeholders = nonEmptyList<string>(study.stakeholders).length ? nonEmptyList<string>(study.stakeholders) : ["Business users", "Customer stakeholders", "Product team", "Development team", "Testing team"];
  const timeline = nonEmptyList<CaseStudyTimeline>(study.timeline).length
    ? nonEmptyList<CaseStudyTimeline>(study.timeline)
    : study.process.map((item, index) => ({ phase: String(index + 1).padStart(2, "0"), title: item, text: item }));
  const challenges = nonEmptyList<string>(study.challenges).length ? nonEmptyList<string>(study.challenges) : [study.problem];
  const impact = nonEmptyList<string>(study.impact).length ? nonEmptyList<string>(study.impact) : [study.result];
  const competencies = nonEmptyList<string>(study.competencies).length ? nonEmptyList<string>(study.competencies) : Array.from(new Set([...project.technologies, translatedCategory(project.category, "en")])).slice(0, 8);

  return { overview, responsibilities, stakeholders, timeline, challenges, impact, competencies };
}

export function CaseStudyPageContent({ profile, project, locale }: { profile: PortfolioProfile; project: Project; locale: Locale }) {
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const study = project.caseStudy;
  const pro = buildCaseStudyPro(project);
  const projectAssets = project.media?.assets?.filter((asset) => asset.url?.trim()) ?? [];
  const thumbnailUrl = mediaPreviewUrl(project.media?.thumbnailUrl);
  const hasMedia = Boolean(thumbnailUrl || projectAssets.length);
  const projectsPath = `${localizedPath(activeLocale)}/#projects`;
  const resumePath = localizedPath(activeLocale, "/resume");
  const contactPath = localizedPath(activeLocale, "/contact");
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: absoluteUrl(localizedPath(activeLocale)) },
    { name: copy.nav.projects, url: absoluteUrl(projectsPath) },
    { name: project.title, url: absoluteUrl(localizedPath(activeLocale, `/projects/${project.slug}`)) },
  ]);

  return (
    <main id="top" className="case-study-page case-study-pro-page">
      <JsonLd data={[projectJsonLd(project, profile, activeLocale), breadcrumb]} />
      <div className="case-nav container">
        <Link href={projectsPath} className="case-back" data-track-event="cta_click" data-track-label="Case study back to projects">{copy.caseStudy.back}</Link>
        <span>{profile.shortName}<i>.</i></span>
      </div>

      <header className={thumbnailUrl ? "case-hero has-preview" : "case-hero"}>
        <div className="container case-hero-grid">
          <div>
            <div className="case-eyebrow">
              <span>{translatedCategory(project.category, activeLocale)}</span><span>{project.year}</span><span>{copy.caseStudy.proLabel}</span>
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

      <section className="case-section case-pro-overview">
        <div className="container">
          <p className="section-kicker">00 — {copy.caseStudy.overview}</p>
          <div className="case-pro-heading">
            <h2>{copy.caseStudy.overviewTitle}</h2>
            <p>{copy.caseStudy.overviewDescription}</p>
          </div>
          <div className="case-overview-grid">
            {pro.overview.map((item) => (
              <article key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                {item.detail && <p>{item.detail}</p>}
              </article>
            ))}
          </div>
          <div className="case-stakeholder-row">
            <span>{copy.caseStudy.stakeholders}</span>
            <div>{pro.stakeholders.map((item) => <em key={item}>{item}</em>)}</div>
          </div>
        </div>
      </section>

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

      <section className="case-section case-pro-block">
        <div className="container">
          <p className="section-kicker">03 — {copy.caseStudy.responsibilities}</p>
          <div className="case-pro-heading">
            <h2>{copy.caseStudy.responsibilitiesTitle}</h2>
            <p>{copy.caseStudy.responsibilitiesDescription}</p>
          </div>
          <div className="case-contribution-grid">
            {pro.responsibilities.map((item, index) => (
              <article key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section case-dark">
        <div className="container">
          <p className="section-kicker">04 — {copy.caseStudy.timeline}</p>
          <h2>{copy.caseStudy.timelineTitle}</h2>
          <div className="case-timeline-pro">
            {pro.timeline.map((item, index) => (
              <article key={`${item.phase}-${item.title}-${index}`}>
                <span>{item.phase || String(index + 1).padStart(2, "0")}</span>
                <div><h3>{item.title}</h3><p>{item.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section">
        <div className="container case-two-col">
          <div><p className="section-kicker">05 — {copy.caseStudy.challenges}</p><h2>{copy.caseStudy.challengesTitle}</h2></div>
          <div className="case-bullet-panel">{pro.challenges.map((item) => <p key={item}>{item}</p>)}</div>
        </div>
      </section>

      <section className="case-section case-alt">
        <div className="container case-two-col">
          <div><p className="section-kicker">06 — {copy.caseStudy.solution}</p><h2>{copy.caseStudy.solutionTitle}</h2></div>
          <p className="case-copy">{study.solution}</p>
        </div>
      </section>

      <section className="case-section">
        <div className="container case-two-col">
          <div><p className="section-kicker">07 — {copy.caseStudy.impact}</p><h2>{copy.caseStudy.impactTitle}</h2></div>
          <div className="case-impact-grid">{pro.impact.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>)}</div>
        </div>
      </section>

      <section className="case-section case-alt">
        <div className="container">
          <p className="section-kicker">08 — {copy.caseStudy.competencies}</p>
          <div className="case-pro-heading">
            <h2>{copy.caseStudy.competenciesTitle}</h2>
            <p>{copy.caseStudy.competenciesDescription}</p>
          </div>
          <div className="case-competency-cloud">{pro.competencies.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
      </section>

      <section className="case-section">
        <div className="container">
          <p className="section-kicker">09 — {copy.caseStudy.lessons}</p>
          <div className="case-lessons">
            {study.lessons.map((lesson, index) => <div key={lesson}><span>{String(index + 1).padStart(2, "0")}</span><p>{lesson}</p></div>)}
          </div>
          <div className="case-next case-pro-cta">
            <Link href={resumePath} data-track-event="cta_click" data-track-label="Case study view resume">{copy.caseStudy.viewResume} ↗</Link>
            <Link href={contactPath} data-track-event="cta_click" data-track-label="Case study contact me">{copy.caseStudy.contactMe} ↗</Link>
            <Link href={projectsPath} data-track-event="cta_click" data-track-label="Case study explore other projects">{copy.caseStudy.exploreOther} ↗</Link>
          </div>
        </div>
      </section>
      <Footer profileData={profile} locale={activeLocale} />
    </main>
  );
}
