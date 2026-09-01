"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { profile, type BlogStatus, type MediaAssetType, type ProjectCategory } from "@/data/profile";
import { appVersion } from "@/data/version";
import type { AnalyticsSummary } from "@/lib/portfolio-analytics";
import { mediaPreviewUrl, mediaUrlInfo } from "@/lib/media-url";
import { ThemeSwitcher } from "./theme-switcher";

type AdminTab = "profile" | "media" | "language" | "experience" | "projects" | "skills" | "credentials" | "blog" | "analytics" | "export";
type CmsSource = "supabase" | "source";
type ValidationIssue = { level: "error" | "warning"; message: string };

type HighlightDraft = { label: string; value: string };
type ExperienceDraft = {
  period: string;
  role: string;
  organization: string;
  summary: string;
  responsibilities: string[];
  tags: string[];
};
type CaseStudyOverviewDraft = { label: string; value: string; detail?: string };
type CaseStudyTimelineDraft = { phase: string; title: string; text: string };
type ProjectCaseStudyDraft = {
  context: string;
  problem: string;
  process: string[];
  solution: string;
  result: string;
  lessons: string[];
  overview: CaseStudyOverviewDraft[];
  responsibilities: string[];
  stakeholders: string[];
  timeline: CaseStudyTimelineDraft[];
  challenges: string[];
  impact: string[];
  competencies: string[];
};
type MediaAssetDraft = { title: string; type: MediaAssetType; url: string; caption?: string; alt?: string };
type ProfileMediaDraft = { avatarUrl?: string; avatarAlt?: string; coverImageUrl?: string; resumeUrl?: string };
type ProjectMediaDraft = { icon?: string; thumbnailUrl?: string; thumbnailAlt?: string; assets: MediaAssetDraft[] };
type ProjectDraft = {
  title: string;
  slug: string;
  category: ProjectCategory;
  year: string;
  role: string;
  summary: string;
  contributions: string[];
  technologies: string[];
  featured: boolean;
  media: ProjectMediaDraft;
  caseStudy: ProjectCaseStudyDraft;
};
type BlogPostDraft = {
  title: string;
  slug: string;
  date: string;
  status: BlogStatus;
  featured?: boolean;
  tags: string[];
  summary: string;
  content: string[];
  coverImageUrl?: string;
  coverImageAlt?: string;
};
type SkillGroupDraft = { title: string; skills: string[] };
type EducationDraft = { period: string; institution: string; degree: string; note?: string };
type CertificationDraft = { year: string; name: string; issuer: string; credentialUrl?: string };
type ContactMethodDraft = { label: string; value: string; href: string; description: string };
type BrandMetricDraft = { label: string; value: string; detail: string };
type BrandPillarDraft = { title: string; text: string };
type PersonalBrandingDraft = { statement: string; signature: string; metrics: BrandMetricDraft[]; pillars: BrandPillarDraft[]; keywords: string[] };

type AdminProfileDraft = {
  name: string;
  shortName: string;
  role: string;
  headline: string;
  description: string;
  location: string;
  email: string;
  availability: string;
  personalBranding: PersonalBrandingDraft;
  media: ProfileMediaDraft;
  specialties: string[];
  about: string[];
  careerSummary: {
    title: string;
    text: string;
    highlights: HighlightDraft[];
  };
  experience: ExperienceDraft[];
  projects: ProjectDraft[];
  skillGroups: SkillGroupDraft[];
  education: EducationDraft[];
  certifications: CertificationDraft[];
  workingProcess: Array<{ index: string; title: string; text: string }>;
  blog: BlogPostDraft[];
  contact: {
    title: string;
    subtitle: string;
    description: string;
    responseNote: string;
    preferredTopics: string[];
    methods: ContactMethodDraft[];
  };
  social: { linkedin: string; github: string };
  translations?: Record<string, unknown>;
};

const storageKey = "huyvo-portfolio-admin-draft-v170";
const sessionKey = "huyvo-portfolio-admin-unlocked-v170";
const fallbackPassword = "huyvo-admin";

type ContentLocale = "en" | "vi";
type TranslationPath = Array<string | number>;
type MutableRecord = Record<string, any>;

const localizedEditorTabs: AdminTab[] = ["profile", "media", "experience", "projects", "skills", "credentials", "blog"];

function isRecord(value: unknown): value is MutableRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNestedValue(source: unknown, path: TranslationPath): unknown {
  return path.reduce<unknown>((current, key) => {
    if (current === undefined || current === null) return undefined;
    if (typeof key === "number" && Array.isArray(current)) return current[key];
    if (typeof key === "string" && isRecord(current)) return current[key];
    return undefined;
  }, source);
}

function setNestedValue(source: unknown, path: TranslationPath, value: unknown): unknown {
  if (path.length === 0) return value;

  const [key, ...rest] = path;
  const container: MutableRecord | unknown[] = Array.isArray(source)
    ? [...source]
    : isRecord(source)
      ? { ...source }
      : typeof key === "number"
        ? []
        : {};

  const currentValue = Array.isArray(container) && typeof key === "number"
    ? container[key]
    : !Array.isArray(container) && typeof key === "string"
      ? container[key]
      : undefined;

  const nextValue = setNestedValue(currentValue, rest, value);

  if (Array.isArray(container) && typeof key === "number") {
    container[key] = nextValue;
    return container;
  }

  if (!Array.isArray(container) && typeof key === "string") {
    container[key] = nextValue;
  }

  return container;
}

function textFromTranslation(source: unknown, path: TranslationPath) {
  const value = readNestedValue(source, path);
  return typeof value === "string" ? value : "";
}

function listFromTranslation(source: unknown, path: TranslationPath) {
  const value = readNestedValue(source, path);
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function experienceTranslationKey(item: ExperienceDraft) {
  return `${item.organization}|${item.role}`;
}

function skillGroupTranslationKey(item: SkillGroupDraft) {
  return item.title;
}

function educationTranslationKey(item: EducationDraft) {
  return item.degree || item.institution || item.period;
}

function certificationTranslationKey(item: CertificationDraft) {
  return item.name || item.issuer || item.year;
}

function contactMethodTranslationKey(item: ContactMethodDraft) {
  return item.label;
}

function blogTranslationKey(item: BlogPostDraft) {
  return item.slug;
}


const tabs: Array<{ id: AdminTab; label: string; description: string }> = [
  { id: "profile", label: "Profile", description: "Core identity, headline, about and contact basics." },
  { id: "media", label: "Media", description: "Avatar, resume file, project thumbnails and case-study assets." },
  { id: "language", label: "Language", description: "Vietnamese/English localized content and route support." },
  { id: "experience", label: "Experience", description: "Career timeline and responsibilities." },
  { id: "projects", label: "Projects", description: "Portfolio cards and case study content." },
  { id: "skills", label: "Skills", description: "Skill groups used across portfolio and resume." },
  { id: "credentials", label: "Credentials", description: "Education, certifications and contact channels." },
  { id: "blog", label: "Blog / Notes", description: "Publish professional notes with EN/VI content." },
  { id: "analytics", label: "Analytics", description: "Visitor insights, page views and CTA clicks." },
  { id: "export", label: "Export", description: "Backup profile.ts and JSON when you still want a code copy." },
];

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(value: readonly string[]) {
  return value.join("\n");
}

function cloneItem<T>(item: T): T {
  return JSON.parse(JSON.stringify(item)) as T;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function stringList(value: unknown, fallback: readonly string[] = []) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [...fallback];
}

function overviewList(value: unknown, fallback: readonly CaseStudyOverviewDraft[] = []) {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }));
  return value
    .filter(isRecord)
    .map((item) => ({
      label: stringValue(item.label, "Metric"),
      value: stringValue(item.value, "Value"),
      detail: stringValue(item.detail, ""),
    }));
}

function timelineList(value: unknown, fallback: readonly CaseStudyTimelineDraft[] = []) {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }));
  return value
    .filter(isRecord)
    .map((item) => ({
      phase: stringValue(item.phase, "Phase"),
      title: stringValue(item.title, "Timeline step"),
      text: stringValue(item.text, "Describe what happened in this step."),
    }));
}

function defaultCaseStudyOverview(project?: Partial<ProjectDraft>): CaseStudyOverviewDraft[] {
  return [
    { label: "Role", value: project?.role || "Project role", detail: "Main ownership and contribution in the project." },
    { label: "Project type", value: project?.category || "Portfolio work", detail: "Context for how this work should be evaluated." },
    { label: "Timeframe", value: project?.year || "Timeline", detail: "Use the year/period field to keep the case study grounded." },
  ];
}

function defaultCaseStudyTimeline(process: readonly string[] = []): CaseStudyTimelineDraft[] {
  const source = process.length ? process : ["Understand the context", "Analyze the problem", "Design the solution", "Validate the result"];
  return source.map((item, index) => ({
    phase: `0${index + 1}`.slice(-2),
    title: item.split(".")[0] || `Step ${index + 1}`,
    text: item,
  }));
}

function normalizeCaseStudyDraft(input: unknown, project?: Partial<ProjectDraft>): ProjectCaseStudyDraft {
  const raw = isRecord(input) ? input : {};
  const process = stringList(raw.process, ["Understand context", "Analyze requirements", "Design solution", "Validate outcome"]);
  const lessons = stringList(raw.lessons, ["What you learned", "What you would improve next"]);
  const problem = stringValue(raw.problem, "What needed to be solved.");
  const result = stringValue(raw.result, "What improved after the project.");

  return {
    context: stringValue(raw.context, "Where the work started."),
    problem,
    process,
    solution: stringValue(raw.solution, "How the solution took shape."),
    result,
    lessons,
    overview: overviewList(raw.overview, defaultCaseStudyOverview(project)),
    responsibilities: stringList(raw.responsibilities, project?.contributions || ["Clarify requirements", "Coordinate delivery", "Validate outcome"]),
    stakeholders: stringList(raw.stakeholders, ["Business users", "Customer stakeholders", "Product team", "Development team", "Testing team"]),
    timeline: timelineList(raw.timeline, defaultCaseStudyTimeline(process)),
    challenges: stringList(raw.challenges, [problem]),
    impact: stringList(raw.impact, [result]),
    competencies: stringList(raw.competencies, project?.technologies || ["Project Management", "Functional Consulting", "Business Analysis"]),
  };
}

function emptyOverviewItem(): CaseStudyOverviewDraft {
  return { label: "Metric", value: "Value", detail: "Why this matters for the case study." };
}

function emptyTimelineStep(index: number): CaseStudyTimelineDraft {
  return { phase: `0${index}`.slice(-2), title: "Timeline step", text: "Describe the delivery step, decision or milestone." };
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

function makeUniqueSlug(baseSlug: string, existingSlugs: string[]) {
  const safeBase = slugify(baseSlug || "item");
  let candidate = safeBase;
  let suffix = 2;

  while (existingSlugs.includes(candidate)) {
    candidate = `${safeBase}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function validateDraft(draft: AdminProfileDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!draft.name.trim()) issues.push({ level: "error", message: "Profile name is required." });
  if (!draft.role.trim()) issues.push({ level: "error", message: "Profile role is required." });
  if (!emailPattern.test(draft.email.trim())) issues.push({ level: "warning", message: "Email looks invalid or still needs checking." });
  if (draft.email.trim() === "hello@example.com") issues.push({ level: "warning", message: "Replace placeholder email before publishing." });
  if (!draft.headline.trim()) issues.push({ level: "warning", message: "Hero headline is empty." });
  if (!draft.about.length) issues.push({ level: "warning", message: "About paragraphs are empty." });
  if (!draft.personalBranding.statement.trim()) issues.push({ level: "warning", message: "Personal brand statement is empty." });
  if (!draft.personalBranding.pillars.length) issues.push({ level: "warning", message: "Personal brand pillars are empty." });
  if (!draft.projects.length) issues.push({ level: "error", message: "At least one project is required." });

  const projectSlugs = draft.projects.map((project) => project.slug.trim()).filter(Boolean);
  const duplicateProjectSlugs = projectSlugs.filter((slug, index) => projectSlugs.indexOf(slug) !== index);
  if (duplicateProjectSlugs.length) issues.push({ level: "error", message: `Duplicate project slug: ${Array.from(new Set(duplicateProjectSlugs)).join(", ")}.` });
  draft.projects.forEach((project, index) => {
    if (!project.title.trim()) issues.push({ level: "error", message: `Project #${index + 1} title is empty.` });
    if (!project.slug.trim()) issues.push({ level: "error", message: `Project #${index + 1} slug is empty.` });
    if (!project.summary.trim()) issues.push({ level: "warning", message: `Project #${index + 1} summary is empty.` });
    if (!project.caseStudy.responsibilities.length) issues.push({ level: "warning", message: `Project #${index + 1} has no case-study responsibilities.` });
    if (!project.caseStudy.timeline.length) issues.push({ level: "warning", message: `Project #${index + 1} has no delivery timeline.` });
    if (!project.caseStudy.impact.length) issues.push({ level: "warning", message: `Project #${index + 1} has no impact/outcome notes.` });
  });

  const blogSlugs = draft.blog.map((post) => post.slug.trim()).filter(Boolean);
  const duplicateBlogSlugs = blogSlugs.filter((slug, index) => blogSlugs.indexOf(slug) !== index);
  if (duplicateBlogSlugs.length) issues.push({ level: "error", message: `Duplicate blog slug: ${Array.from(new Set(duplicateBlogSlugs)).join(", ")}.` });
  draft.blog.forEach((post, index) => {
    if (!post.title.trim()) issues.push({ level: "warning", message: `Blog note #${index + 1} title is empty.` });
    if (post.status === "Published" && !post.content.length) issues.push({ level: "warning", message: `Published blog note #${index + 1} has no content paragraphs.` });
  });

  return issues;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "new-project";
}

