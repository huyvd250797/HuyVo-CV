"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ResumePrintButton } from "@/components/resume-print-button";
import type { PortfolioProfile, ResumeSectionKey, ResumeTemplate } from "@/data/profile";
import { appVersion } from "@/data/version";
import { getLocale, getUiCopy, localizedPath, switchLocalePath, type Locale } from "@/data/i18n";
import { mediaViewUrl } from "@/lib/media-url";

type ResumeSections = Record<ResumeSectionKey, boolean>;
type ResumeTarget = "pm-fc" | "ba" | "product" | "executive";

const templateOptions: Array<{ value: ResumeTemplate; label: string; description: string }> = [
  { value: "Modern", label: "Professional", description: "Beautiful A4 CV form for sharing or printing." },
  { value: "ATS", label: "ATS", description: "Clean, recruiter-friendly and easy to parse." },
  { value: "Compact", label: "Compact", description: "Tighter spacing for shorter PDFs." },
  { value: "Executive", label: "Executive", description: "Strong positioning and leadership summary." },
];

const targetOptions: Array<{ value: ResumeTarget; label: string }> = [
  { value: "pm-fc", label: "PM / Functional Consultant" },
  { value: "ba", label: "Business Analyst" },
  { value: "product", label: "Product-oriented PM" },
  { value: "executive", label: "Executive snapshot" },
];

const defaultSections: ResumeSections = {
  summary: true,
  experience: true,
  projects: true,
  skills: true,
  education: true,
  certifications: true,
  branding: true,
};

const sectionOptions: Array<{ key: ResumeSectionKey; label: string }> = [
  { key: "summary", label: "Summary" },
  { key: "experience", label: "Experience" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "education", label: "Education" },
  { key: "certifications", label: "Certifications" },
  { key: "branding", label: "Branding" },
];

function normalizeTemplate(value?: string): ResumeTemplate {
  return value === "Modern" || value === "ATS" || value === "Compact" || value === "Executive" ? value : "Modern";
}

function chooseTargetFromRole(role?: string): ResumeTarget {
  const value = (role || "").toLowerCase();
  if (value.includes("business analyst") || value.includes(" ba")) return "ba";
  if (value.includes("product")) return "product";
  if (value.includes("executive") || value.includes("lead")) return "executive";
  return "pm-fc";
}

function targetSummary(profile: PortfolioProfile, target: ResumeTarget) {
  if (profile.resumeBuilder?.summaryOverride?.trim()) return profile.resumeBuilder.summaryOverride;
  if (target === "ba") return `Business-focused analyst profile with strengths in requirement clarification, workflow mapping, data validation and translating operational rules into software behavior.`;
  if (target === "product") return `Product-oriented delivery profile combining project coordination, functional analysis and practical web product building to turn workflow problems into usable tools.`;
  if (target === "executive") return `Execution-focused professional profile centered on stakeholder alignment, operational clarity, software delivery governance and measurable implementation outcomes.`;
  return profile.careerSummary.text;
}

