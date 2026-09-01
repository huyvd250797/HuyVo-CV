export type ProjectCategory = "Professional" | "Product" | "Tool";
export type MediaAssetType = "Image" | "Screenshot" | "Diagram" | "Document" | "Video" | "Link";
export type BlogStatus = "Draft" | "Published";

export type BrandMetric = { label: string; value: string; detail: string };
export type BrandPillar = { title: string; text: string };
export type PersonalBranding = {
  statement: string;
  signature: string;
  metrics: BrandMetric[];
  pillars: BrandPillar[];
  keywords: string[];
};

export type MediaAsset = {
  title: string;
  type: MediaAssetType;
  url: string;
  caption?: string;
  alt?: string;
};

export type ProfileMedia = {
  avatarUrl?: string;
  avatarAlt?: string;
  coverImageUrl?: string;
  resumeUrl?: string;
};

export type ProjectMedia = {
  icon?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  assets: MediaAsset[];
};

export type BlogPost = {
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
  personalBranding: {
    statement: "Practical delivery for complex business workflows.",
    signature: "I work best where business rules, data and product decisions need to become one clear delivery path.",
    metrics: [
      { label: "Focus", value: "PM / FC", detail: "Project delivery, functional consulting and stakeholder coordination." },
      { label: "Domain", value: "EdTech", detail: "University management, student workflows and operational systems." },
      { label: "Strength", value: "Bridge", detail: "Translate business context into software behaviors teams can build and test." },
    ],
    pillars: [
      { title: "Clear requirements", text: "I turn scattered discussions into structured workflows, acceptance points and implementation decisions." },
      { title: "Data-aware delivery", text: "I treat data validation as part of functional delivery, especially when workflows affect records and reports." },
      { title: "Practical product thinking", text: "I prefer usable, maintainable solutions that help teams move faster without adding unnecessary complexity." },
    ],
    keywords: ["Project delivery", "Functional analysis", "Business workflow", "Data validation", "UAT", "Product thinking"],
  } as PersonalBranding,
  media: {
    avatarUrl: "",
    avatarAlt: "Portrait photo of Huy Vo",
    coverImageUrl: "",
    resumeUrl: "",
  } as ProfileMedia,
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
      slug: "university-management-platform",
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
      media: {
        icon: "UM",
        thumbnailUrl: "",
        thumbnailAlt: "University management workflow preview",
        assets: [
          { title: "Workflow overview", type: "Diagram", url: "", caption: "Add a workflow diagram or sanitized screenshot when available.", alt: "University workflow diagram" },
        ],
      } as ProjectMedia,
      caseStudy: {
        context: "University management software involves many connected processes, stakeholder groups and operational rules that must work together in production.",
        problem: "Business requirements can become fragmented across discussions, data checks, UAT feedback and implementation constraints, increasing delivery risk if they are not translated into a shared functional view.",
        process: ["Clarify business rules and stakeholder expectations", "Map workflows, dependencies and data conditions", "Coordinate implementation, testing and issue resolution", "Validate real scenarios through UAT and rollout support"],
        solution: "Use structured functional analysis and cross-team coordination to turn operational requirements into workflows, testable behaviors and practical delivery decisions.",
        result: "A clearer bridge between business users and delivery teams, with stronger traceability from requirement analysis through validation and production rollout.",
        lessons: ["Clarify edge cases before development starts", "Treat data validation as part of functional delivery", "Keep business, development and testing aligned around the same workflow"],
      },
    },
    {
      title: "ASC-WORKING",
      slug: "asc-working",
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
      media: {
        icon: "AW",
        thumbnailUrl: "",
        thumbnailAlt: "ASC-WORKING project workspace preview",
        assets: [
          { title: "Workspace dashboard", type: "Screenshot", url: "", caption: "Add a screenshot of issue lists, filters or project document views.", alt: "ASC-WORKING dashboard screenshot" },
        ],
      } as ProjectMedia,
      caseStudy: {
        context: "Project work often spreads issues, deadlines, documents and operational views across multiple tools.",
        problem: "When work information is fragmented, it becomes harder to prioritize, filter, follow up and keep project context attached to the actual issue being handled.",
        process: ["Define the core issue-management workflow", "Design configurable list and filter experiences", "Plan attachment and project-document handling", "Iterate the product through versioned releases"],
        solution: "Create a configurable project workspace centered on issues, deadlines, views and supporting documents instead of forcing users into a fixed workflow.",
        result: "A product direction that consolidates day-to-day project operations into one focused workspace and can evolve module by module.",
        lessons: ["Configuration matters when teams work differently", "Fast filtering reduces operational friction", "Documents are most useful when connected to the work context"],
      },
    },
    {
      title: "ASC GenScript",
      slug: "asc-genscript",
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
      media: {
        icon: "GS",
        thumbnailUrl: "",
        thumbnailAlt: "ASC GenScript formula and SQL helper preview",
        assets: [
          { title: "Formula helper simulation", type: "Screenshot", url: "", caption: "Add a screenshot showing formula explanation or SQL generation output.", alt: "GenScript formula helper screenshot" },
        ],
      } as ProjectMedia,
      caseStudy: {
        context: "Repetitive SQL preparation and spreadsheet-style data manipulation can consume significant time during implementation and data-checking work.",
        problem: "Manual script composition is error-prone, while formula behavior can be difficult to explain when users only see the final result.",
        process: ["Identify repetitive SQL patterns", "Design spreadsheet-like grid interactions", "Build script-generation workflows", "Add interactive formula explanations and simulations"],
        solution: "Combine a fast data grid with guided SQL generation and visual formula explanations so common technical tasks require fewer manual steps.",
        result: "A reusable productivity-tool concept that makes script preparation and formula reasoning more accessible and repeatable.",
        lessons: ["Keyboard-first interaction matters for data-heavy work", "Generated output still needs transparent rules", "Visual simulation helps explain formulas better than static text"],
      },
    },
    {
      title: "MarketScope",
      slug: "marketscope",
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
      media: {
        icon: "MS",
        thumbnailUrl: "",
        thumbnailAlt: "MarketScope analysis workspace preview",
        assets: [] as MediaAsset[],
      } as ProjectMedia,
      caseStudy: {
        context: "Market analysis becomes difficult to act on when indicators, position information and risk views are separated.",
        problem: "Users need a clearer path from market data to spot-position decisions without mixing in futures-oriented workflows they do not use.",
        process: ["Structure indicator and market views", "Design spot entry and exit analysis", "Move position analysis into a dedicated module", "Add portfolio risk and strategy profiles"],
        solution: "Organize analysis around spot trading decisions, positions and portfolio risk with strategy profiles that make interpretation more consistent.",
        result: "A more focused analysis workspace with clearer separation between market overview, position management and strategy configuration.",
        lessons: ["Information architecture is as important as indicators", "User strategy should shape analysis output", "Avoid adding trading modes that do not match the intended user"],
      },
    },
    {
      title: "MyShop",
      slug: "myshop",
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
      media: {
        icon: "SH",
        thumbnailUrl: "",
        thumbnailAlt: "MyShop commerce interface preview",
        assets: [] as MediaAsset[],
      } as ProjectMedia,
      caseStudy: {
        context: "A small commerce site may need both direct ordering and affiliate redirection depending on the product.",
        problem: "A single checkout model does not fit every product, while administrators still need one coherent way to manage products and direct orders.",
        process: ["Design product catalog and CMS", "Add guest direct checkout", "Build order administration", "Introduce affiliate and customer-account flows"],
        solution: "Use a hybrid commerce model where each product can follow either direct checkout or affiliate navigation while sharing the same storefront experience.",
        result: "A flexible product and order flow that supports different selling models without splitting the storefront into separate applications.",
        lessons: ["Commerce flows should be configurable per product", "Guest checkout reduces friction", "Admin workflows need to stay simple as customer features grow"],
      },
    },
    {
      title: "Family OS",
      slug: "family-os",
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
      media: {
        icon: "FO",
        thumbnailUrl: "",
        thumbnailAlt: "Family OS household workspace preview",
        assets: [] as MediaAsset[],
      } as ProjectMedia,
      caseStudy: {
        context: "Family information, routines and shared planning are often spread across notes, messages and separate apps.",
        problem: "Fragmentation makes it harder for a household to maintain one shared operational view without introducing unnecessary complexity.",
        process: ["Define a modular family workspace", "Prioritize an MVP roadmap", "Design responsive household workflows", "Plan the path from prototype to production-ready release"],
        solution: "Create a Family OS concept that centralizes shared planning and household information through focused modules that can be introduced progressively.",
        result: "A scalable product roadmap with a clear MVP foundation instead of attempting to build every family function at once.",
        lessons: ["Start from recurring household needs", "Keep modules independently useful", "Version discipline helps prevent scope confusion"],
      },
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
  blog: [
    {
      title: "How I approach software implementation projects",
      slug: "software-implementation-approach",
      date: "2026-09-01",
      status: "Published" as BlogStatus,
      featured: true,
      tags: ["Project Management", "Functional Consulting", "Software Implementation"],
      summary: "A practical note about turning unclear business needs into structured software delivery steps.",
      content: [
        "Successful implementation work starts before development. The most important step is turning business context into a shared understanding that customers, product, development and testing teams can use.",
        "My approach is to clarify the real operational problem, map the workflow, identify data conditions, document edge cases and keep stakeholders aligned around testable behavior instead of vague expectations.",
        "This makes delivery easier to validate during UAT and reduces the gap between what users expect and what the system actually does in production.",
      ],
      coverImageUrl: "",
      coverImageAlt: "Software implementation planning note",
    },
    {
      title: "Why data validation matters in UAT",
      slug: "data-validation-in-uat",
      date: "2026-09-01",
      status: "Published" as BlogStatus,
      featured: false,
      tags: ["UAT", "Data Validation", "SQL"],
      summary: "A short note on treating data validation as part of functional delivery, not a separate afterthought.",
      content: [
        "UAT is not only about clicking through screens. In many software implementation projects, real confidence comes from checking whether the data behind the workflow is consistent, complete and aligned with business rules.",
        "When data validation is built into the functional delivery process, teams can detect mismatched rules, missing scenarios and rollout risks earlier.",
        "For education management systems, this is especially important because a small data issue can affect reports, student records, registration flows or downstream operational decisions.",
      ],
      coverImageUrl: "",
      coverImageAlt: "Data validation in UAT note",
    },
  ],
  contact: {
    title: "Let's build something useful.",
    subtitle: "Have a project, role or idea to discuss?",
    description:
      "Send a short message with the context, goal and timeline. This form opens your email app, so no backend or database is required for this version.",
    responseNote: "Replace placeholder email and social links in src/data/profile.ts before publishing.",
    preferredTopics: [
      "Project opportunity",
      "Functional consulting",
      "Software implementation",
      "Product collaboration",
    ],
    methods: [
      {
        label: "Email",
        value: "hello@example.com",
        href: "mailto:hello@example.com",
        description: "Best for project briefs, role discussions and direct collaboration.",
      },
      {
        label: "LinkedIn",
        value: "Professional network",
        href: "#",
        description: "Use this for professional connection and background review.",
      },
      {
        label: "GitHub",
        value: "Product & source work",
        href: "#",
        description: "Browse product experiments, web apps and technical work.",
      },
    ],
  },
  translations: {
    vi: {
      role: "Project Manager & Functional Consultant",
      headline: "Tôi chuyển hóa yêu cầu nghiệp vụ thành giải pháp phần mềm thực tế.",
      description: "Tập trung vào triển khai phần mềm, phân tích nghiệp vụ, thiết kế quy trình và bàn giao giải pháp cho hệ thống quản trị giáo dục.",
      availability: "Sẵn sàng kết nối chuyên môn",
      location: "TP. Hồ Chí Minh, Việt Nam",
      personalBranding: {
        statement: "Triển khai thực tế cho các workflow nghiệp vụ phức tạp.",
        signature: "Tôi phù hợp với những bài toán cần biến quy tắc nghiệp vụ, dữ liệu và quyết định sản phẩm thành một lộ trình triển khai rõ ràng.",
        metrics: [
          { label: "Trọng tâm", value: "PM / FC", detail: "Quản lý triển khai, tư vấn chức năng và phối hợp các bên liên quan." },
          { label: "Lĩnh vực", value: "EdTech", detail: "Quản trị trường đại học, quy trình sinh viên và hệ thống vận hành." },
          { label: "Thế mạnh", value: "Cầu nối", detail: "Chuyển bối cảnh nghiệp vụ thành hành vi phần mềm có thể xây dựng và kiểm thử." },
        ],
        pillars: [
          { title: "Yêu cầu rõ ràng", text: "Chuyển các trao đổi rời rạc thành workflow, điểm nghiệm thu và quyết định triển khai có cấu trúc." },
          { title: "Triển khai gắn với dữ liệu", text: "Xem kiểm tra dữ liệu là một phần của bàn giao chức năng, nhất là khi workflow ảnh hưởng hồ sơ và báo cáo." },
          { title: "Tư duy sản phẩm thực tế", text: "Ưu tiên giải pháp dùng được, dễ bảo trì và giúp đội nhóm làm nhanh hơn mà không tăng độ phức tạp không cần thiết." },
        ],
        keywords: ["Triển khai dự án", "Phân tích chức năng", "Workflow nghiệp vụ", "Kiểm tra dữ liệu", "UAT", "Tư duy sản phẩm"],
      },
      specialties: ["Quản lý dự án", "Tư vấn chức năng", "Phân tích nghiệp vụ", "SQL & Dữ liệu"],
      about: [
        "Tôi làm việc ở điểm giao giữa vận hành nghiệp vụ và triển khai phần mềm, chuyển các yêu cầu thực tế thành quy trình rõ ràng và quyết định sản phẩm có thể thực thi.",
        "Cách làm của tôi ưu tiên giải pháp thực tế, giao tiếp có cấu trúc, kiểm tra dữ liệu và phối hợp chặt chẽ giữa khách hàng, sản phẩm, phát triển và kiểm thử.",
      ],
      careerSummary: {
        title: "Tổng quan chuyên môn",
        text: "Chuyên môn định hướng dự án, làm việc trên yêu cầu, quy trình nghiệp vụ, dữ liệu và triển khai phần mềm. Tôi hỗ trợ đội nhóm chuyển nhu cầu vận hành thành giải pháp có cấu trúc, có thể xây dựng, kiểm thử và đưa vào sử dụng.",
        highlights: [
          { label: "Vai trò chính", value: "PM / Functional Consultant" },
          { label: "Lĩnh vực", value: "Công nghệ giáo dục" },
          { label: "Thế mạnh", value: "Nghiệp vụ → Phần mềm" },
          { label: "Phong cách", value: "Có cấu trúc & thực tế" },
        ],
      },
      experience: {
        "Education Software & University Management|Project Manager / Functional Consultant": {
          organization: "Phần mềm giáo dục & quản trị trường đại học",
          summary: "Phối hợp triển khai phần mềm, đồng thời chuyển hóa yêu cầu nghiệp vụ thành quy trình chức năng, đặc tả và quyết định triển khai.",
          responsibilities: [
            "Phân tích yêu cầu, quy trình vận hành và ràng buộc triển khai.",
            "Phối hợp khách hàng, sản phẩm, phát triển, kiểm thử và hỗ trợ.",
            "Hỗ trợ đặc tả chức năng, UAT, kiểm tra dữ liệu và golive.",
            "Theo dõi rủi ro, làm rõ vấn đề và thúc đẩy hướng xử lý thực tế giữa các bên.",
          ],
          tags: ["Quản lý dự án", "Yêu cầu", "UAT", "SQL", "Triển khai"],
        },
      },
      projects: {
        "university-management-platform": {
          title: "Nền tảng quản trị trường đại học",
          role: "Project Manager / Functional Consultant",
          summary: "Triển khai và bàn giao chức năng cho các quy trình quản trị trường đại học, tập trung vào yêu cầu, kiểm tra dữ liệu, UAT và phối hợp các bên liên quan.",
          contributions: ["Phân tích quy trình và yêu cầu nghiệp vụ", "Thiết kế workflow và giải pháp chức năng", "Phối hợp UAT và hỗ trợ golive"],
          technologies: ["Quản lý dự án", "SQL Server", "Jira", "UAT"],
          media: { thumbnailAlt: "Minh họa workflow quản trị trường đại học" },
          caseStudy: {
            context: "Phần mềm quản trị trường đại học có nhiều quy trình liên kết, nhiều nhóm người dùng và nhiều quy tắc vận hành cần hoạt động ổn định khi đưa vào production.",
            problem: "Yêu cầu nghiệp vụ dễ bị rời rạc giữa trao đổi, kiểm tra dữ liệu, phản hồi UAT và ràng buộc triển khai, làm tăng rủi ro nếu không được chuẩn hóa thành một góc nhìn chức năng chung.",
            process: ["Làm rõ quy tắc nghiệp vụ và kỳ vọng của các bên", "Map workflow, phụ thuộc và điều kiện dữ liệu", "Phối hợp triển khai, kiểm thử và xử lý vấn đề", "Xác thực tình huống thực tế qua UAT và golive"],
            solution: "Sử dụng phân tích chức năng có cấu trúc và phối hợp liên nhóm để chuyển yêu cầu vận hành thành workflow, hành vi có thể kiểm thử và quyết định triển khai thực tế.",
            result: "Tạo cầu nối rõ hơn giữa người dùng nghiệp vụ và đội triển khai, với khả năng truy vết tốt hơn từ phân tích yêu cầu đến kiểm thử và vận hành.",
            lessons: ["Làm rõ edge case trước khi phát triển", "Xem kiểm tra dữ liệu là một phần của bàn giao chức năng", "Giữ nghiệp vụ, phát triển và kiểm thử cùng nhìn một workflow"],
          },
        },
        "asc-working": {
          title: "ASC-WORKING",
          role: "Product Owner / Builder",
          summary: "Ý tưởng workspace quản lý công việc và dự án, hỗ trợ issue, deadline, tài liệu, bộ lọc và các view cấu hình được.",
          contributions: ["Lập kế hoạch sản phẩm và thiết kế workflow", "Thiết kế UX quản lý issue và view cấu hình", "Lập kế hoạch tài liệu và file đính kèm"],
          caseStudy: {
            context: "Công việc dự án thường phân tán giữa issue, deadline, tài liệu và các góc nhìn vận hành khác nhau.",
            problem: "Khi thông tin bị rời rạc, việc ưu tiên, lọc, theo dõi và giữ ngữ cảnh cho từng issue trở nên khó hơn.",
            process: ["Xác định workflow quản lý issue cốt lõi", "Thiết kế trải nghiệm danh sách và bộ lọc cấu hình", "Lập kế hoạch xử lý tài liệu và file đính kèm", "Lặp lại sản phẩm theo từng phiên bản"],
            solution: "Xây dựng workspace dự án có thể cấu hình quanh issue, deadline, view và tài liệu hỗ trợ thay vì ép người dùng vào một workflow cố định.",
            result: "Định hướng sản phẩm giúp gom hoạt động dự án hằng ngày vào một workspace tập trung và có thể mở rộng theo module.",
            lessons: ["Cấu hình quan trọng khi các nhóm làm việc khác nhau", "Lọc nhanh giúp giảm ma sát vận hành", "Tài liệu hữu ích nhất khi gắn với đúng ngữ cảnh công việc"],
          },
        },
        "asc-genscript": {
          title: "ASC GenScript",
          role: "Product Designer / Builder",
          summary: "Công cụ năng suất hỗ trợ tạo SQL script và giải thích công thức kiểu spreadsheet qua workflow dạng grid tương tác.",
          contributions: ["Thiết kế workflow tạo SQL", "Thiết kế tương tác dạng spreadsheet", "Xây dựng ý tưởng Formula Helper và mô phỏng dữ liệu"],
          caseStudy: {
            context: "Các thao tác chuẩn bị SQL và xử lý dữ liệu kiểu spreadsheet lặp lại nhiều lần trong công việc triển khai và kiểm tra dữ liệu.",
            problem: "Viết script thủ công dễ sai, trong khi công thức chỉ nhìn kết quả cuối thường khó giải thích cho người dùng.",
            process: ["Nhận diện các mẫu SQL lặp lại", "Thiết kế tương tác grid giống spreadsheet", "Xây workflow sinh script", "Thêm mô phỏng và giải thích công thức"],
            solution: "Kết hợp grid nhập liệu nhanh với sinh SQL có hướng dẫn và giải thích công thức trực quan để giảm thao tác thủ công.",
            result: "Một ý tưởng công cụ tái sử dụng giúp việc chuẩn bị script và giải thích công thức dễ hiểu, minh bạch và lặp lại được.",
            lessons: ["Tương tác bàn phím rất quan trọng với dữ liệu lớn", "Output tự sinh vẫn cần quy tắc rõ ràng", "Mô phỏng trực quan giải thích công thức tốt hơn văn bản tĩnh"],
          },
        },
      },
      skillGroups: {
        "Project & Business": { title: "Dự án & Nghiệp vụ", skills: ["Quản lý dự án", "Tư vấn chức năng", "Phân tích yêu cầu", "Phân tích quy trình nghiệp vụ", "Phối hợp các bên", "UAT & bàn giao"] },
        "Data & Validation": { title: "Dữ liệu & Kiểm tra", skills: ["SQL Server", "Kiểm tra dữ liệu", "Phân tích dữ liệu", "Excel"] },
        "Product & Technology": { title: "Sản phẩm & Công nghệ", skills: ["JavaScript", "Next.js", "Git", "Vercel", "AI-assisted Development"] },
        "Work Tools": { title: "Công cụ làm việc", skills: ["Jira", "GitHub", "VS Code", "Microsoft Office", "SQL Server"] },
      },
      workingProcess: {
        "01": { title: "Hiểu vấn đề", text: "Làm rõ nhu cầu nghiệp vụ, bối cảnh người dùng, ràng buộc và kết quả cần đạt." },
        "02": { title: "Phân tích", text: "Tách nhỏ quy trình, quy tắc, phụ thuộc, dữ liệu và rủi ro triển khai." },
        "03": { title: "Thiết kế", text: "Chuyển kết quả phân tích thành workflow, yêu cầu chức năng và giải pháp thực tế." },
        "04": { title: "Phối hợp", text: "Giữ các bên liên quan đồng bộ trong quá trình phát triển và kiểm thử." },
        "05": { title: "Xác thực", text: "Kiểm tra chức năng, dữ liệu và tình huống thực tế thông qua review và UAT." },
        "06": { title: "Bàn giao", text: "Hỗ trợ golive, xử lý vấn đề và cải tiến giải pháp sau triển khai." },
      },
      blog: {
        "software-implementation-approach": {
          title: "Cách tôi tiếp cận dự án triển khai phần mềm",
          summary: "Một ghi chú thực tế về cách chuyển nhu cầu nghiệp vụ chưa rõ thành các bước triển khai phần mềm có cấu trúc.",
          tags: ["Quản lý dự án", "Tư vấn chức năng", "Triển khai phần mềm"],
          content: [
            "Triển khai thành công bắt đầu trước khi phát triển. Bước quan trọng nhất là chuyển bối cảnh nghiệp vụ thành một cách hiểu chung mà khách hàng, sản phẩm, phát triển và kiểm thử đều có thể sử dụng.",
            "Cách làm của tôi là làm rõ vấn đề vận hành thật, map workflow, xác định điều kiện dữ liệu, ghi nhận edge case và giữ các bên cùng nhìn vào hành vi có thể kiểm thử thay vì kỳ vọng mơ hồ.",
            "Cách này giúp việc bàn giao dễ xác thực hơn trong UAT và giảm khoảng cách giữa điều người dùng kỳ vọng với cách hệ thống vận hành thật trên production.",
          ],
          coverImageAlt: "Ghi chú về lập kế hoạch triển khai phần mềm",
        },
        "data-validation-in-uat": {
          title: "Vì sao kiểm tra dữ liệu quan trọng trong UAT",
          summary: "Một ghi chú ngắn về việc xem kiểm tra dữ liệu là một phần của bàn giao chức năng, không phải việc xử lý sau cùng.",
          tags: ["UAT", "Kiểm tra dữ liệu", "SQL"],
          content: [
            "UAT không chỉ là bấm qua các màn hình. Trong nhiều dự án triển khai phần mềm, sự tự tin thật sự đến từ việc kiểm tra dữ liệu phía sau workflow có nhất quán, đầy đủ và đúng quy tắc nghiệp vụ hay không.",
            "Khi kiểm tra dữ liệu được đưa vào quy trình bàn giao chức năng, đội dự án có thể phát hiện lệch quy tắc, thiếu tình huống và rủi ro golive sớm hơn.",
            "Với hệ thống quản trị giáo dục, điều này đặc biệt quan trọng vì một lỗi dữ liệu nhỏ có thể ảnh hưởng báo cáo, hồ sơ sinh viên, luồng đăng ký hoặc quyết định vận hành phía sau.",
          ],
          coverImageAlt: "Ghi chú về kiểm tra dữ liệu trong UAT",
        },
      },
      contact: {
        title: "Cùng xây dựng điều gì đó hữu ích.",
        subtitle: "Bạn có dự án, vai trò hoặc ý tưởng muốn trao đổi?",
        description: "Gửi thông tin ngắn về bối cảnh, mục tiêu và thời gian. Form này mở ứng dụng email nên không cần backend hoặc database.",
        responseNote: "Hãy thay email và social link placeholder trong Admin trước khi public.",
        preferredTopics: ["Cơ hội dự án", "Tư vấn chức năng", "Triển khai phần mềm", "Hợp tác sản phẩm"],
        methods: {
          "Email": { label: "Email", description: "Phù hợp cho brief dự án, trao đổi vai trò và hợp tác trực tiếp." },
          "LinkedIn": { label: "LinkedIn", value: "Mạng lưới chuyên môn", description: "Dùng để kết nối chuyên môn và xem thông tin nền." },
          "GitHub": { label: "GitHub", value: "Sản phẩm & mã nguồn", description: "Xem thử nghiệm sản phẩm, web app và công việc kỹ thuật." },
        },
      },
    },
  },
  social: { linkedin: "#", github: "#" },
} as const;

export type PortfolioProfile = typeof profile;