function createDraftFromProfile(): AdminProfileDraft {
  return {
    name: profile.name,
    shortName: profile.shortName,
    role: profile.role,
    headline: profile.headline,
    description: profile.description,
    location: profile.location,
    email: profile.email,
    availability: profile.availability,
    personalBranding: {
      ...profile.personalBranding,
      metrics: profile.personalBranding.metrics.map((item) => ({ ...item })),
      pillars: profile.personalBranding.pillars.map((item) => ({ ...item })),
      keywords: [...profile.personalBranding.keywords],
    },
    media: { ...profile.media },
    specialties: [...profile.specialties],
    about: [...profile.about],
    careerSummary: {
      title: profile.careerSummary.title,
      text: profile.careerSummary.text,
      highlights: profile.careerSummary.highlights.map((item) => ({ ...item })),
    },
    experience: profile.experience.map((item) => ({
      ...item,
      responsibilities: [...item.responsibilities],
      tags: [...item.tags],
    })),
    projects: profile.projects.map((project) => {
      const projectDraft = {
        ...project,
        media: {
          ...project.media,
          assets: project.media.assets.map((asset) => ({ ...asset })),
        },
        contributions: [...project.contributions],
        technologies: [...project.technologies],
      } as unknown as ProjectDraft;

      return {
        ...projectDraft,
        caseStudy: normalizeCaseStudyDraft(project.caseStudy, projectDraft),
      };
    }),
    skillGroups: profile.skillGroups.map((group) => ({ title: group.title, skills: [...group.skills] })),
    education: profile.education.map((item) => ({ ...item })),
    certifications: profile.certifications.map((item) => ({ ...item })),
    workingProcess: profile.workingProcess.map((item) => ({ ...item })),
    blog: profile.blog.map((post) => ({
      ...post,
      tags: [...post.tags],
      content: [...post.content],
    })),
    contact: {
      title: profile.contact.title,
      subtitle: profile.contact.subtitle,
      description: profile.contact.description,
      responseNote: profile.contact.responseNote,
      preferredTopics: [...profile.contact.preferredTopics],
      methods: profile.contact.methods.map((item) => ({ ...item })),
    },
    social: { ...profile.social },
    translations: JSON.parse(JSON.stringify((profile as unknown as { translations?: Record<string, unknown> }).translations || {})),
  };
}


function normalizeAdminDraft(input: Partial<AdminProfileDraft>): AdminProfileDraft {
  const base = createDraftFromProfile();
  const inputRecord = isRecord(input) ? input as MutableRecord : {};
  const rawPersonalBranding = isRecord(inputRecord.personalBranding) ? inputRecord.personalBranding as Partial<PersonalBrandingDraft> : {};
  const rawCareerSummary = isRecord(inputRecord.careerSummary) ? inputRecord.careerSummary as Partial<AdminProfileDraft["careerSummary"]> : {};
  const rawContact = isRecord(inputRecord.contact) ? inputRecord.contact as Partial<AdminProfileDraft["contact"]> : {};

  return {
    ...base,
    ...input,
    media: { ...base.media, ...(isRecord(inputRecord.media) ? inputRecord.media : {}) },
    personalBranding: {
      ...base.personalBranding,
      ...rawPersonalBranding,
      metrics: Array.isArray(rawPersonalBranding.metrics) ? rawPersonalBranding.metrics as BrandMetricDraft[] : base.personalBranding.metrics,
      pillars: Array.isArray(rawPersonalBranding.pillars) ? rawPersonalBranding.pillars as BrandPillarDraft[] : base.personalBranding.pillars,
      keywords: Array.isArray(rawPersonalBranding.keywords) ? rawPersonalBranding.keywords as string[] : base.personalBranding.keywords,
    },
    careerSummary: {
      ...base.careerSummary,
      ...rawCareerSummary,
      highlights: Array.isArray(rawCareerSummary.highlights) ? rawCareerSummary.highlights as HighlightDraft[] : base.careerSummary.highlights,
    },
    projects: Array.isArray(inputRecord.projects)
      ? (inputRecord.projects as unknown[]).map((item, index) => {
          const baseProject = base.projects[index] ?? emptyProject();
          const rawProject = isRecord(item) ? item : {};
          const rawMedia = isRecord(rawProject.media) ? rawProject.media : {};
          const mergedProject = {
            ...baseProject,
            ...rawProject,
            contributions: stringList(rawProject.contributions, baseProject.contributions),
            technologies: stringList(rawProject.technologies, baseProject.technologies),
            media: {
              ...baseProject.media,
              ...rawMedia,
              assets: Array.isArray(rawMedia.assets) ? rawMedia.assets as MediaAssetDraft[] : baseProject.media.assets,
            },
          } as ProjectDraft;
          return { ...mergedProject, caseStudy: normalizeCaseStudyDraft(rawProject.caseStudy, mergedProject) };
        })
      : base.projects,
    blog: Array.isArray(inputRecord.blog) ? inputRecord.blog as BlogPostDraft[] : base.blog,
    skillGroups: Array.isArray(inputRecord.skillGroups) ? inputRecord.skillGroups as SkillGroupDraft[] : base.skillGroups,
    education: Array.isArray(inputRecord.education) ? inputRecord.education as EducationDraft[] : base.education,
    certifications: Array.isArray(inputRecord.certifications) ? inputRecord.certifications as CertificationDraft[] : base.certifications,
    workingProcess: Array.isArray(inputRecord.workingProcess) ? inputRecord.workingProcess as AdminProfileDraft["workingProcess"] : base.workingProcess,
    contact: {
      ...base.contact,
      ...rawContact,
      preferredTopics: stringList(rawContact.preferredTopics, base.contact.preferredTopics),
      methods: Array.isArray(rawContact.methods) ? rawContact.methods as ContactMethodDraft[] : base.contact.methods,
    },
    social: { ...base.social, ...(isRecord(inputRecord.social) ? inputRecord.social : {}) },
  };
}

function emptyExperience(): ExperienceDraft {
  return {
    period: "2026 — Present",
    role: "Role title",
    organization: "Organization / Domain",
    summary: "Short summary of your role and scope.",
    responsibilities: ["Describe one responsibility", "Describe another responsibility"],
    tags: ["Project Management", "UAT"],
  };
}

function emptyProject(): ProjectDraft {
  return {
    title: "New Project",
    slug: "new-project",
    category: "Product",
    year: "2026",
    role: "Product Owner / Builder",
    summary: "Short project summary.",
    contributions: ["Define the problem", "Design the workflow", "Coordinate delivery"],
    technologies: ["Next.js", "TypeScript"],
    featured: false,
    media: {
      icon: "NP",
      thumbnailUrl: "",
      thumbnailAlt: "New project preview",
      assets: [],
    },
    caseStudy: {
      context: "Where the work started.",
      problem: "What needed to be solved.",
      process: ["Understand context", "Analyze requirements", "Design solution", "Validate outcome"],
      solution: "How the solution took shape.",
      result: "What improved after the project.",
      lessons: ["What you learned", "What you would improve next"],
      overview: defaultCaseStudyOverview({ role: "Product Owner / Builder", category: "Product", year: "2026" }),
      responsibilities: ["Clarify requirements", "Design the delivery approach", "Validate the outcome"],
      stakeholders: ["Business users", "Product team", "Development team", "Testing team"],
      timeline: defaultCaseStudyTimeline(["Understand context", "Analyze requirements", "Design solution", "Validate outcome"]),
      challenges: ["Describe the main delivery or business challenge."],
      impact: ["Describe the result, improvement or professional capability demonstrated."],
      competencies: ["Project Management", "Functional Consulting", "Business Analysis"],
    },
  };
}

function emptyBlogPost(): BlogPostDraft {
  return {
    title: "New professional note",
    slug: "new-professional-note",
    date: new Date().toISOString().slice(0, 10),
    status: "Draft",
    featured: false,
    tags: ["Project Management", "Notes"],
    summary: "Short summary of the note.",
    content: ["Write the first paragraph.", "Add another paragraph with practical context."],
    coverImageUrl: "",
    coverImageAlt: "Professional note cover image",
  };
}

function emptySkillGroup(): SkillGroupDraft {
  return { title: "New Skill Group", skills: ["Skill one", "Skill two"] };
}

function emptyWorkingProcessStep(index: number) {
  return { index: String(index), title: "New step", text: "Describe this step in your working process." };
}

function buildProfileSource(draft: AdminProfileDraft) {
  let body = JSON.stringify(draft, null, 2);
  if (draft.education.length === 0) {
    body = body.replace(
      '"education": []',
      '"education": [] as Array<{\n    period: string;\n    institution: string;\n    degree: string;\n    note?: string;\n  }>',
    );
  }
  if (draft.certifications.length === 0) {
    body = body.replace(
      '"certifications": []',
      '"certifications": [] as Array<{\n    year: string;\n    name: string;\n    issuer: string;\n    credentialUrl?: string;\n  }>',
    );
  }
  return `export type ProjectCategory = "Professional" | "Product" | "Tool";\nexport type MediaAssetType = "Image" | "Screenshot" | "Diagram" | "Document" | "Video" | "Link";\nexport type BlogStatus = "Draft" | "Published";\nexport type BrandMetric = { label: string; value: string; detail: string };\nexport type BrandPillar = { title: string; text: string };\nexport type PersonalBranding = { statement: string; signature: string; metrics: BrandMetric[]; pillars: BrandPillar[]; keywords: string[] };\nexport type CaseStudyOverview = { label: string; value: string; detail?: string };\nexport type CaseStudyTimeline = { phase: string; title: string; text: string };\nexport type ProjectCaseStudy = { context: string; problem: string; process: string[]; solution: string; result: string; lessons: string[]; overview?: CaseStudyOverview[]; responsibilities?: string[]; stakeholders?: string[]; timeline?: CaseStudyTimeline[]; challenges?: string[]; impact?: string[]; competencies?: string[] };\n\nexport type MediaAsset = {\n  title: string;\n  type: MediaAssetType;\n  url: string;\n  caption?: string;\n  alt?: string;\n};\n\nexport type ProfileMedia = {\n  avatarUrl?: string;\n  avatarAlt?: string;\n  coverImageUrl?: string;\n  resumeUrl?: string;\n};\n\nexport type ProjectMedia = {\n  icon?: string;\n  thumbnailUrl?: string;\n  thumbnailAlt?: string;\n  assets: MediaAsset[];\n};\n\nexport type BlogPost = {\n  title: string;\n  slug: string;\n  date: string;\n  status: BlogStatus;\n  featured?: boolean;\n  tags: string[];\n  summary: string;\n  content: string[];\n  coverImageUrl?: string;\n  coverImageAlt?: string;\n};\n\nexport const profile = ${body} as const;\n\nexport type PortfolioProfile = typeof profile;\n`;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onKeyDown={(event) => event.stopPropagation()}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="admin-field admin-field-wide">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        wrap="soft"
        onKeyDown={(event) => event.stopPropagation()}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <small>{hint}</small>}
    </label>
  );
}

function LineListField({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  rows?: number;
}) {
  const [text, setText] = useState(joinLines(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(joinLines(value));
  }, [focused, value]);

  return (
    <label className="admin-field admin-field-wide">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={text}
        onFocus={() => setFocused(true)}
        onKeyDown={(event) => event.stopPropagation()}
        spellCheck={false}
        wrap="soft"
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          onChange(splitLines(next));
        }}
        onBlur={() => {
          setFocused(false);
          const cleaned = joinLines(splitLines(text));
          setText(cleaned);
          onChange(splitLines(cleaned));
        }}
      />
      <small>Mỗi dòng là một mục. Enter xuống hàng bình thường. Dòng trống chỉ được dọn khi rời ô nhập để không làm giật nội dung khi đang gõ.</small>
    </label>
  );
}

const mediaAssetTypes: MediaAssetType[] = ["Image", "Screenshot", "Diagram", "Document", "Video", "Link"];

function MediaTypeField({ value, onChange }: { value: MediaAssetType; onChange: (value: MediaAssetType) => void }) {
  return (
    <label className="admin-field">
      <span>Asset type</span>
      <select value={value} onChange={(event) => onChange(event.target.value as MediaAssetType)}>
        {mediaAssetTypes.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>
    </label>
  );
}

function BlogStatusField({ value, onChange }: { value: BlogStatus; onChange: (value: BlogStatus) => void }) {
  return (
    <label className="admin-field">
      <span>Status</span>
      <select value={value} onChange={(event) => onChange(event.target.value as BlogStatus)}>
        <option value="Draft">Draft</option>
        <option value="Published">Published</option>
      </select>
    </label>
  );
}

function GoogleDriveHelp({ url }: { url?: string }) {
  const info = mediaUrlInfo(url);
  if (info.provider !== "google-drive") return null;

  return (
    <small className="admin-drive-note">
      Google Drive detected · File ID: <code>{info.fileId}</code> · preview/render will use a direct thumbnail URL.
    </small>
  );
}

function AdminImagePreview({
  url,
  alt,
  fallback,
  note,
  small = false,
}: {
  url?: string;
  alt: string;
  fallback: string;
  note: string;
  small?: boolean;
}) {
  const info = mediaUrlInfo(url, small ? 900 : 1400);
  const previewUrl = mediaPreviewUrl(url, small ? 900 : 1400);

  return (
    <div className={small ? "admin-media-preview small" : "admin-media-preview"}>
      {previewUrl ? (
        <img src={previewUrl} alt={alt} loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <span>{fallback}</span>
      )}
      <p>
        {note}
        {info.provider === "google-drive" && (
          <>
            <br />
            <strong>Google Drive:</strong> auto-converted for image preview. Make sure the file is shared as <code>Anyone with the link → Viewer</code>.
          </>
        )}
      </p>
    </div>
  );
}

function emptyMediaAsset(): MediaAssetDraft {
  return { title: "New asset", type: "Screenshot", url: "", caption: "", alt: "" };
}

function AdminSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ItemActions({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  disableMoveUp,
  disableMoveDown,
  removeLabel = "Delete",
}: {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
  removeLabel?: string;
}) {
  return (
    <div className="admin-item-actions" aria-label="Item actions">
      {onMoveUp && <button type="button" onClick={onMoveUp} disabled={disableMoveUp}>↑ Move</button>}
      {onMoveDown && <button type="button" onClick={onMoveDown} disabled={disableMoveDown}>↓ Move</button>}
      {onDuplicate && <button type="button" onClick={onDuplicate}>Duplicate</button>}
      {onRemove && <button type="button" className="danger" onClick={onRemove}>{removeLabel}</button>}
    </div>
  );
}

function ValidationPanel({ issues }: { issues: ValidationIssue[] }) {
  const errorCount = issues.filter((issue) => issue.level === "error").length;
  const warningCount = issues.length - errorCount;

  return (
    <div className={issues.length ? "admin-validation-panel has-issues" : "admin-validation-panel"}>
      <div>
        <span>Content health</span>
        <strong>{issues.length ? `${errorCount} error · ${warningCount} warning` : "Ready to publish"}</strong>
        <p>{issues.length ? "Fix red errors before publishing. Warnings are suggestions for a cleaner CV." : "No required data issue detected in the current draft."}</p>
      </div>
      {issues.length > 0 && (
        <ul>
          {issues.slice(0, 8).map((issue, index) => (
            <li key={`${issue.message}-${index}`} className={issue.level}>{issue.message}</li>
          ))}
          {issues.length > 8 && <li>+ {issues.length - 8} more issue(s)</li>}
        </ul>
      )}
    </div>
  );
}

function AdminStatsPanel({ draft, isDirty }: { draft: AdminProfileDraft; isDirty: boolean }) {
  const publishedBlogCount = draft.blog.filter((post) => post.status === "Published").length;
  const mediaCount = Number(Boolean(draft.media.avatarUrl)) + draft.projects.reduce((count, project) => count + Number(Boolean(project.media.thumbnailUrl)) + project.media.assets.filter((asset) => Boolean(asset.url)).length, 0);

  return (
    <div className="admin-quick-stats">
      <article><span>Draft status</span><strong>{isDirty ? "Unsaved changes" : "Saved state"}</strong><small>{isDirty ? "Save draft or Save live before leaving." : "No local change since last save/load."}</small></article>
      <article><span>Projects</span><strong>{draft.projects.length}</strong><small>{draft.projects.filter((project) => project.featured).length} featured</small></article>
      <article><span>Blog notes</span><strong>{draft.blog.length}</strong><small>{publishedBlogCount} published</small></article>
      <article><span>Media assets</span><strong>{mediaCount}</strong><small>Avatar, thumbnails and galleries</small></article>
    </div>
  );
}

function TranslationsJsonField({
  value,
  onChange,
  onStatus,
}: {
  value?: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onStatus: (value: string) => void;
}) {
  const [text, setText] = useState(JSON.stringify(value || {}, null, 2));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(JSON.stringify(value || {}, null, 2));
  }, [focused, value]);

  function applyJson() {
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      onChange(parsed);
      onStatus("Language translations updated. Click Save live to publish multilingual content.");
    } catch (error) {
      onStatus(error instanceof Error ? `Invalid translations JSON: ${error.message}` : "Invalid translations JSON.");
    }
  }

  return (
    <div className="admin-stack">
      <label className="admin-field admin-field-wide">
        <span>Translations JSON</span>
        <textarea
          rows={18}
          value={text}
          onFocus={() => setFocused(true)}
          onKeyDown={(event) => event.stopPropagation()}
          onChange={(event) => setText(event.target.value)}
          onBlur={() => setFocused(false)}
          spellCheck={false}
        />
        <small>Nhập nội dung đa ngôn ngữ theo JSON. Có thể xuống hàng bình thường trong textarea; bấm Apply JSON trước khi Save live.</small>
      </label>
      <button type="button" className="admin-add-button" onClick={applyJson}>Apply translations JSON</button>
    </div>
  );
}