function ResumeBuilderPanel({
  locale,
  template,
  onTemplateChange,
  target,
  onTargetChange,
  sections,
  onToggleSection,
  projectLimit,
  onProjectLimitChange,
}: {
  locale: Locale;
  template: ResumeTemplate;
  onTemplateChange: (value: ResumeTemplate) => void;
  target: ResumeTarget;
  onTargetChange: (value: ResumeTarget) => void;
  sections: ResumeSections;
  onToggleSection: (section: ResumeSectionKey) => void;
  projectLimit: number;
  onProjectLimitChange: (value: number) => void;
}) {
  return (
    <aside className="resume-builder-panel" aria-label="Resume export controls">
      <div className="resume-export-note">
        <span>{locale === "vi" ? "Xuất CV" : "CV Export"}</span>
        <strong>{locale === "vi" ? "Form CV đẹp, sẵn sàng in PDF" : "Beautiful CV form, PDF-ready"}</strong>
        <p>{locale === "vi" ? "Chọn mẫu, bật/tắt nội dung cần hiển thị rồi bấm Xuất CV / Lưu PDF." : "Choose a form, keep only the sections you need, then export or save as PDF."}</p>
      </div>

      <div>
        <span>{locale === "vi" ? "Mẫu hiển thị" : "CV form"}</span>
        <strong>{locale === "vi" ? "Kiểu CV" : "Template"}</strong>
        <div className="resume-template-options">
          {templateOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={template === option.value ? "active" : ""}
              onClick={() => onTemplateChange(option.value)}
              title={option.description}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <label>
        <span>{locale === "vi" ? "Mục tiêu CV" : "Target CV"}</span>
        <select value={target} onChange={(event) => onTargetChange(event.target.value as ResumeTarget)}>
          {targetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <label>
        <span>{locale === "vi" ? "Số dự án hiển thị" : "Featured projects"}</span>
        <input
          type="number"
          min={1}
          max={8}
          value={projectLimit}
          onChange={(event) => onProjectLimitChange(Number(event.target.value) || 1)}
        />
      </label>

      <div>
        <span>{locale === "vi" ? "Nội dung in ra" : "Sections"}</span>
        <div className="resume-section-toggles">
          {sectionOptions.map((option) => (
            <label key={option.key}>
              <input type="checkbox" checked={sections[option.key]} onChange={() => onToggleSection(option.key)} />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="resume-language-actions">
        <Link href={switchLocalePath(locale === "vi" ? "en" : "vi", typeof window !== "undefined" ? window.location.pathname : `/${locale}/resume`)}>
          {locale === "vi" ? "View English" : "Xem tiếng Việt"}
        </Link>
      </div>
    </aside>
  );
}

export function ResumePageContent({ profile, locale }: { profile: PortfolioProfile; locale: Locale }) {
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const resumeUrl = mediaViewUrl(profile.media?.resumeUrl);
  const builder = profile.resumeBuilder;
  const [template, setTemplate] = useState<ResumeTemplate>(() => normalizeTemplate(builder?.defaultTemplate));
  const [target, setTarget] = useState<ResumeTarget>(() => chooseTargetFromRole(builder?.targetRole || profile.role));
  const [sections, setSections] = useState<ResumeSections>(() => ({ ...defaultSections, ...(builder?.sections || {}) }));
  const [projectLimit, setProjectLimit] = useState(() => Math.max(1, Math.min(8, Number(builder?.projectLimit || 3))));

  const visibleProjects = useMemo(
    () => profile.projects.filter((project) => project.featured).slice(0, projectLimit),
    [profile.projects, projectLimit],
  );
  const headline = builder?.headline?.trim() || profile.headline;
  const summary = targetSummary(profile, target);
  const enabled = (section: ResumeSectionKey) => Boolean(sections[section]);
  const skillColumns = Math.max(1, Math.min(3, Number(builder?.skillColumns || 2)));

  return (
    <main id="top" className="resume-page">
      <div className="resume-toolbar container">
        <div className="resume-toolbar-left">
          <Link href={localizedPath(activeLocale)}>{copy.resume.back}</Link>
          <div className="resume-export-title">
            <span>{activeLocale === "vi" ? "CV EXPORT" : "CV EXPORT"}</span>
            <strong>{activeLocale === "vi" ? "Form CV chuyên nghiệp, tối ưu A4" : "Professional A4 resume export"}</strong>
            <p>{activeLocale === "vi" ? "Dùng bộ chọn bên trái để đổi mẫu nhanh, sau đó xuất PDF từ trình duyệt." : "Use the left controls for quick formatting, then save a polished PDF from the browser."}</p>
          </div>
        </div>
        <div className="resume-toolbar-actions">
          <span>{appVersion.label} · {appVersion.name}</span>
          {resumeUrl && <a className="resume-download-link" href={resumeUrl} target="_blank" rel="noreferrer" data-track-event="resume_download" data-track-label="Resume Download attached CV">{copy.resume.downloadFile}</a>}
          <ResumePrintButton locale={activeLocale} />
        </div>
      </div>

      <div className="resume-builder-shell container">
        <ResumeBuilderPanel
          locale={activeLocale}
          template={template}
          onTemplateChange={setTemplate}
          target={target}
          onTargetChange={setTarget}
          sections={sections}
          onToggleSection={(section) => setSections((current) => ({ ...current, [section]: !current[section] }))}
          projectLimit={projectLimit}
          onProjectLimitChange={(value) => setProjectLimit(Math.max(1, Math.min(8, value)))}
        />

        <article className={`resume-sheet resume-template-${template.toLowerCase()}`} aria-label={`${profile.name} resume`}>
          <header className="resume-header">
            <div>
              <p className="resume-kicker">{copy.resume.title}</p>
              <h1>{profile.name}</h1>
              <h2>{profile.role}</h2>
              <p className="resume-headline">{headline}</p>
            </div>
            <div className="resume-contact">
              <a href={`mailto:${profile.email}`} data-track-event="contact_click" data-track-label="Resume email">{profile.email}</a>
              <span>{profile.location}</span>
              {builder?.showAvailability !== false && <span>{profile.availability}</span>}
              <span>{targetOptions.find((option) => option.value === target)?.label}</span>
            </div>
          </header>

          {enabled("summary") && (
            <section className="resume-section resume-summary">
              <h3>{copy.resume.summary}</h3>
              <div>
                <p>{summary}</p>
                <div className="resume-specialties">
                  {profile.specialties.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            </section>
          )}

          {enabled("branding") && profile.personalBranding?.statement && template !== "ATS" && (
            <section className="resume-section resume-branding-block">
              <h3>{activeLocale === "vi" ? "Định vị" : "Positioning"}</h3>
              <div>
                <p><strong>{profile.personalBranding.statement}</strong></p>
                <p>{profile.personalBranding.signature}</p>
                <div className="resume-brand-metrics">
                  {profile.personalBranding.metrics.slice(0, 3).map((item) => (
                    <span key={`${item.label}-${item.value}`}>{item.label}: <strong>{item.value}</strong></span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {enabled("experience") && (
            <section className="resume-section">
              <h3>{copy.resume.experience}</h3>
              <div className="resume-stack">
                {profile.experience.map((item) => (
                  <article className="resume-entry" key={`${item.role}-${item.period}`}>
                    <div className="resume-entry-head">
                      <div>
                        <h4>{item.role}</h4>
                        <p>{item.organization}</p>
                      </div>
                      <span>{item.period}</span>
                    </div>
                    <p className="resume-entry-summary">{item.summary}</p>
                    <ul>
                      {item.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
                    </ul>
                    {template !== "ATS" && (
                      <div className="resume-tags">
                        {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {enabled("projects") && visibleProjects.length > 0 && (
            <section className="resume-section">
              <h3>{copy.resume.projects}</h3>
              <div className="resume-project-list">
                {visibleProjects.map((project) => (
                  <article className="resume-project" key={project.slug}>
                    <div className="resume-entry-head">
                      <div>
                        <h4>{project.title}</h4>
                        <p>{project.role}</p>
                      </div>
                      <span>{project.year}</span>
                    </div>
                    <p>{project.summary}</p>
                    <ul>
                      {project.contributions.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    {template !== "ATS" && (
                      <div className="resume-tags">
                        {project.technologies.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {enabled("skills") && (
            <section className="resume-section">
              <h3>{copy.resume.skills}</h3>
              <div className="resume-skill-grid" style={{ gridTemplateColumns: `repeat(${skillColumns}, minmax(0, 1fr))` }}>
                {profile.skillGroups.map((group) => (
                  <article key={group.title}>
                    <h4>{group.title}</h4>
                    <p>{group.skills.join(" · ")}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {enabled("education") && profile.education.length > 0 && (
            <section className="resume-section">
              <h3>{copy.resume.education}</h3>
              <div className="resume-stack">
                {profile.education.map((item) => (
                  <article className="resume-entry compact" key={`${item.institution}-${item.degree}`}>
                    <div className="resume-entry-head">
                      <div><h4>{item.degree}</h4><p>{item.institution}</p></div>
                      <span>{item.period}</span>
                    </div>
                    {item.note && <p>{item.note}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {enabled("certifications") && profile.certifications.length > 0 && (
            <section className="resume-section">
              <h3>{copy.resume.certifications}</h3>
              <div className="resume-stack">
                {profile.certifications.map((item) => (
                  <article className="resume-entry compact" key={`${item.name}-${item.year}`}>
                    <div className="resume-entry-head">
                      <div><h4>{item.name}</h4><p>{item.issuer}</p></div>
                      <span>{item.year}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <footer className="resume-foot">
            <span>{builder?.footerNote || `${profile.name} · ${profile.role}`}</span>
            {builder?.showVersion && <span>{appVersion.label}</span>}
          </footer>
        </article>
      </div>
    </main>
  );
}
