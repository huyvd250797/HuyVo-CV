"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { profile, type ProjectCategory } from "@/data/profile";
import { appVersion } from "@/data/version";

type AdminTab = "profile" | "experience" | "projects" | "skills" | "credentials" | "export";

type HighlightDraft = { label: string; value: string };
type ExperienceDraft = {
  period: string;
  role: string;
  organization: string;
  summary: string;
  responsibilities: string[];
  tags: string[];
};
type ProjectCaseStudyDraft = {
  context: string;
  problem: string;
  process: string[];
  solution: string;
  result: string;
  lessons: string[];
};
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
  caseStudy: ProjectCaseStudyDraft;
};
type SkillGroupDraft = { title: string; skills: string[] };
type EducationDraft = { period: string; institution: string; degree: string; note?: string };
type CertificationDraft = { year: string; name: string; issuer: string; credentialUrl?: string };
type ContactMethodDraft = { label: string; value: string; href: string; description: string };

type AdminProfileDraft = {
  name: string;
  shortName: string;
  role: string;
  headline: string;
  description: string;
  location: string;
  email: string;
  availability: string;
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
  contact: {
    title: string;
    subtitle: string;
    description: string;
    responseNote: string;
    preferredTopics: string[];
    methods: ContactMethodDraft[];
  };
  social: { linkedin: string; github: string };
};

const storageKey = "huyvo-portfolio-admin-draft-v090";
const sessionKey = "huyvo-portfolio-admin-unlocked-v090";
const fallbackPassword = "huyvo-admin";

const tabs: Array<{ id: AdminTab; label: string; description: string }> = [
  { id: "profile", label: "Profile", description: "Core identity, headline, about and contact basics." },
  { id: "experience", label: "Experience", description: "Career timeline and responsibilities." },
  { id: "projects", label: "Projects", description: "Portfolio cards and case study content." },
  { id: "skills", label: "Skills", description: "Skill groups used across portfolio and resume." },
  { id: "credentials", label: "Credentials", description: "Education, certifications and contact channels." },
  { id: "export", label: "Export", description: "Copy the generated profile config back into the source." },
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
    projects: profile.projects.map((project) => ({
      ...project,
      contributions: [...project.contributions],
      technologies: [...project.technologies],
      caseStudy: {
        ...project.caseStudy,
        process: [...project.caseStudy.process],
        lessons: [...project.caseStudy.lessons],
      },
    })),
    skillGroups: profile.skillGroups.map((group) => ({ title: group.title, skills: [...group.skills] })),
    education: profile.education.map((item) => ({ ...item })),
    certifications: profile.certifications.map((item) => ({ ...item })),
    workingProcess: profile.workingProcess.map((item) => ({ ...item })),
    contact: {
      title: profile.contact.title,
      subtitle: profile.contact.subtitle,
      description: profile.contact.description,
      responseNote: profile.contact.responseNote,
      preferredTopics: [...profile.contact.preferredTopics],
      methods: profile.contact.methods.map((item) => ({ ...item })),
    },
    social: { ...profile.social },
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
    caseStudy: {
      context: "Where the work started.",
      problem: "What needed to be solved.",
      process: ["Understand context", "Analyze requirements", "Design solution", "Validate outcome"],
      solution: "How the solution took shape.",
      result: "What improved after the project.",
      lessons: ["What you learned", "What you would improve next"],
    },
  };
}