export function AdminDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("profile");
  const [contentLocale, setContentLocale] = useState<ContentLocale>("en");
  const [draft, setDraft] = useState<AdminProfileDraft>(() => createDraftFromProfile());
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(createDraftFromProfile()));
  const [message, setMessage] = useState("Ready");
  const [cmsSource, setCmsSource] = useState<CmsSource>("source");
  const [cmsReason, setCmsReason] = useState("Source fallback is active until Supabase is configured or live data is saved.");
  const [cmsUpdatedAt, setCmsUpdatedAt] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [canWriteLive, setCanWriteLive] = useState(false);
  const [cmsTable, setCmsTable] = useState("portfolio_profiles");
  const [cmsRecordId, setCmsRecordId] = useState("default");
  const [livePassword, setLivePassword] = useState("");
  const [loadingLive, setLoadingLive] = useState(false);
  const [savingLive, setSavingLive] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsMessage, setAnalyticsMessage] = useState("Analytics has not been loaded yet.");
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [compactAdminHeader, setCompactAdminHeader] = useState(false);

  const generatedSource = useMemo(() => buildProfileSource(draft), [draft]);
  const serializedDraft = useMemo(() => JSON.stringify(draft), [draft]);
  const validationIssues = useMemo(() => validateDraft(draft), [draft]);
  const hasBlockingErrors = validationIssues.some((issue) => issue.level === "error");
  const isDirty = serializedDraft !== savedSnapshot;
  const activeTabInfo = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const isVietnameseEditor = contentLocale === "vi" && localizedEditorTabs.includes(activeTab);
  const viTranslation = useMemo(() => readNestedValue(draft.translations, ["vi"]) || {}, [draft.translations]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      const session = window.sessionStorage.getItem(sessionKey);
      if (saved) {
        const parsedDraft = normalizeAdminDraft(JSON.parse(saved) as Partial<AdminProfileDraft>);
        setDraft(parsedDraft);
        setSavedSnapshot(JSON.stringify(parsedDraft));
        setMessage("Loaded browser draft");
      }
      if (session === "true") {
        setUnlocked(true);
      }
    } catch {
      setMessage("Could not load saved draft");
    }
  }, []);

  useEffect(() => {
    if (unlocked) {
      void loadLiveProfile();
      const passwordToUse = livePassword || password;
      if (passwordToUse) {
        void loadAnalytics(passwordToUse);
      }
    }
  }, [unlocked]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!unlocked) return;

    function handleScroll() {
      setCompactAdminHeader(window.scrollY > 420);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [unlocked]);

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Wrong admin password.");
      }

      setUnlocked(true);
      setLivePassword(password.trim());
      window.sessionStorage.setItem(sessionKey, "true");
      setMessage("Admin unlocked");
      void loadAnalytics(password.trim());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wrong admin password.");
    }
  }

  function saveDraft() {
    const snapshot = JSON.stringify(draft);
    window.localStorage.setItem(storageKey, JSON.stringify(draft, null, 2));
    setSavedSnapshot(snapshot);
    setMessage("Draft saved to this browser");
  }

  function resetDraft() {
    const sourceDraft = createDraftFromProfile();
    window.localStorage.removeItem(storageKey);
    setDraft(sourceDraft);
    setSavedSnapshot(JSON.stringify(sourceDraft));
    setMessage("Draft reset to source data");
  }

  async function loadLiveProfile() {
    setLoadingLive(true);
    try {
      const response = await fetch("/api/admin/profile", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load CMS profile.");
      }

      const loadedProfile = normalizeAdminDraft(result.profile as Partial<AdminProfileDraft>);
      setDraft(loadedProfile);
      setSavedSnapshot(JSON.stringify(loadedProfile));
      setCmsSource(result.source as CmsSource);
      setCmsReason(result.reason || (result.source === "supabase" ? "Loaded live profile from Supabase." : "Using source fallback profile."));
      setCmsUpdatedAt(result.updatedAt ?? null);
      setSupabaseConfigured(Boolean(result.supabaseConfigured));
      setCanWriteLive(Boolean(result.canWrite));
      setCmsTable(result.table || "portfolio_profiles");
      setCmsRecordId(result.recordId || "default");
      setMessage(result.source === "supabase" ? "Loaded live Supabase profile" : "Loaded source fallback profile");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load live profile");
    } finally {
      setLoadingLive(false);
    }
  }

  async function saveLiveProfile() {
    const passwordToUse = livePassword || password;

    if (!passwordToUse) {
      setMessage("Enter admin password before saving to Supabase");
      return;
    }

    if (hasBlockingErrors) {
      setMessage("Fix required content errors before Save live.");
      return;
    }

    setSavingLive(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": passwordToUse,
        },
        body: JSON.stringify({ profile: draft }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Save to Supabase failed.");
      }

      window.localStorage.setItem(storageKey, JSON.stringify(draft, null, 2));
      setSavedSnapshot(JSON.stringify(draft));
      setCmsSource("supabase");
      setCmsReason("Saved live profile to Supabase. Public pages have been revalidated.");
      setCmsUpdatedAt(new Date().toISOString());
      setMessage("Saved to Supabase and revalidated portfolio pages");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save to Supabase failed");
    } finally {
      setSavingLive(false);
    }
  }

  async function loadAnalytics(passwordOverride?: string) {
    const passwordToUse = passwordOverride || livePassword || password;

    if (!passwordToUse) {
      setAnalyticsMessage("Enter ADMIN_PASSWORD to load analytics.");
      return;
    }

    setLoadingAnalytics(true);
    try {
      const response = await fetch("/api/admin/analytics", {
        cache: "no-store",
        headers: { "x-admin-password": passwordToUse },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load analytics.");
      }

      setAnalytics(result as AnalyticsSummary);
      setAnalyticsMessage(result.message || "Analytics loaded from Supabase.");
    } catch (error) {
      setAnalyticsMessage(error instanceof Error ? error.message : "Could not load analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  }

  async function copyProfileSource() {
    try {
      await navigator.clipboard.writeText(generatedSource);
      setMessage("profile.ts copied to clipboard");
    } catch {
      setMessage("Copy failed. Select the generated code manually.");
    }
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "huyvo-portfolio-profile-draft.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("JSON draft downloaded");
  }

  function updateRoot<K extends keyof AdminProfileDraft>(key: K, value: AdminProfileDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }


  function updatePersonalBranding(patch: Partial<PersonalBrandingDraft>) {
    setDraft((current) => ({ ...current, personalBranding: { ...current.personalBranding, ...patch } }));
  }

  function updateBrandMetric(index: number, patch: Partial<BrandMetricDraft>) {
    setDraft((current) => ({
      ...current,
      personalBranding: {
        ...current.personalBranding,
        metrics: current.personalBranding.metrics.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
      },
    }));
  }

  function updateBrandPillar(index: number, patch: Partial<BrandPillarDraft>) {
    setDraft((current) => ({
      ...current,
      personalBranding: {
        ...current.personalBranding,
        pillars: current.personalBranding.pillars.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
      },
    }));
  }

  function updateViTranslation(path: TranslationPath, value: unknown) {
    setDraft((current) => {
      const currentTranslations = isRecord(current.translations) ? current.translations : {};
      const currentVi = isRecord(currentTranslations.vi) ? currentTranslations.vi : {};
      const nextVi = setNestedValue(currentVi, path, value) as MutableRecord;

      return {
        ...current,
        translations: {
          ...currentTranslations,
          vi: nextVi,
        },
      };
    });
  }

  function getViText(path: TranslationPath) {
    return textFromTranslation(viTranslation, path);
  }

  function getViList(path: TranslationPath) {
    return listFromTranslation(viTranslation, path);
  }

  function updateExperience(index: number, patch: Partial<ExperienceDraft>) {
    setDraft((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function updateProject(index: number, patch: Partial<ProjectDraft>) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function updateProjectCaseStudy(index: number, patch: Partial<ProjectCaseStudyDraft>) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, caseStudy: { ...item.caseStudy, ...patch } } : item,
      ),
    }));
  }

  function updateProjectCaseStudyOverview(projectIndex: number, overviewIndex: number, patch: Partial<CaseStudyOverviewDraft>) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) => {
        if (itemIndex !== projectIndex) return project;
        return {
          ...project,
          caseStudy: {
            ...project.caseStudy,
            overview: project.caseStudy.overview.map((item, currentIndex) => currentIndex === overviewIndex ? { ...item, ...patch } : item),
          },
        };
      }),
    }));
  }

  function addProjectCaseStudyOverview(projectIndex: number) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) => itemIndex === projectIndex
        ? { ...project, caseStudy: { ...project.caseStudy, overview: [...project.caseStudy.overview, emptyOverviewItem()] } }
        : project),
    }));
  }

  function removeProjectCaseStudyOverview(projectIndex: number, overviewIndex: number) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) => itemIndex === projectIndex
        ? { ...project, caseStudy: { ...project.caseStudy, overview: project.caseStudy.overview.filter((_, currentIndex) => currentIndex !== overviewIndex) } }
        : project),
    }));
  }

  function updateProjectCaseStudyTimeline(projectIndex: number, timelineIndex: number, patch: Partial<CaseStudyTimelineDraft>) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) => {
        if (itemIndex !== projectIndex) return project;
        return {
          ...project,
          caseStudy: {
            ...project.caseStudy,
            timeline: project.caseStudy.timeline.map((item, currentIndex) => currentIndex === timelineIndex ? { ...item, ...patch } : item),
          },
        };
      }),
    }));
  }

  function addProjectCaseStudyTimeline(projectIndex: number) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) => itemIndex === projectIndex
        ? { ...project, caseStudy: { ...project.caseStudy, timeline: [...project.caseStudy.timeline, emptyTimelineStep(project.caseStudy.timeline.length + 1)] } }
        : project),
    }));
  }

  function removeProjectCaseStudyTimeline(projectIndex: number, timelineIndex: number) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) => itemIndex === projectIndex
        ? { ...project, caseStudy: { ...project.caseStudy, timeline: project.caseStudy.timeline.filter((_, currentIndex) => currentIndex !== timelineIndex) } }
        : project),
    }));
  }

  function updateSkillGroup(index: number, patch: Partial<SkillGroupDraft>) {
    setDraft((current) => ({
      ...current,
      skillGroups: current.skillGroups.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function updateEducation(index: number, patch: Partial<EducationDraft>) {
    setDraft((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function updateCertification(index: number, patch: Partial<CertificationDraft>) {
    setDraft((current) => ({
      ...current,
      certifications: current.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function updateContactMethod(index: number, patch: Partial<ContactMethodDraft>) {
    setDraft((current) => ({
      ...current,
      contact: {
        ...current.contact,
        methods: current.contact.methods.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
      },
    }));
  }

  function updateBlog(index: number, patch: Partial<BlogPostDraft>) {
    setDraft((current) => ({
      ...current,
      blog: current.blog.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function moveExperience(index: number, direction: -1 | 1) {
    setDraft((current) => ({ ...current, experience: moveItem(current.experience, index, direction) }));
  }

  function duplicateExperience(index: number) {
    setDraft((current) => ({ ...current, experience: [...current.experience.slice(0, index + 1), cloneItem(current.experience[index]), ...current.experience.slice(index + 1)] }));
  }

  function removeExperience(index: number) {
    setDraft((current) => ({ ...current, experience: current.experience.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveProject(index: number, direction: -1 | 1) {
    setDraft((current) => ({ ...current, projects: moveItem(current.projects, index, direction) }));
  }

  function duplicateProject(index: number) {
    setDraft((current) => {
      const clone = cloneItem(current.projects[index]);
      clone.title = `${clone.title} Copy`;
      clone.slug = makeUniqueSlug(`${clone.slug || clone.title}-copy`, current.projects.map((project) => project.slug));
      clone.featured = false;
      return { ...current, projects: [...current.projects.slice(0, index + 1), clone, ...current.projects.slice(index + 1)] };
    });
  }

  function removeProject(index: number) {
    setDraft((current) => ({ ...current, projects: current.projects.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveSkillGroup(index: number, direction: -1 | 1) {
    setDraft((current) => ({ ...current, skillGroups: moveItem(current.skillGroups, index, direction) }));
  }

  function duplicateSkillGroup(index: number) {
    setDraft((current) => {
      const clone = cloneItem(current.skillGroups[index]);
      clone.title = `${clone.title} Copy`;
      return { ...current, skillGroups: [...current.skillGroups.slice(0, index + 1), clone, ...current.skillGroups.slice(index + 1)] };
    });
  }

  function removeSkillGroup(index: number) {
    setDraft((current) => ({ ...current, skillGroups: current.skillGroups.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveEducation(index: number, direction: -1 | 1) {
    setDraft((current) => ({ ...current, education: moveItem(current.education, index, direction) }));
  }

  function duplicateEducation(index: number) {
    setDraft((current) => ({ ...current, education: [...current.education.slice(0, index + 1), cloneItem(current.education[index]), ...current.education.slice(index + 1)] }));
  }

  function removeEducation(index: number) {
    setDraft((current) => ({ ...current, education: current.education.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveCertification(index: number, direction: -1 | 1) {
    setDraft((current) => ({ ...current, certifications: moveItem(current.certifications, index, direction) }));
  }

  function duplicateCertification(index: number) {
    setDraft((current) => ({ ...current, certifications: [...current.certifications.slice(0, index + 1), cloneItem(current.certifications[index]), ...current.certifications.slice(index + 1)] }));
  }

  function removeCertification(index: number) {
    setDraft((current) => ({ ...current, certifications: current.certifications.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveContactMethod(index: number, direction: -1 | 1) {
    setDraft((current) => ({ ...current, contact: { ...current.contact, methods: moveItem(current.contact.methods, index, direction) } }));
  }

  function duplicateContactMethod(index: number) {
    setDraft((current) => ({ ...current, contact: { ...current.contact, methods: [...current.contact.methods.slice(0, index + 1), cloneItem(current.contact.methods[index]), ...current.contact.methods.slice(index + 1)] } }));
  }

  function removeContactMethod(index: number) {
    setDraft((current) => ({ ...current, contact: { ...current.contact, methods: current.contact.methods.filter((_, itemIndex) => itemIndex !== index) } }));
  }

  function moveBlog(index: number, direction: -1 | 1) {
    setDraft((current) => ({ ...current, blog: moveItem(current.blog, index, direction) }));
  }

  function duplicateBlog(index: number) {
    setDraft((current) => {
      const clone = cloneItem(current.blog[index]);
      clone.title = `${clone.title} Copy`;
      clone.slug = makeUniqueSlug(`${clone.slug || clone.title}-copy`, current.blog.map((post) => post.slug));
      clone.status = "Draft";
      clone.featured = false;
      return { ...current, blog: [...current.blog.slice(0, index + 1), clone, ...current.blog.slice(index + 1)] };
    });
  }

  function removeBlog(index: number) {
    setDraft((current) => ({ ...current, blog: current.blog.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function moveProjectAsset(projectIndex: number, assetIndex: number, direction: -1 | 1) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) => itemIndex === projectIndex
        ? { ...project, media: { ...project.media, assets: moveItem(project.media.assets, assetIndex, direction) } }
        : project),
    }));
  }

  function duplicateProjectAsset(projectIndex: number, assetIndex: number) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) => itemIndex === projectIndex
        ? { ...project, media: { ...project.media, assets: [...project.media.assets.slice(0, assetIndex + 1), cloneItem(project.media.assets[assetIndex]), ...project.media.assets.slice(assetIndex + 1)] } }
        : project),
    }));
  }

  function updateWorkingProcess(index: number, patch: Partial<{ index: string; title: string; text: string }>) {
    setDraft((current) => ({
      ...current,
      workingProcess: current.workingProcess.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function moveWorkingProcess(index: number, direction: -1 | 1) {
    setDraft((current) => ({ ...current, workingProcess: moveItem(current.workingProcess, index, direction) }));
  }

  function duplicateWorkingProcess(index: number) {
    setDraft((current) => ({ ...current, workingProcess: [...current.workingProcess.slice(0, index + 1), cloneItem(current.workingProcess[index]), ...current.workingProcess.slice(index + 1)] }));
  }

  function removeWorkingProcess(index: number) {
    setDraft((current) => ({ ...current, workingProcess: current.workingProcess.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function updateProfileMedia(patch: Partial<ProfileMediaDraft>) {
    setDraft((current) => ({ ...current, media: { ...current.media, ...patch } }));
  }

  function updateProjectMedia(projectIndex: number, patch: Partial<ProjectMediaDraft>) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) =>
        itemIndex === projectIndex ? { ...project, media: { ...project.media, ...patch } } : project,
      ),
    }));
  }

  function updateProjectAsset(projectIndex: number, assetIndex: number, patch: Partial<MediaAssetDraft>) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) => {
        if (itemIndex !== projectIndex) return project;
        return {
          ...project,
          media: {
            ...project.media,
            assets: project.media.assets.map((asset, currentAssetIndex) =>
              currentAssetIndex === assetIndex ? { ...asset, ...patch } : asset,
            ),
          },
        };
      }),
    }));
  }

  function addProjectAsset(projectIndex: number) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) =>
        itemIndex === projectIndex
          ? { ...project, media: { ...project.media, assets: [...project.media.assets, emptyMediaAsset()] } }
          : project,
      ),
    }));
  }

  function removeProjectAsset(projectIndex: number, assetIndex: number) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((project, itemIndex) =>
        itemIndex === projectIndex
          ? { ...project, media: { ...project.media, assets: project.media.assets.filter((_, currentAssetIndex) => currentAssetIndex !== assetIndex) } }
          : project,
      ),
    }));
  }

  if (!unlocked) {
    return (
      <main className="admin-page admin-login-page" onKeyDown={(event) => event.stopPropagation()}>
        <div className="admin-login-card">
          <div className="admin-login-head">
            <a className="admin-back" href="/">← Back to portfolio</a>
            <ThemeSwitcher />
          </div>
          <div className="admin-badge">{appVersion.label} · Case Study Pro</div>
          <h1>Portfolio CMS / Admin</h1>
          <p>
            This version connects profile, projects, blog notes, media assets and analytics to Supabase through protected Next.js API routes.
            Use the advanced CMS controls to shape portfolio content, publish notes and build recruiter-ready case studies without editing code.
          </p>
          <form onSubmit={handleUnlock} className="admin-login-form">
            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                autoFocus
                placeholder="Enter admin password"
                onKeyDown={(event) => event.stopPropagation()}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button type="submit">Unlock admin</button>
          </form>
          <small>Set <code>ADMIN_PASSWORD</code> on Vercel for server-side protection. Local fallback: <code>{fallbackPassword}</code>.</small>
          <div className="admin-message">{message}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page" onKeyDown={(event) => event.stopPropagation()}>
      <header className="admin-topbar">
        <div>
          <a className="admin-back" href="/">← Portfolio</a>
          <h1>Portfolio CMS / Admin</h1>
          <p>{appVersion.label} · {appVersion.name}</p>
        </div>
        <div className="admin-actions">
          <ThemeSwitcher />
          <label className="admin-live-password">
            <span>Save password</span>
            <input
              type="password"
              value={livePassword}
              placeholder="ADMIN_PASSWORD"
              onKeyDown={(event) => event.stopPropagation()}
              onChange={(event) => setLivePassword(event.target.value)}
            />
          </label>
          <button type="button" onClick={loadLiveProfile} disabled={loadingLive}>{loadingLive ? "Loading..." : "Load live"}</button>
          <button type="button" onClick={saveDraft}>Save draft</button>
          <button type="button" className="primary" onClick={saveLiveProfile} disabled={savingLive || hasBlockingErrors}>{savingLive ? "Saving..." : "Save live"}</button>
        </div>
      </header>

      <div className="admin-status">
        <span>{message}{isDirty ? " · Unsaved changes" : ""}</span>
        <button type="button" onClick={resetDraft}>Reset to source data</button>
      </div>

      <div className="admin-cms-status">
        <div>
          <span>CMS source</span>
          <strong>{cmsSource === "supabase" ? "Supabase live" : "Source fallback"}</strong>
          <p>{cmsReason}</p>
        </div>
        <div>
          <span>Supabase</span>
          <strong>{supabaseConfigured ? "Configured" : "Not configured"}</strong>
          <p>Table: <code>{cmsTable}</code> · Record: <code>{cmsRecordId}</code> · Write: {canWriteLive ? "ready" : "missing service role"}</p>
        </div>
        <div>
          <span>Last update</span>
          <strong>{cmsUpdatedAt ? new Date(cmsUpdatedAt).toLocaleString() : "Not saved yet"}</strong>
          <p>Public pages fall back to <code>src/data/profile.ts</code> when Supabase is unavailable.</p>
        </div>
      </div>

      <div className="admin-production-panel">
        <div>
          <span>Production checklist</span>
          <strong>{cmsSource === "supabase" ? "Live CMS connected" : "Finish Supabase setup"}</strong>
          <p>
            Run <code>supabase/schema.sql</code>, save one live profile, replace placeholder email/social links,
            add media URLs if available, enable analytics if needed, then redeploy after environment changes.
          </p>
        </div>
        <ul>
          <li className={supabaseConfigured ? "done" : ""}>Supabase env configured</li>
          <li className={canWriteLive ? "done" : ""}>Service role write ready</li>
          <li className={cmsSource === "supabase" ? "done" : ""}>Live profile saved</li>
          <li className={draft.email !== "hello@example.com" ? "done" : ""}>Real email updated</li>
          <li className={analytics?.enabled ? "done" : ""}>Analytics tracking enabled</li>
          <li className={draft.projects.some((project) => project.media.thumbnailUrl || project.media.assets.some((asset) => asset.url)) ? "done" : ""}>Project media configured</li>
          <li className={draft.media.avatarUrl || draft.projects.some((project) => project.media.thumbnailUrl || project.media.assets.some((asset) => asset.url)) ? "done" : ""}>Google Drive/direct media supported</li>
          <li className={draft.translations?.vi ? "done" : ""}>Vietnamese translation overrides configured</li>
          <li className={draft.blog?.some((post) => post.status === "Published") ? "done" : ""}>Published blog notes configured</li>
        </ul>
      </div>

      <AdminStatsPanel draft={draft} isDirty={isDirty} />
      <ValidationPanel issues={validationIssues} />

      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Admin sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <small>{tab.description}</small>
            </button>
          ))}
        </aside>

        <div className="admin-main">
          <div className={compactAdminHeader ? "admin-current-tab compact" : "admin-current-tab"}>
            <div className="admin-current-copy">
              <span>Editing</span>
              <h2>{activeTabInfo.label}</h2>
              <p>{activeTabInfo.description}</p>
            </div>
            <div className="admin-current-actions">
              <span className={isDirty ? "admin-dirty-badge active" : "admin-dirty-badge"}>{isDirty ? "Unsaved" : "Saved"}</span>
              <button type="button" onClick={saveDraft}>Save draft</button>
              <button type="button" className="primary" onClick={saveLiveProfile} disabled={savingLive || hasBlockingErrors}>{savingLive ? "Saving..." : "Save live"}</button>
            </div>
            {localizedEditorTabs.includes(activeTab) && (
              <div className="admin-locale-toggle" aria-label="Content language editor">
                <button type="button" className={contentLocale === "en" ? "active" : ""} onClick={() => setContentLocale("en")}>
                  English gốc
                </button>
                <button type="button" className={contentLocale === "vi" ? "active" : ""} onClick={() => setContentLocale("vi")}>
                  Tiếng Việt
                </button>
              </div>
            )}
          </div>

          {localizedEditorTabs.includes(activeTab) && (
            <div className={isVietnameseEditor ? "admin-locale-note vi" : "admin-locale-note"}>
              {isVietnameseEditor ? (
                <span>Đang nhập nội dung <strong>Tiếng Việt</strong>. Dữ liệu gốc English không bị thay đổi; trường nào bỏ trống sẽ tự fallback về English.</span>
              ) : (
                <span>Đang nhập dữ liệu gốc <strong>English</strong>. Bật Tiếng Việt để nhập bản dịch tại đúng vị trí hiển thị.</span>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <AdminSection
              title={isVietnameseEditor ? "Profile basics — Tiếng Việt" : "Profile basics"}
              description={isVietnameseEditor ? "Nhập bản dịch tiếng Việt cho Hero, About, Resume, SEO và Contact. Nội dung English gốc được giữ nguyên." : "Update the information that appears in Hero, About, Resume, SEO and Contact sections."}
            >
              {!isVietnameseEditor ? (
                <>
                  <div className="admin-grid two">
                    <TextField label="Name" value={draft.name} onChange={(value) => updateRoot("name", value)} />
                    <TextField label="Short name / monogram" value={draft.shortName} onChange={(value) => updateRoot("shortName", value)} />
                    <TextField label="Role" value={draft.role} onChange={(value) => updateRoot("role", value)} />
                    <TextField label="Location" value={draft.location} onChange={(value) => updateRoot("location", value)} />
                    <TextField label="Email" value={draft.email} onChange={(value) => updateRoot("email", value)} />
                    <TextField label="Availability" value={draft.availability} onChange={(value) => updateRoot("availability", value)} />
                    <TextAreaField label="Headline" value={draft.headline} rows={3} onChange={(value) => updateRoot("headline", value)} />
                    <TextAreaField label="Description" value={draft.description} rows={4} onChange={(value) => updateRoot("description", value)} />
                    <LineListField label="Specialties" value={draft.specialties} onChange={(value) => updateRoot("specialties", value)} />
                    <LineListField label="About paragraphs" value={draft.about} onChange={(value) => updateRoot("about", value)} rows={6} />
                  </div>
                  <div className="admin-nested-card brand-editor-card">
                    <h3>Personal branding</h3>
                    <div className="admin-grid two">
                      <TextAreaField label="Brand statement" value={draft.personalBranding.statement} rows={3} onChange={(value) => updatePersonalBranding({ statement: value })} />
                      <TextAreaField label="Brand signature" value={draft.personalBranding.signature} rows={4} onChange={(value) => updatePersonalBranding({ signature: value })} />
                      <LineListField label="Brand keywords" value={draft.personalBranding.keywords} rows={5} onChange={(value) => updatePersonalBranding({ keywords: value })} />
                    </div>
                    <div className="admin-mini-grid">
                      {draft.personalBranding.metrics.map((metric, index) => (
                        <div className="admin-grid two admin-row-card" key={`brand-metric-${index}`}>
                          <TextField label="Metric label" value={metric.label} onChange={(value) => updateBrandMetric(index, { label: value })} />
                          <TextField label="Metric value" value={metric.value} onChange={(value) => updateBrandMetric(index, { value })} />
                          <TextAreaField label="Metric detail" value={metric.detail} rows={3} onChange={(value) => updateBrandMetric(index, { detail: value })} />
                        </div>
                      ))}
                    </div>
                    <div className="admin-stack compact-stack">
                      <h4>Brand pillars</h4>
                      {draft.personalBranding.pillars.map((pillar, index) => (
                        <div className="admin-grid two admin-row-card" key={`brand-pillar-${index}`}>
                          <TextField label="Pillar title" value={pillar.title} onChange={(value) => updateBrandPillar(index, { title: value })} />
                          <TextAreaField label="Pillar text" value={pillar.text} rows={3} onChange={(value) => updateBrandPillar(index, { text: value })} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="admin-nested-card">
                    <h3>Career summary</h3>
                    <div className="admin-grid two">
                      <TextField label="Summary title" value={draft.careerSummary.title} onChange={(value) => setDraft((current) => ({ ...current, careerSummary: { ...current.careerSummary, title: value } }))} />
                      <TextAreaField label="Summary text" value={draft.careerSummary.text} rows={4} onChange={(value) => setDraft((current) => ({ ...current, careerSummary: { ...current.careerSummary, text: value } }))} />
                    </div>
                    <div className="admin-mini-grid">
                      {draft.careerSummary.highlights.map((item, index) => (
                        <div className="admin-inline-pair" key={`${item.label}-${index}`}>
                          <input value={item.label} autoComplete="off" spellCheck={false} onKeyDown={(event) => event.stopPropagation()} onChange={(event) => setDraft((current) => ({ ...current, careerSummary: { ...current.careerSummary, highlights: current.careerSummary.highlights.map((highlight, highlightIndex) => highlightIndex === index ? { ...highlight, label: event.target.value } : highlight) } }))} />
                          <input value={item.value} autoComplete="off" spellCheck={false} onKeyDown={(event) => event.stopPropagation()} onChange={(event) => setDraft((current) => ({ ...current, careerSummary: { ...current.careerSummary, highlights: current.careerSummary.highlights.map((highlight, highlightIndex) => highlightIndex === index ? { ...highlight, value: event.target.value } : highlight) } }))} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="admin-nested-card">
                    <h3>Working process</h3>
                    <div className="admin-stack compact-stack">
                      {draft.workingProcess.map((step, index) => (
                        <div className="admin-grid two admin-row-card" key={`${step.index}-${step.title}-${index}`}>
                          <TextField label="Step index" value={step.index} onChange={(value) => updateWorkingProcess(index, { index: value })} />
                          <TextField label="Step title" value={step.title} onChange={(value) => updateWorkingProcess(index, { title: value })} />
                          <TextAreaField label="Step description" value={step.text} rows={3} onChange={(value) => updateWorkingProcess(index, { text: value })} />
                          <ItemActions
                            onMoveUp={() => moveWorkingProcess(index, -1)}
                            onMoveDown={() => moveWorkingProcess(index, 1)}
                            onDuplicate={() => duplicateWorkingProcess(index)}
                            onRemove={() => removeWorkingProcess(index)}
                            disableMoveUp={index === 0}
                            disableMoveDown={index === draft.workingProcess.length - 1}
                            removeLabel="Delete step"
                          />
                        </div>
                      ))}
                      <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, workingProcess: [...current.workingProcess, emptyWorkingProcessStep(current.workingProcess.length + 1)] }))}>+ Add working step</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="admin-translation-reference">
                    <strong>English reference</strong>
                    <span>{draft.name} · {draft.role} · {draft.email}</span>
                    <small>Name, short name and email are global identity fields, so they remain controlled from English source mode.</small>
                  </div>
                  <div className="admin-grid two">
                    <TextField label="VI Role" value={getViText(["role"])} placeholder={draft.role} onChange={(value) => updateViTranslation(["role"], value)} />
                    <TextField label="VI Location" value={getViText(["location"])} placeholder={draft.location} onChange={(value) => updateViTranslation(["location"], value)} />
                    <TextField label="VI Availability" value={getViText(["availability"])} placeholder={draft.availability} onChange={(value) => updateViTranslation(["availability"], value)} />
                    <TextAreaField label="VI Headline" value={getViText(["headline"])} rows={3} onChange={(value) => updateViTranslation(["headline"], value)} />
                    <TextAreaField label="VI Description" value={getViText(["description"])} rows={4} onChange={(value) => updateViTranslation(["description"], value)} />
                    <LineListField label="VI Specialties" value={getViList(["specialties"])} onChange={(value) => updateViTranslation(["specialties"], value)} />
                    <LineListField label="VI About paragraphs" value={getViList(["about"])} onChange={(value) => updateViTranslation(["about"], value)} rows={6} />
                  </div>
                  <div className="admin-nested-card vi-card brand-editor-card">
                    <h3>Personal branding — Tiếng Việt</h3>
                    <div className="admin-grid two">
                      <TextAreaField label="VI Brand statement" value={getViText(["personalBranding", "statement"])} rows={3} onChange={(value) => updateViTranslation(["personalBranding", "statement"], value)} />
                      <TextAreaField label="VI Brand signature" value={getViText(["personalBranding", "signature"])} rows={4} onChange={(value) => updateViTranslation(["personalBranding", "signature"], value)} />
                      <LineListField label="VI Brand keywords" value={getViList(["personalBranding", "keywords"])} rows={5} onChange={(value) => updateViTranslation(["personalBranding", "keywords"], value)} />
                    </div>
                    <div className="admin-mini-grid">
                      {draft.personalBranding.metrics.map((metric, index) => (
                        <div className="admin-grid two admin-row-card" key={`vi-brand-metric-${index}`}>
                          <TextField label="VI Metric label" value={getViText(["personalBranding", "metrics", index, "label"])} placeholder={metric.label} onChange={(value) => updateViTranslation(["personalBranding", "metrics", index, "label"], value)} />
                          <TextField label="VI Metric value" value={getViText(["personalBranding", "metrics", index, "value"])} placeholder={metric.value} onChange={(value) => updateViTranslation(["personalBranding", "metrics", index, "value"], value)} />
                          <TextAreaField label="VI Metric detail" value={getViText(["personalBranding", "metrics", index, "detail"])} rows={3} onChange={(value) => updateViTranslation(["personalBranding", "metrics", index, "detail"], value)} />
                        </div>
                      ))}
                    </div>
                    <div className="admin-stack compact-stack">
                      <h4>Brand pillars — Tiếng Việt</h4>
                      {draft.personalBranding.pillars.map((pillar, index) => (
                        <div className="admin-grid two admin-row-card" key={`vi-brand-pillar-${index}`}>
                          <TextField label="VI Pillar title" value={getViText(["personalBranding", "pillars", index, "title"])} placeholder={pillar.title} onChange={(value) => updateViTranslation(["personalBranding", "pillars", index, "title"], value)} />
                          <TextAreaField label="VI Pillar text" value={getViText(["personalBranding", "pillars", index, "text"])} rows={3} onChange={(value) => updateViTranslation(["personalBranding", "pillars", index, "text"], value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="admin-nested-card vi-card">
                    <h3>Career summary — Tiếng Việt</h3>
                    <div className="admin-grid two">
                      <TextField label="VI Summary title" value={getViText(["careerSummary", "title"])} placeholder={draft.careerSummary.title} onChange={(value) => updateViTranslation(["careerSummary", "title"], value)} />
                      <TextAreaField label="VI Summary text" value={getViText(["careerSummary", "text"])} rows={4} onChange={(value) => updateViTranslation(["careerSummary", "text"], value)} />
                    </div>
                    <div className="admin-mini-grid">
                      {draft.careerSummary.highlights.map((item, index) => (
                        <div className="admin-inline-pair" key={`vi-${item.label}-${index}`}>
                          <input autoComplete="off" spellCheck={false} onKeyDown={(event) => event.stopPropagation()} aria-label={`VI highlight label ${index + 1}`} placeholder={item.label} value={getViText(["careerSummary", "highlights", index, "label"])} onChange={(event) => updateViTranslation(["careerSummary", "highlights", index, "label"], event.target.value)} />
                          <input autoComplete="off" spellCheck={false} onKeyDown={(event) => event.stopPropagation()} aria-label={`VI highlight value ${index + 1}`} placeholder={item.value} value={getViText(["careerSummary", "highlights", index, "value"])} onChange={(event) => updateViTranslation(["careerSummary", "highlights", index, "value"], event.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="admin-nested-card vi-card">
                    <h3>Working process — Tiếng Việt</h3>
                    <div className="admin-stack compact-stack">
                      {draft.workingProcess.map((step, index) => (
                        <div className="admin-grid two admin-row-card" key={`vi-working-${step.index}-${index}`}>
                          <div className="admin-translation-reference small"><strong>Source step</strong><span>{step.index}</span></div>
                          <TextField label="VI Step title" value={getViText(["workingProcess", step.index, "title"])} placeholder={step.title} onChange={(value) => updateViTranslation(["workingProcess", step.index, "title"], value)} />
                          <TextAreaField label="VI Step description" value={getViText(["workingProcess", step.index, "text"])} rows={3} onChange={(value) => updateViTranslation(["workingProcess", step.index, "text"], value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </AdminSection>
          )}

          {activeTab === "media" && (
            <AdminSection
              title={isVietnameseEditor ? "Media & project assets — Tiếng Việt" : "Media & project assets"}
              description={isVietnameseEditor ? "Nhập alt text, title và caption tiếng Việt cho media. URL ảnh/file vẫn dùng chung từ dữ liệu gốc English." : "Add public image/file URLs or Google Drive share links for avatar, resume file, project thumbnails and case-study galleries. Use sanitized screenshots only."}
            >
              {!isVietnameseEditor ? (
                <>
                  <div className="admin-nested-card">
                    <h3>Profile media</h3>
                    <div className="admin-grid two admin-media-profile-grid">
                      <div>
                        <TextField label="Avatar image URL" value={draft.media.avatarUrl ?? ""} onChange={(value) => updateProfileMedia({ avatarUrl: value })} placeholder="Google Drive share link or https://..." />
                        <GoogleDriveHelp url={draft.media.avatarUrl} />
                      </div>
                      <TextField label="Avatar alt text" value={draft.media.avatarAlt ?? ""} onChange={(value) => updateProfileMedia({ avatarAlt: value })} />
                      <div>
                        <TextField label="Cover image URL" value={draft.media.coverImageUrl ?? ""} onChange={(value) => updateProfileMedia({ coverImageUrl: value })} placeholder="Optional Google Drive share link or public URL" />
                        <GoogleDriveHelp url={draft.media.coverImageUrl} />
                      </div>
                      <div>
                        <TextField label="Resume/CV file URL" value={draft.media.resumeUrl ?? ""} onChange={(value) => updateProfileMedia({ resumeUrl: value })} placeholder="PDF link, Google Drive share link or public URL" />
                        <GoogleDriveHelp url={draft.media.resumeUrl} />
                      </div>
                    </div>
                    <AdminImagePreview
                      url={draft.media.avatarUrl}
                      alt={draft.media.avatarAlt || "Profile preview"}
                      fallback={draft.shortName}
                      note="Avatar preview. For best result, use a square public image URL or a public Google Drive image link. Leave empty to keep the monogram card."
                    />
                  </div>

                  <div className="admin-stack">
                    {draft.projects.map((project, projectIndex) => (
                      <div className="admin-editor-card" key={`${project.slug}-media`}>
                        <div className="admin-card-head">
                          <div>
                            <h3>{project.title}</h3>
                            <small>{project.slug}</small>
                          </div>
                          <button type="button" onClick={() => addProjectAsset(projectIndex)}>+ Add asset</button>
                        </div>
                        <div className="admin-grid two">
                          <TextField label="Project icon / initials" value={project.media.icon ?? ""} onChange={(value) => updateProjectMedia(projectIndex, { icon: value })} />
                          <TextField label="Thumbnail alt text" value={project.media.thumbnailAlt ?? ""} onChange={(value) => updateProjectMedia(projectIndex, { thumbnailAlt: value })} />
                          <div>
                            <TextField label="Thumbnail image URL" value={project.media.thumbnailUrl ?? ""} onChange={(value) => updateProjectMedia(projectIndex, { thumbnailUrl: value })} placeholder="Google Drive share link or https://..." />
                            <GoogleDriveHelp url={project.media.thumbnailUrl} />
                          </div>
                          <AdminImagePreview
                            url={project.media.thumbnailUrl}
                            alt={project.media.thumbnailAlt || project.title}
                            fallback={project.media.icon || project.title.slice(0, 2).toUpperCase()}
                            note="Shown on project cards and case-study hero."
                            small
                          />
                        </div>

                        <div className="admin-stack compact-stack">
                          <h4>Case-study gallery assets</h4>
                          {project.media.assets.map((asset, assetIndex) => (
                            <div className="admin-grid two admin-row-card" key={`${project.slug}-${assetIndex}`}>
                              <TextField label="Asset title" value={asset.title} onChange={(value) => updateProjectAsset(projectIndex, assetIndex, { title: value })} />
                              <MediaTypeField value={asset.type} onChange={(value) => updateProjectAsset(projectIndex, assetIndex, { type: value })} />
                              <div>
                                <TextField label="Asset URL" value={asset.url} onChange={(value) => updateProjectAsset(projectIndex, assetIndex, { url: value })} placeholder="Google Drive share link, image, document, video or public link" />
                                <GoogleDriveHelp url={asset.url} />
                              </div>
                              <TextField label="Alt text" value={asset.alt ?? ""} onChange={(value) => updateProjectAsset(projectIndex, assetIndex, { alt: value })} />
                              <TextAreaField label="Caption" value={asset.caption ?? ""} rows={3} onChange={(value) => updateProjectAsset(projectIndex, assetIndex, { caption: value })} />
                              <ItemActions
                                onMoveUp={() => moveProjectAsset(projectIndex, assetIndex, -1)}
                                onMoveDown={() => moveProjectAsset(projectIndex, assetIndex, 1)}
                                onDuplicate={() => duplicateProjectAsset(projectIndex, assetIndex)}
                                onRemove={() => removeProjectAsset(projectIndex, assetIndex)}
                                disableMoveUp={assetIndex === 0}
                                disableMoveDown={assetIndex === project.media.assets.length - 1}
                                removeLabel="Delete asset"
                              />
                            </div>
                          ))}
                          {project.media.assets.length === 0 && <p className="admin-empty-note">No gallery assets yet. Add screenshots, diagrams or public document links for this project.</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="admin-stack">
                  <div className="admin-nested-card vi-card">
                    <h3>Profile media text — Tiếng Việt</h3>
                    <div className="admin-grid two admin-media-profile-grid">
                      <TextField label="VI Avatar alt text" value={getViText(["media", "avatarAlt"])} placeholder={draft.media.avatarAlt ?? "Profile preview"} onChange={(value) => updateViTranslation(["media", "avatarAlt"], value)} />
                      <div className="admin-translation-reference small"><strong>Global avatar URL</strong><span>{draft.media.avatarUrl || "No avatar URL yet"}</span></div>
                    </div>
                    <AdminImagePreview
                      url={draft.media.avatarUrl}
                      alt={getViText(["media", "avatarAlt"]) || draft.media.avatarAlt || "Profile preview"}
                      fallback={draft.shortName}
                      note="URL dùng chung từ English gốc; chỉ alt text/caption được dịch ở chế độ Tiếng Việt."
                    />
                  </div>

                  {draft.projects.map((project) => (
                    <div className="admin-editor-card vi-card" key={`${project.slug}-media-vi`}>
                      <div className="admin-card-head">
                        <div>
                          <h3>{getViText(["projects", project.slug, "title"]) || project.title}</h3>
                          <small>{project.slug} · URL media dùng chung từ English gốc</small>
                        </div>
                      </div>
                      <div className="admin-grid two">
                        <TextField label="VI Thumbnail alt text" value={getViText(["projects", project.slug, "media", "thumbnailAlt"])} placeholder={project.media.thumbnailAlt ?? project.title} onChange={(value) => updateViTranslation(["projects", project.slug, "media", "thumbnailAlt"], value)} />
                        <AdminImagePreview
                          url={project.media.thumbnailUrl}
                          alt={getViText(["projects", project.slug, "media", "thumbnailAlt"]) || project.media.thumbnailAlt || project.title}
                          fallback={project.media.icon || project.title.slice(0, 2).toUpperCase()}
                          note="Thumbnail URL giữ nguyên; bản dịch chỉ đổi alt text hiển thị/phục vụ SEO-accessibility."
                          small
                        />
                      </div>

                      <div className="admin-stack compact-stack">
                        <h4>Case-study gallery assets — Tiếng Việt</h4>
                        {project.media.assets.map((asset, assetIndex) => (
                          <div className="admin-grid two admin-row-card" key={`${project.slug}-vi-asset-${assetIndex}`}>
                            <TextField label="VI Asset title" value={getViText(["projects", project.slug, "media", "assets", assetIndex, "title"])} placeholder={asset.title} onChange={(value) => updateViTranslation(["projects", project.slug, "media", "assets", assetIndex, "title"], value)} />
                            <TextField label="VI Alt text" value={getViText(["projects", project.slug, "media", "assets", assetIndex, "alt"])} placeholder={asset.alt ?? asset.title} onChange={(value) => updateViTranslation(["projects", project.slug, "media", "assets", assetIndex, "alt"], value)} />
                            <TextAreaField label="VI Caption" value={getViText(["projects", project.slug, "media", "assets", assetIndex, "caption"])} rows={3} onChange={(value) => updateViTranslation(["projects", project.slug, "media", "assets", assetIndex, "caption"], value)} />
                            <div className="admin-translation-reference small"><strong>Global asset URL</strong><span>{asset.url || "No asset URL yet"}</span></div>
                          </div>
                        ))}
                        {project.media.assets.length === 0 && <p className="admin-empty-note">Project này chưa có gallery asset ở dữ liệu gốc. Tắt Tiếng Việt để thêm asset trước.</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AdminSection>
          )}

          {activeTab === "language" && (
            <AdminSection title="Multi-language portfolio" description="English is the source profile. Vietnamese is now edited with the Tiếng Việt toggle inside each content tab instead of editing raw JSON first.">
              <div className="admin-stack">
                <div className="admin-nested-card">
                  <h3>Public language routes</h3>
                  <p className="admin-muted-text">The public portfolio supports <code>/en</code>, <code>/vi</code>, <code>/en/resume</code>, <code>/vi/resume</code>, <code>/en/contact</code>, <code>/vi/contact</code> localized project case studies and localized blog notes.</p>
                </div>
                <div className="admin-nested-card vi-card">
                  <h3>Recommended editing flow</h3>
                  <ol className="admin-help-list">
                    <li>Open a content tab such as <strong>Profile</strong>, <strong>Experience</strong>, <strong>Projects</strong>, <strong>Skills</strong>, <strong>Credentials</strong> or <strong>Media</strong>.</li>
                    <li>Keep <strong>English gốc</strong> on when editing the source CV data.</li>
                    <li>Switch to <strong>Tiếng Việt</strong> to enter Vietnamese text at the exact same display position.</li>
                    <li>Click <strong>Save live</strong> to publish both English source data and Vietnamese overrides to Supabase.</li>
                  </ol>
                  <p className="admin-muted-text">Fields left empty in Tiếng Việt mode automatically fall back to the English source, so you can translate gradually.</p>
                </div>
                <details className="admin-nested-card admin-advanced-json">
                  <summary>Advanced: translations JSON backup</summary>
                  <p className="admin-muted-text">Use this only for backup, bulk paste or troubleshooting. Normal editing should use the Tiếng Việt toggle in each tab.</p>
                  <TranslationsJsonField
                    value={draft.translations}
                    onStatus={setMessage}
                    onChange={(translations) => setDraft((current) => ({ ...current, translations }))}
                  />
                </details>
              </div>
            </AdminSection>
          )}

          {activeTab === "experience" && (
            <AdminSection
              title={isVietnameseEditor ? "Experience timeline — Tiếng Việt" : "Experience timeline"}
              description={isVietnameseEditor ? "Nhập bản dịch tiếng Việt cho từng mốc kinh nghiệm. Thêm/xóa mốc vẫn thực hiện ở English gốc." : "Each item becomes one timeline entry on the portfolio and one resume block."}
            >
              <div className="admin-stack">
                {draft.experience.map((item, index) => {
                  const viKey = experienceTranslationKey(item);
                  return (
                    <article className="admin-editor-card" key={`${item.role}-${index}`}>
                      <div className="admin-card-head">
                        <div>
                          <h3>{isVietnameseEditor ? getViText(["experience", viKey, "role"]) || item.role || `Experience ${index + 1}` : item.role || `Experience ${index + 1}`}</h3>
                          {isVietnameseEditor && <small>English source: {item.organization} · {item.role}</small>}
                        </div>
                        {!isVietnameseEditor && (
                          <ItemActions
                            onMoveUp={() => moveExperience(index, -1)}
                            onMoveDown={() => moveExperience(index, 1)}
                            onDuplicate={() => duplicateExperience(index)}
                            onRemove={() => removeExperience(index)}
                            disableMoveUp={index === 0}
                            disableMoveDown={index === draft.experience.length - 1}
                          />
                        )}
                      </div>
                      {!isVietnameseEditor ? (
                        <div className="admin-grid two">
                          <TextField label="Period" value={item.period} onChange={(value) => updateExperience(index, { period: value })} />
                          <TextField label="Role" value={item.role} onChange={(value) => updateExperience(index, { role: value })} />
                          <TextField label="Organization" value={item.organization} onChange={(value) => updateExperience(index, { organization: value })} />
                          <TextAreaField label="Summary" value={item.summary} rows={3} onChange={(value) => updateExperience(index, { summary: value })} />
                          <LineListField label="Responsibilities" value={item.responsibilities} onChange={(value) => updateExperience(index, { responsibilities: value })} />
                          <LineListField label="Tags" value={item.tags} onChange={(value) => updateExperience(index, { tags: value })} rows={4} />
                        </div>
                      ) : (
                        <div className="admin-grid two">
                          <TextField label="VI Period" value={getViText(["experience", viKey, "period"])} placeholder={item.period} onChange={(value) => updateViTranslation(["experience", viKey, "period"], value)} />
                          <TextField label="VI Role" value={getViText(["experience", viKey, "role"])} placeholder={item.role} onChange={(value) => updateViTranslation(["experience", viKey, "role"], value)} />
                          <TextField label="VI Organization" value={getViText(["experience", viKey, "organization"])} placeholder={item.organization} onChange={(value) => updateViTranslation(["experience", viKey, "organization"], value)} />
                          <TextAreaField label="VI Summary" value={getViText(["experience", viKey, "summary"])} rows={3} onChange={(value) => updateViTranslation(["experience", viKey, "summary"], value)} />
                          <LineListField label="VI Responsibilities" value={getViList(["experience", viKey, "responsibilities"])} onChange={(value) => updateViTranslation(["experience", viKey, "responsibilities"], value)} />
                          <LineListField label="VI Tags" value={getViList(["experience", viKey, "tags"])} onChange={(value) => updateViTranslation(["experience", viKey, "tags"], value)} rows={4} />
                        </div>
                      )}
                    </article>
                  );
                })}
                {!isVietnameseEditor ? (
                  <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, experience: [...current.experience, emptyExperience()] }))}>+ Add experience</button>
                ) : (
                  <p className="admin-empty-note">Để thêm hoặc xóa mốc kinh nghiệm, tắt Tiếng Việt và chỉnh ở English gốc.</p>
                )}
              </div>
            </AdminSection>
          )}

          {activeTab === "projects" && (
            <AdminSection
              title={isVietnameseEditor ? "Project portfolio — Tiếng Việt" : "Project portfolio"}
              description={isVietnameseEditor ? "Nhập bản dịch tiếng Việt cho project cards và case-study. Slug, category, featured và media URL vẫn giữ theo dữ liệu gốc." : "Manage project cards and the case-study content used by /projects/[slug]."}
            >
              <div className="admin-stack">
                {draft.projects.map((project, index) => (
                  <article className="admin-editor-card" key={`${project.slug}-${index}`}>
                    <div className="admin-card-head">
                      <div>
                        <h3>{isVietnameseEditor ? getViText(["projects", project.slug, "title"]) || project.title || `Project ${index + 1}` : project.title || `Project ${index + 1}`}</h3>
                        <small>{project.slug}</small>
                      </div>
                      {!isVietnameseEditor && (
                        <div>
                          <button type="button" onClick={() => updateProject(index, { slug: makeUniqueSlug(project.title, draft.projects.filter((_, itemIndex) => itemIndex !== index).map((item) => item.slug)) })}>Auto slug</button>
                          <ItemActions
                            onMoveUp={() => moveProject(index, -1)}
                            onMoveDown={() => moveProject(index, 1)}
                            onDuplicate={() => duplicateProject(index)}
                            onRemove={() => removeProject(index)}
                            disableMoveUp={index === 0}
                            disableMoveDown={index === draft.projects.length - 1}
                          />
                        </div>
                      )}
                    </div>
                    {!isVietnameseEditor ? (
                      <>
                        <div className="admin-grid two">
                          <TextField label="Title" value={project.title} onChange={(value) => updateProject(index, { title: value })} />
                          <TextField label="Slug" value={project.slug} onChange={(value) => updateProject(index, { slug: slugify(value) })} />
                          <label className="admin-field">
                            <span>Category</span>
                            <select value={project.category} onChange={(event) => updateProject(index, { category: event.target.value as ProjectCategory })}>
                              <option value="Professional">Professional</option>
                              <option value="Product">Product</option>
                              <option value="Tool">Tool</option>
                            </select>
                          </label>
                          <TextField label="Year" value={project.year} onChange={(value) => updateProject(index, { year: value })} />
                          <TextField label="Role" value={project.role} onChange={(value) => updateProject(index, { role: value })} />
                          <label className="admin-check-field">
                            <input type="checkbox" checked={project.featured} onChange={(event) => updateProject(index, { featured: event.target.checked })} />
                            <span>Featured project</span>
                          </label>
                          <TextAreaField label="Summary" value={project.summary} rows={4} onChange={(value) => updateProject(index, { summary: value })} />
                          <LineListField label="Contributions" value={project.contributions} onChange={(value) => updateProject(index, { contributions: value })} />
                          <LineListField label="Technologies / tags" value={project.technologies} onChange={(value) => updateProject(index, { technologies: value })} />
                        </div>
                        <div className="admin-nested-card">
                          <h4>Case study</h4>
                          <div className="admin-subsection-head">
                            <strong>Overview metrics</strong>
                            <button type="button" onClick={() => addProjectCaseStudyOverview(index)}>+ Add metric</button>
                          </div>
                          <div className="admin-stack compact-stack">
                            {project.caseStudy.overview.map((item, overviewIndex) => (
                              <div className="admin-grid three admin-row-card" key={`overview-${project.slug}-${overviewIndex}`}>
                                <TextField label="Label" value={item.label} onChange={(value) => updateProjectCaseStudyOverview(index, overviewIndex, { label: value })} />
                                <TextField label="Value" value={item.value} onChange={(value) => updateProjectCaseStudyOverview(index, overviewIndex, { value })} />
                                <TextField label="Detail" value={item.detail ?? ""} onChange={(value) => updateProjectCaseStudyOverview(index, overviewIndex, { detail: value })} />
                                <button type="button" className="danger" onClick={() => removeProjectCaseStudyOverview(index, overviewIndex)}>Delete metric</button>
                              </div>
                            ))}
                          </div>
                          <div className="admin-subsection-head with-gap">
                            <strong>Delivery timeline</strong>
                            <button type="button" onClick={() => addProjectCaseStudyTimeline(index)}>+ Add timeline step</button>
                          </div>
                          <div className="admin-stack compact-stack">
                            {project.caseStudy.timeline.map((item, timelineIndex) => (
                              <div className="admin-grid three admin-row-card" key={`timeline-${project.slug}-${timelineIndex}`}>
                                <TextField label="Phase" value={item.phase} onChange={(value) => updateProjectCaseStudyTimeline(index, timelineIndex, { phase: value })} />
                                <TextField label="Title" value={item.title} onChange={(value) => updateProjectCaseStudyTimeline(index, timelineIndex, { title: value })} />
                                <TextAreaField label="Text" value={item.text} rows={3} onChange={(value) => updateProjectCaseStudyTimeline(index, timelineIndex, { text: value })} />
                                <button type="button" className="danger" onClick={() => removeProjectCaseStudyTimeline(index, timelineIndex)}>Delete timeline step</button>
                              </div>
                            ))}
                          </div>
                          <div className="admin-subsection-head with-gap"><strong>Story blocks</strong></div>
                          <div className="admin-grid two">
                            <TextAreaField label="Context" value={project.caseStudy.context} rows={3} onChange={(value) => updateProjectCaseStudy(index, { context: value })} />
                            <TextAreaField label="Problem" value={project.caseStudy.problem} rows={3} onChange={(value) => updateProjectCaseStudy(index, { problem: value })} />
                            <LineListField label="My responsibilities" value={project.caseStudy.responsibilities} onChange={(value) => updateProjectCaseStudy(index, { responsibilities: value })} />
                            <LineListField label="Stakeholders" value={project.caseStudy.stakeholders} onChange={(value) => updateProjectCaseStudy(index, { stakeholders: value })} />
                            <LineListField label="Process" value={project.caseStudy.process} onChange={(value) => updateProjectCaseStudy(index, { process: value })} />
                            <LineListField label="Challenges" value={project.caseStudy.challenges} onChange={(value) => updateProjectCaseStudy(index, { challenges: value })} />
                            <TextAreaField label="Solution" value={project.caseStudy.solution} rows={3} onChange={(value) => updateProjectCaseStudy(index, { solution: value })} />
                            <TextAreaField label="Result" value={project.caseStudy.result} rows={3} onChange={(value) => updateProjectCaseStudy(index, { result: value })} />
                            <LineListField label="Impact / outcomes" value={project.caseStudy.impact} onChange={(value) => updateProjectCaseStudy(index, { impact: value })} />
                            <LineListField label="Competencies shown" value={project.caseStudy.competencies} onChange={(value) => updateProjectCaseStudy(index, { competencies: value })} />
                            <LineListField label="Lessons" value={project.caseStudy.lessons} onChange={(value) => updateProjectCaseStudy(index, { lessons: value })} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="admin-grid two">
                          <TextField label="VI Title" value={getViText(["projects", project.slug, "title"])} placeholder={project.title} onChange={(value) => updateViTranslation(["projects", project.slug, "title"], value)} />
                          <TextField label="VI Year" value={getViText(["projects", project.slug, "year"])} placeholder={project.year} onChange={(value) => updateViTranslation(["projects", project.slug, "year"], value)} />
                          <TextField label="VI Role" value={getViText(["projects", project.slug, "role"])} placeholder={project.role} onChange={(value) => updateViTranslation(["projects", project.slug, "role"], value)} />
                          <TextAreaField label="VI Summary" value={getViText(["projects", project.slug, "summary"])} rows={4} onChange={(value) => updateViTranslation(["projects", project.slug, "summary"], value)} />
                          <LineListField label="VI Contributions" value={getViList(["projects", project.slug, "contributions"])} onChange={(value) => updateViTranslation(["projects", project.slug, "contributions"], value)} />
                          <LineListField label="VI Technologies / tags" value={getViList(["projects", project.slug, "technologies"])} onChange={(value) => updateViTranslation(["projects", project.slug, "technologies"], value)} />
                        </div>
                        <div className="admin-nested-card vi-card">
                          <h4>Case study — Tiếng Việt</h4>
                          <div className="admin-subsection-head">
                            <strong>VI Overview metrics</strong>
                            <small>Nhập bản dịch theo từng metric đang có ở English gốc.</small>
                          </div>
                          <div className="admin-stack compact-stack">
                            {project.caseStudy.overview.map((item, overviewIndex) => (
                              <div className="admin-grid three admin-row-card" key={`vi-overview-${project.slug}-${overviewIndex}`}>
                                <TextField label="VI Label" value={getViText(["projects", project.slug, "caseStudy", "overview", overviewIndex, "label"])} placeholder={item.label} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "overview", overviewIndex, "label"], value)} />
                                <TextField label="VI Value" value={getViText(["projects", project.slug, "caseStudy", "overview", overviewIndex, "value"])} placeholder={item.value} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "overview", overviewIndex, "value"], value)} />
                                <TextField label="VI Detail" value={getViText(["projects", project.slug, "caseStudy", "overview", overviewIndex, "detail"])} placeholder={item.detail ?? ""} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "overview", overviewIndex, "detail"], value)} />
                              </div>
                            ))}
                          </div>
                          <div className="admin-subsection-head with-gap">
                            <strong>VI Delivery timeline</strong>
                            <small>Thêm/xóa timeline step ở English gốc, sau đó nhập bản dịch tại đây.</small>
                          </div>
                          <div className="admin-stack compact-stack">
                            {project.caseStudy.timeline.map((item, timelineIndex) => (
                              <div className="admin-grid three admin-row-card" key={`vi-timeline-${project.slug}-${timelineIndex}`}>
                                <TextField label="VI Phase" value={getViText(["projects", project.slug, "caseStudy", "timeline", timelineIndex, "phase"])} placeholder={item.phase} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "timeline", timelineIndex, "phase"], value)} />
                                <TextField label="VI Title" value={getViText(["projects", project.slug, "caseStudy", "timeline", timelineIndex, "title"])} placeholder={item.title} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "timeline", timelineIndex, "title"], value)} />
                                <TextAreaField label="VI Text" value={getViText(["projects", project.slug, "caseStudy", "timeline", timelineIndex, "text"])} rows={3} placeholder={item.text} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "timeline", timelineIndex, "text"], value)} />
                              </div>
                            ))}
                          </div>
                          <div className="admin-subsection-head with-gap"><strong>VI Story blocks</strong></div>
                          <div className="admin-grid two">
                            <TextAreaField label="VI Context" value={getViText(["projects", project.slug, "caseStudy", "context"])} rows={3} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "context"], value)} />
                            <TextAreaField label="VI Problem" value={getViText(["projects", project.slug, "caseStudy", "problem"])} rows={3} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "problem"], value)} />
                            <LineListField label="VI My responsibilities" value={getViList(["projects", project.slug, "caseStudy", "responsibilities"])} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "responsibilities"], value)} />
                            <LineListField label="VI Stakeholders" value={getViList(["projects", project.slug, "caseStudy", "stakeholders"])} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "stakeholders"], value)} />
                            <LineListField label="VI Process" value={getViList(["projects", project.slug, "caseStudy", "process"])} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "process"], value)} />
                            <LineListField label="VI Challenges" value={getViList(["projects", project.slug, "caseStudy", "challenges"])} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "challenges"], value)} />
                            <TextAreaField label="VI Solution" value={getViText(["projects", project.slug, "caseStudy", "solution"])} rows={3} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "solution"], value)} />
                            <TextAreaField label="VI Result" value={getViText(["projects", project.slug, "caseStudy", "result"])} rows={3} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "result"], value)} />
                            <LineListField label="VI Impact / outcomes" value={getViList(["projects", project.slug, "caseStudy", "impact"])} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "impact"], value)} />
                            <LineListField label="VI Competencies shown" value={getViList(["projects", project.slug, "caseStudy", "competencies"])} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "competencies"], value)} />
                            <LineListField label="VI Lessons" value={getViList(["projects", project.slug, "caseStudy", "lessons"])} onChange={(value) => updateViTranslation(["projects", project.slug, "caseStudy", "lessons"], value)} />
                          </div>
                        </div>
                      </>
                    )}
                  </article>
                ))}
                {!isVietnameseEditor ? (
                  <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, projects: [...current.projects, emptyProject()] }))}>+ Add project</button>
                ) : (
                  <p className="admin-empty-note">Để thêm/xóa project hoặc chỉnh slug/category/featured, tắt Tiếng Việt và chỉnh ở English gốc.</p>
                )}
              </div>
            </AdminSection>
          )}

          {activeTab === "skills" && (
            <AdminSection
              title={isVietnameseEditor ? "Skill groups — Tiếng Việt" : "Skill groups"}
              description={isVietnameseEditor ? "Nhập tên nhóm kỹ năng và danh sách kỹ năng tiếng Việt. Thêm/xóa nhóm vẫn thực hiện ở English gốc." : "Group skills by capability instead of using star ratings or percentages."}
            >
              <div className="admin-stack">
                {draft.skillGroups.map((group, index) => {
                  const viKey = skillGroupTranslationKey(group);
                  return (
                    <article className="admin-editor-card compact" key={`${group.title}-${index}`}>
                      <div className="admin-card-head">
                        <div>
                          <h3>{isVietnameseEditor ? getViText(["skillGroups", viKey, "title"]) || group.title : group.title}</h3>
                          {isVietnameseEditor && <small>English source: {group.title}</small>}
                        </div>
                        {!isVietnameseEditor && (
                          <ItemActions
                            onMoveUp={() => moveSkillGroup(index, -1)}
                            onMoveDown={() => moveSkillGroup(index, 1)}
                            onDuplicate={() => duplicateSkillGroup(index)}
                            onRemove={() => removeSkillGroup(index)}
                            disableMoveUp={index === 0}
                            disableMoveDown={index === draft.skillGroups.length - 1}
                          />
                        )}
                      </div>
                      {!isVietnameseEditor ? (
                        <div className="admin-grid two">
                          <TextField label="Group title" value={group.title} onChange={(value) => updateSkillGroup(index, { title: value })} />
                          <LineListField label="Skills" value={group.skills} onChange={(value) => updateSkillGroup(index, { skills: value })} rows={4} />
                        </div>
                      ) : (
                        <div className="admin-grid two">
                          <TextField label="VI Group title" value={getViText(["skillGroups", viKey, "title"])} placeholder={group.title} onChange={(value) => updateViTranslation(["skillGroups", viKey, "title"], value)} />
                          <LineListField label="VI Skills" value={getViList(["skillGroups", viKey, "skills"])} onChange={(value) => updateViTranslation(["skillGroups", viKey, "skills"], value)} rows={4} />
                        </div>
                      )}
                    </article>
                  );
                })}
                {!isVietnameseEditor ? (
                  <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, skillGroups: [...current.skillGroups, emptySkillGroup()] }))}>+ Add skill group</button>
                ) : (
                  <p className="admin-empty-note">Để thêm hoặc xóa nhóm kỹ năng, tắt Tiếng Việt và chỉnh ở English gốc.</p>
                )}
              </div>
            </AdminSection>
          )}

          {activeTab === "credentials" && (
            <AdminSection
              title={isVietnameseEditor ? "Credentials & contact — Tiếng Việt" : "Credentials & contact"}
              description={isVietnameseEditor ? "Nhập bản dịch tiếng Việt cho học vấn, chứng chỉ và nội dung liên hệ. Email, href và social URL vẫn dùng dữ liệu gốc." : "Add real education, certifications and social links when available."}
            >
              {!isVietnameseEditor ? (
                <>
                  <div className="admin-nested-card">
                    <h3>Education</h3>
                    <div className="admin-stack compact-stack">
                      {draft.education.map((item, index) => (
                        <div className="admin-grid two admin-row-card" key={`${item.degree}-${index}`}>
                          <TextField label="Period" value={item.period} onChange={(value) => updateEducation(index, { period: value })} />
                          <TextField label="Institution" value={item.institution} onChange={(value) => updateEducation(index, { institution: value })} />
                          <TextField label="Degree" value={item.degree} onChange={(value) => updateEducation(index, { degree: value })} />
                          <TextField label="Note" value={item.note ?? ""} onChange={(value) => updateEducation(index, { note: value })} />
                          <ItemActions
                            onMoveUp={() => moveEducation(index, -1)}
                            onMoveDown={() => moveEducation(index, 1)}
                            onDuplicate={() => duplicateEducation(index)}
                            onRemove={() => removeEducation(index)}
                            disableMoveUp={index === 0}
                            disableMoveDown={index === draft.education.length - 1}
                            removeLabel="Delete education"
                          />
                        </div>
                      ))}
                      <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, education: [...current.education, { period: "2026", institution: "Institution", degree: "Degree / Program", note: "" }] }))}>+ Add education</button>
                    </div>
                  </div>

                  <div className="admin-nested-card">
                    <h3>Certifications</h3>
                    <div className="admin-stack compact-stack">
                      {draft.certifications.map((item, index) => (
                        <div className="admin-grid two admin-row-card" key={`${item.name}-${index}`}>
                          <TextField label="Year" value={item.year} onChange={(value) => updateCertification(index, { year: value })} />
                          <TextField label="Name" value={item.name} onChange={(value) => updateCertification(index, { name: value })} />
                          <TextField label="Issuer" value={item.issuer} onChange={(value) => updateCertification(index, { issuer: value })} />
                          <TextField label="Credential URL" value={item.credentialUrl ?? ""} onChange={(value) => updateCertification(index, { credentialUrl: value })} />
                          <ItemActions
                            onMoveUp={() => moveCertification(index, -1)}
                            onMoveDown={() => moveCertification(index, 1)}
                            onDuplicate={() => duplicateCertification(index)}
                            onRemove={() => removeCertification(index)}
                            disableMoveUp={index === 0}
                            disableMoveDown={index === draft.certifications.length - 1}
                            removeLabel="Delete certification"
                          />
                        </div>
                      ))}
                      <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, certifications: [...current.certifications, { year: "2026", name: "Certification", issuer: "Issuer", credentialUrl: "" }] }))}>+ Add certification</button>
                    </div>
                  </div>

                  <div className="admin-nested-card">
                    <h3>Contact & social</h3>
                    <div className="admin-grid two">
                      <TextField label="Contact title" value={draft.contact.title} onChange={(value) => setDraft((current) => ({ ...current, contact: { ...current.contact, title: value } }))} />
                      <TextField label="Contact subtitle" value={draft.contact.subtitle} onChange={(value) => setDraft((current) => ({ ...current, contact: { ...current.contact, subtitle: value } }))} />
                      <TextAreaField label="Contact description" value={draft.contact.description} rows={4} onChange={(value) => setDraft((current) => ({ ...current, contact: { ...current.contact, description: value } }))} />
                      <TextAreaField label="Response note" value={draft.contact.responseNote} rows={3} onChange={(value) => setDraft((current) => ({ ...current, contact: { ...current.contact, responseNote: value } }))} />
                      <LineListField label="Preferred topics" value={draft.contact.preferredTopics} onChange={(value) => setDraft((current) => ({ ...current, contact: { ...current.contact, preferredTopics: value } }))} />
                      <TextField label="LinkedIn URL" value={draft.social.linkedin} onChange={(value) => setDraft((current) => ({ ...current, social: { ...current.social, linkedin: value } }))} />
                      <TextField label="GitHub URL" value={draft.social.github} onChange={(value) => setDraft((current) => ({ ...current, social: { ...current.social, github: value } }))} />
                    </div>
                    <h4>Contact method cards</h4>
                    <div className="admin-stack compact-stack">
                      {draft.contact.methods.map((method, index) => (
                        <div className="admin-grid two admin-row-card" key={`${method.label}-${index}`}>
                          <TextField label="Label" value={method.label} onChange={(value) => updateContactMethod(index, { label: value })} />
                          <TextField label="Value" value={method.value} onChange={(value) => updateContactMethod(index, { value })} />
                          <TextField label="Href" value={method.href} onChange={(value) => updateContactMethod(index, { href: value })} />
                          <TextAreaField label="Description" value={method.description} rows={3} onChange={(value) => updateContactMethod(index, { description: value })} />
                          <ItemActions
                            onMoveUp={() => moveContactMethod(index, -1)}
                            onMoveDown={() => moveContactMethod(index, 1)}
                            onDuplicate={() => duplicateContactMethod(index)}
                            onRemove={() => removeContactMethod(index)}
                            disableMoveUp={index === 0}
                            disableMoveDown={index === draft.contact.methods.length - 1}
                            removeLabel="Delete contact"
                          />
                        </div>
                      ))}
                      <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, contact: { ...current.contact, methods: [...current.contact.methods, { label: "New contact", value: "Value", href: "#", description: "Contact description" }] } }))}>+ Add contact method</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="admin-nested-card vi-card">
                    <h3>Education — Tiếng Việt</h3>
                    <div className="admin-stack compact-stack">
                      {draft.education.length === 0 && <p className="admin-empty-note">Chưa có Education ở dữ liệu gốc. Tắt Tiếng Việt để thêm Education trước.</p>}
                      {draft.education.map((item, index) => {
                        const viKey = educationTranslationKey(item);
                        return (
                          <div className="admin-grid two admin-row-card" key={`vi-education-${viKey}-${index}`}>
                            <TextField label="VI Period" value={getViText(["education", viKey, "period"])} placeholder={item.period} onChange={(value) => updateViTranslation(["education", viKey, "period"], value)} />
                            <TextField label="VI Institution" value={getViText(["education", viKey, "institution"])} placeholder={item.institution} onChange={(value) => updateViTranslation(["education", viKey, "institution"], value)} />
                            <TextField label="VI Degree" value={getViText(["education", viKey, "degree"])} placeholder={item.degree} onChange={(value) => updateViTranslation(["education", viKey, "degree"], value)} />
                            <TextField label="VI Note" value={getViText(["education", viKey, "note"])} placeholder={item.note ?? ""} onChange={(value) => updateViTranslation(["education", viKey, "note"], value)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="admin-nested-card vi-card">
                    <h3>Certifications — Tiếng Việt</h3>
                    <div className="admin-stack compact-stack">
                      {draft.certifications.length === 0 && <p className="admin-empty-note">Chưa có Certifications ở dữ liệu gốc. Tắt Tiếng Việt để thêm Certification trước.</p>}
                      {draft.certifications.map((item, index) => {
                        const viKey = certificationTranslationKey(item);
                        return (
                          <div className="admin-grid two admin-row-card" key={`vi-cert-${viKey}-${index}`}>
                            <TextField label="VI Year" value={getViText(["certifications", viKey, "year"])} placeholder={item.year} onChange={(value) => updateViTranslation(["certifications", viKey, "year"], value)} />
                            <TextField label="VI Name" value={getViText(["certifications", viKey, "name"])} placeholder={item.name} onChange={(value) => updateViTranslation(["certifications", viKey, "name"], value)} />
                            <TextField label="VI Issuer" value={getViText(["certifications", viKey, "issuer"])} placeholder={item.issuer} onChange={(value) => updateViTranslation(["certifications", viKey, "issuer"], value)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="admin-nested-card vi-card">
                    <h3>Contact content — Tiếng Việt</h3>
                    <div className="admin-grid two">
                      <TextField label="VI Contact title" value={getViText(["contact", "title"])} placeholder={draft.contact.title} onChange={(value) => updateViTranslation(["contact", "title"], value)} />
                      <TextField label="VI Contact subtitle" value={getViText(["contact", "subtitle"])} placeholder={draft.contact.subtitle} onChange={(value) => updateViTranslation(["contact", "subtitle"], value)} />
                      <TextAreaField label="VI Contact description" value={getViText(["contact", "description"])} rows={4} onChange={(value) => updateViTranslation(["contact", "description"], value)} />
                      <TextAreaField label="VI Response note" value={getViText(["contact", "responseNote"])} rows={3} onChange={(value) => updateViTranslation(["contact", "responseNote"], value)} />
                      <LineListField label="VI Preferred topics" value={getViList(["contact", "preferredTopics"])} onChange={(value) => updateViTranslation(["contact", "preferredTopics"], value)} />
                    </div>
                    <h4>Contact method cards — Tiếng Việt</h4>
                    <div className="admin-stack compact-stack">
                      {draft.contact.methods.map((method, index) => {
                        const viKey = contactMethodTranslationKey(method);
                        return (
                          <div className="admin-grid two admin-row-card" key={`vi-contact-${viKey}-${index}`}>
                            <TextField label="VI Label" value={getViText(["contact", "methods", viKey, "label"])} placeholder={method.label} onChange={(value) => updateViTranslation(["contact", "methods", viKey, "label"], value)} />
                            <TextField label="VI Value" value={getViText(["contact", "methods", viKey, "value"])} placeholder={method.value} onChange={(value) => updateViTranslation(["contact", "methods", viKey, "value"], value)} />
                            <TextAreaField label="VI Description" value={getViText(["contact", "methods", viKey, "description"])} rows={3} onChange={(value) => updateViTranslation(["contact", "methods", viKey, "description"], value)} />
                            <div className="admin-translation-reference small"><strong>Global href</strong><span>{method.href}</span></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </AdminSection>
          )}


          {activeTab === "blog" && (
            <AdminSection
              title={isVietnameseEditor ? "Blog / Notes — Tiếng Việt" : "Blog / Notes"}
              description={isVietnameseEditor ? "Nhập bản dịch tiếng Việt cho bài viết. Slug, ngày đăng, trạng thái, featured và cover URL vẫn dùng dữ liệu gốc English." : "Create professional notes for /blog and /blog/[slug]. Only Published posts are visible on public pages."}
            >
              <div className="admin-stack">
                {draft.blog.map((post, index) => {
                  const viKey = blogTranslationKey(post);
                  return (
                    <article className="admin-editor-card" key={`${post.slug}-${index}`}>
                      <div className="admin-card-head">
                        <div>
                          <h3>{isVietnameseEditor ? getViText(["blog", viKey, "title"]) || post.title : post.title}</h3>
                          <small>{post.slug} · {post.status} · {post.date}</small>
                        </div>
                        {!isVietnameseEditor && (
                          <ItemActions
                            onMoveUp={() => moveBlog(index, -1)}
                            onMoveDown={() => moveBlog(index, 1)}
                            onDuplicate={() => duplicateBlog(index)}
                            onRemove={() => removeBlog(index)}
                            disableMoveUp={index === 0}
                            disableMoveDown={index === draft.blog.length - 1}
                          />
                        )}
                      </div>

                      {!isVietnameseEditor ? (
                        <>
                          <div className="admin-grid two">
                            <TextField label="Title" value={post.title} onChange={(value) => updateBlog(index, { title: value })} />
                            <TextField label="Slug" value={post.slug} onChange={(value) => updateBlog(index, { slug: slugify(value) })} />
                            <TextField label="Date" value={post.date} onChange={(value) => updateBlog(index, { date: value })} placeholder="YYYY-MM-DD" />
                            <BlogStatusField value={post.status} onChange={(value) => updateBlog(index, { status: value })} />
                            <label className="admin-check-field">
                              <input type="checkbox" checked={Boolean(post.featured)} onChange={(event) => updateBlog(index, { featured: event.target.checked })} />
                              <span>Featured note</span>
                            </label>
                            <LineListField label="Tags" value={post.tags} onChange={(value) => updateBlog(index, { tags: value })} rows={4} />
                            <TextAreaField label="Summary" value={post.summary} rows={4} onChange={(value) => updateBlog(index, { summary: value })} />
                            <LineListField label="Content paragraphs" value={post.content} rows={10} onChange={(value) => updateBlog(index, { content: value })} />
                          </div>
                          <div className="admin-nested-card">
                            <h4>Cover media</h4>
                            <div className="admin-grid two">
                              <div>
                                <TextField label="Cover image URL" value={post.coverImageUrl ?? ""} onChange={(value) => updateBlog(index, { coverImageUrl: value })} placeholder="Google Drive share link or https://..." />
                                <GoogleDriveHelp url={post.coverImageUrl} />
                              </div>
                              <TextField label="Cover image alt text" value={post.coverImageAlt ?? ""} onChange={(value) => updateBlog(index, { coverImageAlt: value })} />
                              <AdminImagePreview
                                url={post.coverImageUrl}
                                alt={post.coverImageAlt || post.title}
                                fallback={post.title.slice(0, 2).toUpperCase()}
                                note="Optional cover image for blog list, blog detail and social preview."
                                small
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="admin-translation-reference">
                            <strong>English reference</strong>
                            <span>{post.title} · {post.summary}</span>
                            <small>Slug, date, status, featured and cover URL remain controlled from English source mode.</small>
                          </div>
                          <div className="admin-grid two">
                            <TextField label="VI Title" value={getViText(["blog", viKey, "title"])} placeholder={post.title} onChange={(value) => updateViTranslation(["blog", viKey, "title"], value)} />
                            <TextField label="VI Date label" value={getViText(["blog", viKey, "date"])} placeholder={post.date} onChange={(value) => updateViTranslation(["blog", viKey, "date"], value)} />
                            <TextAreaField label="VI Summary" value={getViText(["blog", viKey, "summary"])} rows={4} onChange={(value) => updateViTranslation(["blog", viKey, "summary"], value)} />
                            <LineListField label="VI Tags" value={getViList(["blog", viKey, "tags"])} onChange={(value) => updateViTranslation(["blog", viKey, "tags"], value)} rows={4} />
                            <LineListField label="VI Content paragraphs" value={getViList(["blog", viKey, "content"])} onChange={(value) => updateViTranslation(["blog", viKey, "content"], value)} rows={10} />
                            <TextField label="VI Cover image alt" value={getViText(["blog", viKey, "coverImageAlt"])} placeholder={post.coverImageAlt ?? post.title} onChange={(value) => updateViTranslation(["blog", viKey, "coverImageAlt"], value)} />
                          </div>
                        </>
                      )}
                    </article>
                  );
                })}
                {!isVietnameseEditor ? (
                  <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, blog: [...current.blog, emptyBlogPost()] }))}>+ Add blog note</button>
                ) : (
                  <p className="admin-empty-note">Để thêm/xóa bài viết hoặc chỉnh slug/status/featured, tắt Tiếng Việt và chỉnh ở English gốc.</p>
                )}
              </div>
            </AdminSection>
          )}

          {activeTab === "analytics" && (
            <AdminSection title="Analytics & visitor insights" description="Track public page views, project views, contact clicks and resume actions from Supabase events.">
              <div className="admin-analytics-toolbar">
                <p>{analyticsMessage}</p>
                <button type="button" onClick={() => loadAnalytics()} disabled={loadingAnalytics}>
                  {loadingAnalytics ? "Refreshing..." : "Refresh analytics"}
                </button>
              </div>

              <div className="admin-analytics-grid">
                <article><span>Total events</span><strong>{analytics?.totalEvents ?? 0}</strong><small>{analytics?.range ?? "Waiting for data"}</small></article>
                <article><span>Today</span><strong>{analytics?.todayEvents ?? 0}</strong><small>UTC-based day count</small></article>
                <article><span>Page views</span><strong>{analytics?.pageViews ?? 0}</strong><small>Home, resume, contact and public pages</small></article>
                <article><span>CTA clicks</span><strong>{analytics?.ctaClicks ?? 0}</strong><small>Tracked buttons and links</small></article>
                <article><span>Project views</span><strong>{analytics?.projectViews ?? 0}</strong><small>Case-study detail pages</small></article>
                <article><span>Resume actions</span><strong>{analytics?.resumeDownloads ?? 0}</strong><small>Print / Save PDF clicks</small></article>
              </div>

              <div className="admin-analytics-columns">
                <div className="admin-nested-card">
                  <h3>Top pages</h3>
                  <div className="admin-mini-list">
                    {(analytics?.topPages.length ? analytics.topPages : [{ path: "No page views yet", count: 0 }]).map((item) => (
                      <div key={item.path}><span>{item.path}</span><strong>{item.count}</strong></div>
                    ))}
                  </div>
                </div>
                <div className="admin-nested-card">
                  <h3>Top CTA clicks</h3>
                  <div className="admin-mini-list">
                    {(analytics?.topCtas.length ? analytics.topCtas : [{ label: "No CTA clicks yet", count: 0 }]).map((item) => (
                      <div key={item.label}><span>{item.label}</span><strong>{item.count}</strong></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="admin-nested-card">
                <h3>Recent events</h3>
                <div className="admin-event-table">
                  <div className="head"><span>Event</span><span>Path</span><span>Label</span><span>Time</span></div>
                  {(analytics?.recentEvents.length ? analytics.recentEvents : []).map((event) => (
                    <div key={`${event.eventType}-${event.path}-${event.createdAt}`}>
                      <span>{event.eventType}</span>
                      <span>{event.path}</span>
                      <span>{event.label}</span>
                      <span>{new Date(event.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                  {!analytics?.recentEvents.length && <p>No analytics events yet. Visit the public portfolio after deploy, then refresh this tab.</p>}
                </div>
              </div>
            </AdminSection>
          )}

          {activeTab === "export" && (
            <AdminSection title="Export backup" description="V1.7.0 adds Career Case Study Pro blocks, sticky compact admin editing header and stronger case-study storytelling controls.">
              <div className="admin-export-actions">
                <button type="button" className="primary" onClick={saveLiveProfile}>Save live to Supabase</button>
                <button type="button" onClick={copyProfileSource}>Copy profile.ts</button>
                <button type="button" onClick={downloadJson}>Download JSON</button>
                <button type="button" onClick={saveDraft}>Save browser draft</button>
              </div>
              <textarea className="admin-code-output" readOnly value={generatedSource} rows={24} />
            </AdminSection>
          )}
        </div>
      </div>
    </main>
  );
}
