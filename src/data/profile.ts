export type ProjectCategory = "Professional" | "Product" | "Tool";

export const profile = {
  name: "Huy Vo",
  shortName: "HV",
  role: "Project Manager & Functional Consultant",
  headline: "I turn business requirements into practical software solutions.",
  description:
    "Focused on software implementation, business analysis, workflow design and delivery for education management systems.",
  location: "Ho Chi Minh City, Vietnam",
  email: "hello@example.com",
  availability: "Open to professional connections",
  specialties: [
    "Project Management",
    "Functional Consulting",
    "Business Analysis",
    "SQL & Data",
  ],
  about: [
    "I work at the intersection of business operations and software delivery, translating real-world requirements into clear workflows and executable product decisions.",
    "My approach prioritizes practical solutions, structured communication, data validation and close coordination between customers, product, development and testing teams.",
  ],
  careerSummary: {
    title: "Professional snapshot",
    text: "Project-focused professional working across requirements, business processes, data and software delivery. I help teams turn operational needs into structured solutions that can be built, validated and deployed.",
    highlights: [
      { label: "Primary role", value: "PM / Functional Consultant" },
      { label: "Domain focus", value: "Education Technology" },
      { label: "Core strength", value: "Business → Software" },
      { label: "Working style", value: "Structured & Practical" },
    ],
  },
  experience: [
    {
      period: "Current",
      role: "Project Manager / Functional Consultant",
      organization: "Education Software & University Management",
      summary:
        "Coordinate software implementation while translating business requirements into functional workflows, specifications and delivery decisions.",
      responsibilities: [
        "Analyze requirements, operational processes and implementation constraints.",
        "Coordinate customers, product, development, testing and support stakeholders.",
        "Support functional specification, UAT, data validation and production rollout.",
        "Track delivery risks, clarify issues and drive practical resolution across teams.",
      ],
      tags: ["Project Management", "Requirements", "UAT", "SQL", "Deployment"],
    },
  ],
  projects: [
    {
      title: "University Management Platform",
      category: "Professional" as ProjectCategory,
      year: "Current",
      role: "Project Manager / Functional Consultant",
      summary:
        "Implementation and functional delivery for university management workflows, with a strong focus on requirements, data validation, UAT and stakeholder coordination.",
      contributions: [
        "Business process and requirement analysis",
        "Functional workflow and solution design",
        "UAT coordination and production rollout",
      ],
      technologies: ["Project Management", "SQL Server", "Jira", "UAT"],
      featured: true,
    },
    {
      title: "ASC-WORKING",
      category: "Product" as ProjectCategory,
      year: "2026",
      role: "Product Owner / Builder",
      summary:
        "A working-list and project workspace concept for managing issues, deadlines, project documents, filters and configurable work views.",
      contributions: [
        "Product planning and workflow design",
        "Issue-management UX and configurable views",
        "Document and attachment workflow planning",
      ],
      technologies: ["Next.js", "TypeScript", "Google Drive", "Product Design"],
      featured: true,
    },
    {
      title: "ASC GenScript",
      category: "Tool" as ProjectCategory,
      year: "2026",
      role: "Product Designer / Builder",
      summary:
        "A productivity tool for generating SQL scripts and explaining spreadsheet-style formulas through interactive grid workflows.",
      contributions: [
        "SQL generation workflow",
        "Spreadsheet-like interaction design",
        "Formula Helper and data simulation concepts",
      ],
      technologies: ["JavaScript", "SQL", "Spreadsheet UX", "Web App"],
      featured: true,
    },
    {
      title: "MarketScope",
      category: "Product" as ProjectCategory,
      year: "2026",
      role: "Product Designer / Builder",
      summary:
        "A spot-market analysis workspace for technical indicators, position analysis, portfolio risk and strategy profiles.",
      contributions: [
        "Analysis workflow and information architecture",
        "Spot position and portfolio-risk features",
        "Strategy profile product planning",
      ],
      technologies: ["Next.js", "Market Data", "Analytics", "Vercel"],
      featured: false,
    },
    {
      title: "MyShop",
      category: "Product" as ProjectCategory,
      year: "2026",
      role: "Product Designer / Builder",
      summary:
        "A hybrid commerce concept supporting product CMS, direct checkout, affiliate redirects, order administration and customer accounts.",
      contributions: [
        "Commerce flow and CMS planning",
        "Checkout and order-management design",
        "Affiliate and direct-sale hybrid workflow",
      ],
      technologies: ["Next.js", "TypeScript", "Database", "Vercel"],
      featured: false,
    },
    {
      title: "Family OS",
      category: "Product" as ProjectCategory,
      year: "2026",
      role: "Product Designer / Builder",
      summary:
        "A family operations workspace concept designed to centralize household information, routines and shared planning.",
      contributions: [
        "Product roadmap and modular structure",
        "Family-centered workflow design",
        "Production-ready architecture planning",
      ],
      technologies: ["Next.js", "Product Planning", "Responsive UI", "Vercel"],
      featured: false,
    },
  ],
  skillGroups: [
    {
      title: "Project & Business",
      skills: [
        "Project Management",
        "Functional Consulting",
        "Requirement Analysis",
        "Business Process Analysis",
        "Stakeholder Coordination",
        "UAT & Delivery",
      ],
    },
    {
      title: "Data & Validation",
      skills: ["SQL Server", "Data Validation", "Data Analysis", "Excel"],
    },
    {
      title: "Product & Technology",
      skills: ["JavaScript", "Next.js", "Git", "Vercel", "AI-assisted Development"],
    },
    {
      title: "Work Tools",
      skills: ["Jira", "GitHub", "VS Code", "Microsoft Office", "SQL Server"],
    },
  ],
  education: [] as Array<{
    period: string;
    institution: string;
    degree: string;
    note?: string;
  }>,
  certifications: [] as Array<{
    year: string;
    name: string;
    issuer: string;
    credentialUrl?: string;
  }>,
  workingProcess: [
    { index: "01", title: "Understand", text: "Clarify the business need, user context, constraints and measurable outcome." },
    { index: "02", title: "Analyze", text: "Break down processes, rules, dependencies, data and implementation risks." },
    { index: "03", title: "Design", text: "Translate findings into workflows, functional requirements and a practical solution." },
    { index: "04", title: "Coordinate", text: "Keep stakeholders aligned while development and testing move the solution forward." },
    { index: "05", title: "Validate", text: "Check functionality, data and real-world scenarios through review and UAT." },
    { index: "06", title: "Deliver", text: "Support rollout, resolve issues and improve the solution after implementation." },
  ],
  social: { linkedin: "#", github: "#" },
} as const;