function emptySkillGroup(): SkillGroupDraft {
  return { title: "New Skill Group", skills: ["Skill one", "Skill two"] };
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
  return `export type ProjectCategory = "Professional" | "Product" | "Tool";\n\nexport const profile = ${body} as const;\n`;
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
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="admin-field admin-field-wide">
      <span>{label}</span>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
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
  return (
    <TextAreaField
      label={label}
      value={joinLines(value)}
      rows={rows}
      hint="Mỗi dòng là một mục. Dòng trống sẽ được bỏ qua."
      onChange={(text) => onChange(splitLines(text))}
    />
  );
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

export function AdminDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("profile");
  const [draft, setDraft] = useState<AdminProfileDraft>(() => createDraftFromProfile());
  const [message, setMessage] = useState("Ready");

  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || fallbackPassword;
  const generatedSource = useMemo(() => buildProfileSource(draft), [draft]);
  const activeTabInfo = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      const session = window.sessionStorage.getItem(sessionKey);
      if (saved) {
        setDraft(JSON.parse(saved) as AdminProfileDraft);
        setMessage("Loaded browser draft");
      }
      if (session === "true") {
        setUnlocked(true);
      }
    } catch {
      setMessage("Could not load saved draft");
    }
  }, []);

  function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.trim() === expectedPassword) {
      setUnlocked(true);
      window.sessionStorage.setItem(sessionKey, "true");
      setMessage("Admin unlocked");
      return;
    }
    setMessage("Wrong password. Check NEXT_PUBLIC_ADMIN_PASSWORD or use the local fallback.");
  }

  function saveDraft() {
    window.localStorage.setItem(storageKey, JSON.stringify(draft, null, 2));
    setMessage("Draft saved to this browser");
  }

  function resetDraft() {
    window.localStorage.removeItem(storageKey);
    setDraft(createDraftFromProfile());
    setMessage("Draft reset to source data");
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

  if (!unlocked) {
    return (
      <main className="admin-page admin-login-page">
        <div className="admin-login-card">
          <a className="admin-back" href="/">← Back to portfolio</a>
          <div className="admin-badge">{appVersion.label} · Admin Lite</div>
          <h1>Portfolio CMS / Admin</h1>
          <p>
            This first CMS version protects the editor screen with a simple client-side password and saves drafts in your browser.
            It does not change the live website until you copy the exported config back into <code>src/data/profile.ts</code> and redeploy.
          </p>
          <form onSubmit={handleUnlock} className="admin-login-form">
            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                autoFocus
                placeholder="Enter admin password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button type="submit">Unlock admin</button>
          </form>
          <small>Set <code>NEXT_PUBLIC_ADMIN_PASSWORD</code> on Vercel. Local fallback: <code>{fallbackPassword}</code>.</small>
          <div className="admin-message">{message}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div>
          <a className="admin-back" href="/">← Portfolio</a>
          <h1>Portfolio CMS / Admin</h1>
          <p>{appVersion.label} · {appVersion.name}</p>
        </div>
        <div className="admin-actions">
          <button type="button" onClick={saveDraft}>Save draft</button>
          <button type="button" onClick={downloadJson}>Download JSON</button>
          <button type="button" className="primary" onClick={copyProfileSource}>Copy profile.ts</button>
        </div>
      </header>

      <div className="admin-status">
        <span>{message}</span>
        <button type="button" onClick={resetDraft}>Reset to source data</button>
      </div>

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
          <div className="admin-current-tab">
            <span>Editing</span>
            <h2>{activeTabInfo.label}</h2>
            <p>{activeTabInfo.description}</p>
          </div>

          {activeTab === "profile" && (
            <AdminSection title="Profile basics" description="Update the information that appears in Hero, About, Resume, SEO and Contact sections.">
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
              <div className="admin-nested-card">
                <h3>Career summary</h3>
                <div className="admin-grid two">
                  <TextField label="Summary title" value={draft.careerSummary.title} onChange={(value) => setDraft((current) => ({ ...current, careerSummary: { ...current.careerSummary, title: value } }))} />
                  <TextAreaField label="Summary text" value={draft.careerSummary.text} rows={4} onChange={(value) => setDraft((current) => ({ ...current, careerSummary: { ...current.careerSummary, text: value } }))} />
                </div>
                <div className="admin-mini-grid">
                  {draft.careerSummary.highlights.map((item, index) => (
                    <div className="admin-inline-pair" key={`${item.label}-${index}`}>
                      <input value={item.label} onChange={(event) => setDraft((current) => ({ ...current, careerSummary: { ...current.careerSummary, highlights: current.careerSummary.highlights.map((highlight, highlightIndex) => highlightIndex === index ? { ...highlight, label: event.target.value } : highlight) } }))} />
                      <input value={item.value} onChange={(event) => setDraft((current) => ({ ...current, careerSummary: { ...current.careerSummary, highlights: current.careerSummary.highlights.map((highlight, highlightIndex) => highlightIndex === index ? { ...highlight, value: event.target.value } : highlight) } }))} />
                    </div>
                  ))}
                </div>
              </div>
            </AdminSection>
          )}

          {activeTab === "experience" && (
            <AdminSection title="Experience timeline" description="Each item becomes one timeline entry on the portfolio and one resume block.">
              <div className="admin-stack">
                {draft.experience.map((item, index) => (
                  <article className="admin-editor-card" key={`${item.role}-${index}`}>
                    <div className="admin-card-head">
                      <h3>{item.role || `Experience ${index + 1}`}</h3>
                      <button type="button" onClick={() => setDraft((current) => ({ ...current, experience: current.experience.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</button>
                    </div>
                    <div className="admin-grid two">
                      <TextField label="Period" value={item.period} onChange={(value) => updateExperience(index, { period: value })} />
                      <TextField label="Role" value={item.role} onChange={(value) => updateExperience(index, { role: value })} />
                      <TextField label="Organization" value={item.organization} onChange={(value) => updateExperience(index, { organization: value })} />
                      <TextAreaField label="Summary" value={item.summary} rows={3} onChange={(value) => updateExperience(index, { summary: value })} />
                      <LineListField label="Responsibilities" value={item.responsibilities} onChange={(value) => updateExperience(index, { responsibilities: value })} />
                      <LineListField label="Tags" value={item.tags} onChange={(value) => updateExperience(index, { tags: value })} rows={4} />
                    </div>
                  </article>
                ))}
                <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, experience: [...current.experience, emptyExperience()] }))}>+ Add experience</button>
              </div>
            </AdminSection>
          )}

          {activeTab === "projects" && (
            <AdminSection title="Project portfolio" description="Manage project cards and the case-study content used by /projects/[slug].">
              <div className="admin-stack">
                {draft.projects.map((project, index) => (
                  <article className="admin-editor-card" key={`${project.slug}-${index}`}>
                    <div className="admin-card-head">
                      <h3>{project.title || `Project ${index + 1}`}</h3>
                      <div>
                        <button type="button" onClick={() => updateProject(index, { slug: slugify(project.title) })}>Auto slug</button>
                        <button type="button" onClick={() => setDraft((current) => ({ ...current, projects: current.projects.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</button>
                      </div>
                    </div>
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
                      <div className="admin-grid two">
                        <TextAreaField label="Context" value={project.caseStudy.context} rows={3} onChange={(value) => updateProjectCaseStudy(index, { context: value })} />
                        <TextAreaField label="Problem" value={project.caseStudy.problem} rows={3} onChange={(value) => updateProjectCaseStudy(index, { problem: value })} />
                        <LineListField label="Process" value={project.caseStudy.process} onChange={(value) => updateProjectCaseStudy(index, { process: value })} />
                        <LineListField label="Lessons" value={project.caseStudy.lessons} onChange={(value) => updateProjectCaseStudy(index, { lessons: value })} />
                        <TextAreaField label="Solution" value={project.caseStudy.solution} rows={3} onChange={(value) => updateProjectCaseStudy(index, { solution: value })} />
                        <TextAreaField label="Result" value={project.caseStudy.result} rows={3} onChange={(value) => updateProjectCaseStudy(index, { result: value })} />
                      </div>
                    </div>
                  </article>
                ))}
                <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, projects: [...current.projects, emptyProject()] }))}>+ Add project</button>
              </div>
            </AdminSection>
          )}

          {activeTab === "skills" && (
            <AdminSection title="Skill groups" description="Group skills by capability instead of using star ratings or percentages.">
              <div className="admin-stack">
                {draft.skillGroups.map((group, index) => (
                  <article className="admin-editor-card compact" key={`${group.title}-${index}`}>
                    <div className="admin-card-head">
                      <h3>{group.title}</h3>
                      <button type="button" onClick={() => setDraft((current) => ({ ...current, skillGroups: current.skillGroups.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</button>
                    </div>
                    <div className="admin-grid two">
                      <TextField label="Group title" value={group.title} onChange={(value) => updateSkillGroup(index, { title: value })} />
                      <LineListField label="Skills" value={group.skills} onChange={(value) => updateSkillGroup(index, { skills: value })} rows={4} />
                    </div>
                  </article>
                ))}
                <button type="button" className="admin-add-button" onClick={() => setDraft((current) => ({ ...current, skillGroups: [...current.skillGroups, emptySkillGroup()] }))}>+ Add skill group</button>
              </div>
            </AdminSection>
          )}

          {activeTab === "credentials" && (
            <AdminSection title="Credentials & contact" description="Add real education, certifications and social links when available.">
              <div className="admin-nested-card">
                <h3>Education</h3>
                <div className="admin-stack compact-stack">
                  {draft.education.map((item, index) => (
                    <div className="admin-grid two admin-row-card" key={`${item.degree}-${index}`}>
                      <TextField label="Period" value={item.period} onChange={(value) => updateEducation(index, { period: value })} />
                      <TextField label="Institution" value={item.institution} onChange={(value) => updateEducation(index, { institution: value })} />
                      <TextField label="Degree" value={item.degree} onChange={(value) => updateEducation(index, { degree: value })} />
                      <TextField label="Note" value={item.note ?? ""} onChange={(value) => updateEducation(index, { note: value })} />
                      <button type="button" onClick={() => setDraft((current) => ({ ...current, education: current.education.filter((_, itemIndex) => itemIndex !== index) }))}>Remove education</button>
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
                      <button type="button" onClick={() => setDraft((current) => ({ ...current, certifications: current.certifications.filter((_, itemIndex) => itemIndex !== index) }))}>Remove certification</button>
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
                    </div>
                  ))}
                </div>
              </div>
            </AdminSection>
          )}

          {activeTab === "export" && (
            <AdminSection title="Export config" description="This CMS Lite version edits a browser draft. Copy this code into src/data/profile.ts and redeploy to publish it.">
              <div className="admin-export-actions">
                <button type="button" className="primary" onClick={copyProfileSource}>Copy profile.ts</button>
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
