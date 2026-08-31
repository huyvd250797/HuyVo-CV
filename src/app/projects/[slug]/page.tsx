import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { profile } from "@/data/profile";

export function generateStaticParams() {
  return profile.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = profile.projects.find((item) => item.slug === slug);
  return project
    ? { title: `${project.title} | ${profile.name}`, description: project.summary }
    : {};
}

export default async function ProjectCaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = profile.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const study = project.caseStudy;

  return (
    <main className="case-study-page">
      <div className="case-nav container">
        <Link href="/#projects" className="case-back">← Back to projects</Link>
        <span>{profile.shortName}<i>.</i></span>
      </div>

      <header className="case-hero">
        <div className="container">
          <div className="case-eyebrow">
            <span>{project.category}</span><span>{project.year}</span><span>Case Study</span>
          </div>
          <h1>{project.title}</h1>
          <p className="case-role">{project.role}</p>
          <p className="case-lead">{project.summary}</p>
          <div className="project-tags case-tags">
            {project.technologies.map((technology) => <span key={technology}>{technology}</span>)}
          </div>
        </div>
      </header>

      <section className="case-section">
        <div className="container case-two-col">
          <div><p className="section-kicker">01 — Context</p><h2>Where the work started.</h2></div>
          <p className="case-copy">{study.context}</p>
        </div>
      </section>

      <section className="case-section case-alt">
        <div className="container case-two-col">
          <div><p className="section-kicker">02 — Problem</p><h2>What needed to be solved.</h2></div>
          <p className="case-copy">{study.problem}</p>
        </div>
      </section>

      <section className="case-section">
        <div className="container">
          <p className="section-kicker">03 — My contribution</p>
          <div className="case-contribution-grid">
            {project.contributions.map((item, index) => (
              <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section case-dark">
        <div className="container">
          <p className="section-kicker">04 — Process</p>
          <h2>A structured path from need to delivery.</h2>
          <div className="case-process-grid">
            {study.process.map((item, index) => (
              <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section">
        <div className="container case-two-col">
          <div><p className="section-kicker">05 — Solution</p><h2>How the solution took shape.</h2></div>
          <p className="case-copy">{study.solution}</p>
        </div>
      </section>

      <section className="case-section case-alt">
        <div className="container case-two-col">
          <div><p className="section-kicker">06 — Result</p><h2>What improved.</h2></div>
          <p className="case-copy">{study.result}</p>
        </div>
      </section>

      <section className="case-section">
        <div className="container">
          <p className="section-kicker">07 — Lessons learned</p>
          <div className="case-lessons">
            {study.lessons.map((lesson, index) => <div key={lesson}><span>{String(index + 1).padStart(2, "0")}</span><p>{lesson}</p></div>)}
          </div>
          <div className="case-next"><Link href="/#projects">Explore other projects ↗</Link></div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
