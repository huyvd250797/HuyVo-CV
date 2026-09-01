import type { PortfolioProfile } from "@/data/profile";

export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value?: string | null): value is Locale {
  return value === "en" || value === "vi";
}

export function getLocale(value?: string | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function localePrefix(locale: Locale) {
  return `/${locale}`;
}

export function localizedPath(locale: Locale, path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${localePrefix(locale)}${normalized === "/" ? "" : normalized}`;
}

export function stripLocaleFromPath(pathname: string) {
  const stripped = pathname.replace(/^\/(en|vi)(?=\/|$)/, "");
  return stripped || "/";
}

export function switchLocalePath(locale: Locale, pathname: string) {
  return localizedPath(locale, stripLocaleFromPath(pathname));
}

export const uiCopy = {
  en: {
    languageName: "English",
    nav: {
      about: "About",
      experience: "Experience",
      projects: "Projects",
      skills: "Skills",
      process: "Process",
      resume: "Resume",
      blog: "Blog",
      contact: "Let's talk",
    },
    hero: {
      hello: "Hello, I'm",
      explore: "Explore profile",
      contact: "Contact me",
      downloadCv: "Download CV",
      portfolio: "Portfolio",
      profileCard: "Professional profile card",
      profileCode: "PROFILE / 001",
      focus: "Professional focus",
    },
    sections: {
      about: "About",
      aboutTitle: "Connecting business context with software execution.",
      summary: "Career summary",
      summaryTitle: "Business context.\nStructured execution.",
      experience: "Experience",
      experienceTitle: "Where strategy meets delivery.",
      experienceDescription: "Selected professional experience focused on software implementation, functional analysis and cross-team execution.",
      selectedWork: "Selected work",
      projectsTitle: "Projects that connect business, product and delivery.",
      projectsDescription: "A curated mix of professional implementation work and products built to solve practical operating problems.",
      skills: "Skills",
      skillsTitle: "Capabilities that support practical delivery.",
      skillsDescription: "A focused mix of business, data, product and implementation skills used across project work.",
      credentials: "Credentials",
      credentialsTitle: "Education and certifications.",
      credentialsDescription: "Add verified credentials when available. Empty sections are hidden to keep the CV clean.",
      process: "Process",
      processTitle: "How I move work from unclear to usable.",
      processDescription: "A practical six-step process for keeping complex implementation work clear, aligned and deliverable.",
      blog: "Blog / Notes",
      blogTitle: "Notes on project delivery, systems and practical work.",
      blogDescription: "Short professional notes about implementation, business analysis, data validation and product thinking.",
      contact: "Contact",
    },
    projects: {
      filterLabel: "Filter projects",
      all: "All",
      professional: "Professional",
      product: "Product",
      tool: "Tool",
      featured: "Featured",
      asset: "asset",
      assets: "assets",
      showing: "Showing",
      project: "project",
      projects: "projects",
      contribution: "Contribution",
      viewCaseStudy: "View case study",
    },
    blog: {
      back: "← Back to blog",
      readAll: "Read all notes",
      latest: "Latest notes",
      featured: "Featured",
      published: "Published",
      draft: "Draft",
      readMore: "Read note",
      emptyTitle: "No published notes yet.",
      emptyDescription: "Create and publish blog notes from the Admin Blog / Notes tab.",
      allPostsTitle: "Blog / Notes",
      allPostsDescription: "Selected notes on software implementation, project delivery, business analysis and practical product work.",
      contentLabel: "Professional note",
    },
    contact: {
      profileStatus: "Profile status",
      panelLabel: "Send a message",
      quickMessage: "Quick message",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@company.com",
      topic: "Topic",
      message: "Message",
      messagePlaceholder: "Short context, goal, timeline or opportunity details...",
      openDraft: "Open email draft",
      opened: "Your email app should open with a prepared message.",
      noBackend: "No backend required — this creates a mailto draft.",
      notProvided: "Not provided",
      fallbackTopic: "General message",
      subjectPrefix: "Portfolio contact",
      bodyMessageFallback: "Please add your message here.",
    },
    resume: {
      back: "← Back to portfolio",
      title: "Professional Resume",
      summary: "Professional Summary",
      experience: "Experience",
      projects: "Selected Projects",
      skills: "Skills",
      education: "Education",
      certifications: "Certifications",
      downloadFile: "Download CV file",
      print: "Print / Save PDF",
    },
    caseStudy: {
      back: "← Back to projects",
      label: "Case Study",
      projectPreview: "Project preview",
      mediaKicker: "Media — Project assets",
      mediaTitle: "Visual evidence for the project story.",
      mediaDescription: "Add sanitized screenshots, diagrams, workflow images or public documents from the Admin Media tab.",
      preview: "Preview",
      thumbnail: "Project thumbnail",
      primaryVisual: "Primary project visual.",
      context: "Context",
      contextTitle: "Where the work started.",
      problem: "Problem",
      problemTitle: "What needed to be solved.",
      contribution: "My contribution",
      process: "Process",
      processTitle: "A structured path from need to delivery.",
      solution: "Solution",
      solutionTitle: "How the solution took shape.",
      result: "Result",
      resultTitle: "What improved.",
      lessons: "Lessons learned",
      exploreOther: "Explore other projects",
    },
    production: {
      kicker: "Production release",
      title: "is ready for public portfolio use.",
      description: "The portfolio now has CMS-backed content, analytics-ready events, SEO metadata, project case studies, resume output and media support.",
      items: [
        { title: "CMS data", text: "Public pages can read live profile content from Supabase with source fallback." },
        { title: "Resume output", text: "The resume page is print-ready and reuses the same portfolio data source." },
        { title: "Project stories", text: "Each selected project can expand into a structured case study." },
        { title: "Media ready", text: "Project thumbnails, galleries and Google Drive media links can be managed from Admin." },
      ],
    },
    notFound: {
      kicker: "404 — Not found",
      title: "Page not found.",
      description: "The page you opened does not exist or may have been moved during a portfolio version upgrade.",
      action: "Back to portfolio",
    },
    footer: {
      designed: "Designed for clarity. Built for the web.",
    },
  },
  vi: {
    languageName: "Tiếng Việt",
    nav: {
      about: "Giới thiệu",
      experience: "Kinh nghiệm",
      projects: "Dự án",
      skills: "Kỹ năng",
      process: "Quy trình",
      resume: "CV",
      blog: "Bài viết",
      contact: "Liên hệ",
    },
    hero: {
      hello: "Xin chào, tôi là",
      explore: "Xem hồ sơ",
      contact: "Liên hệ",
      downloadCv: "Tải CV",
      portfolio: "Portfolio",
      profileCard: "Thẻ hồ sơ chuyên nghiệp",
      profileCode: "HỒ SƠ / 001",
      focus: "Trọng tâm chuyên môn",
    },
    sections: {
      about: "Giới thiệu",
      aboutTitle: "Kết nối bối cảnh nghiệp vụ với triển khai phần mềm.",
      summary: "Tóm tắt nghề nghiệp",
      summaryTitle: "Bối cảnh nghiệp vụ.\nTriển khai có cấu trúc.",
      experience: "Kinh nghiệm",
      experienceTitle: "Nơi chiến lược gặp năng lực triển khai.",
      experienceDescription: "Kinh nghiệm tiêu biểu về triển khai phần mềm, phân tích chức năng và phối hợp liên phòng ban.",
      selectedWork: "Dự án tiêu biểu",
      projectsTitle: "Các dự án kết nối nghiệp vụ, sản phẩm và triển khai.",
      projectsDescription: "Tổng hợp các dự án triển khai thực tế và sản phẩm được xây dựng để giải quyết vấn đề vận hành.",
      skills: "Kỹ năng",
      skillsTitle: "Năng lực hỗ trợ triển khai thực tế.",
      skillsDescription: "Nhóm kỹ năng nghiệp vụ, dữ liệu, sản phẩm và triển khai được sử dụng trong công việc dự án.",
      credentials: "Học vấn & chứng chỉ",
      credentialsTitle: "Học vấn và chứng chỉ.",
      credentialsDescription: "Thêm thông tin xác thực khi có dữ liệu thật. Mục trống sẽ được ẩn để CV gọn gàng.",
      process: "Quy trình",
      processTitle: "Cách tôi biến yêu cầu chưa rõ thành giải pháp dùng được.",
      processDescription: "Quy trình 6 bước giúp công việc triển khai phức tạp trở nên rõ ràng, đồng bộ và có thể bàn giao.",
      blog: "Blog / Ghi chú",
      blogTitle: "Ghi chú về triển khai dự án, hệ thống và công việc thực tế.",
      blogDescription: "Các bài viết ngắn về triển khai phần mềm, phân tích nghiệp vụ, kiểm tra dữ liệu và tư duy sản phẩm.",
      contact: "Liên hệ",
    },
    projects: {
      filterLabel: "Lọc dự án",
      all: "Tất cả",
      professional: "Công việc",
      product: "Sản phẩm",
      tool: "Công cụ",
      featured: "Nổi bật",
      asset: "tài nguyên",
      assets: "tài nguyên",
      showing: "Đang hiển thị",
      project: "dự án",
      projects: "dự án",
      contribution: "Đóng góp",
      viewCaseStudy: "Xem case study",
    },
    blog: {
      back: "← Quay lại blog",
      readAll: "Xem tất cả ghi chú",
      latest: "Ghi chú mới",
      featured: "Nổi bật",
      published: "Đã đăng",
      draft: "Bản nháp",
      readMore: "Đọc ghi chú",
      emptyTitle: "Chưa có bài viết đã đăng.",
      emptyDescription: "Tạo và publish bài viết trong tab Blog / Notes của Admin.",
      allPostsTitle: "Blog / Ghi chú",
      allPostsDescription: "Các ghi chú về triển khai phần mềm, quản lý dự án, phân tích nghiệp vụ và tư duy sản phẩm thực tế.",
      contentLabel: "Ghi chú chuyên môn",
    },
    contact: {
      profileStatus: "Trạng thái hồ sơ",
      panelLabel: "Gửi tin nhắn",
      quickMessage: "Tin nhắn nhanh",
      name: "Họ tên",
      namePlaceholder: "Tên của bạn",
      email: "Email",
      emailPlaceholder: "ban@congty.com",
      topic: "Chủ đề",
      message: "Nội dung",
      messagePlaceholder: "Bối cảnh, mục tiêu, thời gian hoặc cơ hội hợp tác...",
      openDraft: "Mở email nháp",
      opened: "Ứng dụng email sẽ mở với nội dung đã chuẩn bị.",
      noBackend: "Không cần backend — form này tạo email nháp bằng mailto.",
      notProvided: "Chưa cung cấp",
      fallbackTopic: "Tin nhắn chung",
      subjectPrefix: "Liên hệ portfolio",
      bodyMessageFallback: "Vui lòng nhập nội dung tin nhắn tại đây.",
    },
    resume: {
      back: "← Quay lại portfolio",
      title: "CV chuyên nghiệp",
      summary: "Tóm tắt nghề nghiệp",
      experience: "Kinh nghiệm",
      projects: "Dự án tiêu biểu",
      skills: "Kỹ năng",
      education: "Học vấn",
      certifications: "Chứng chỉ",
      downloadFile: "Tải file CV",
      print: "In / Lưu PDF",
    },
    caseStudy: {
      back: "← Quay lại danh sách dự án",
      label: "Case Study",
      projectPreview: "Ảnh xem trước dự án",
      mediaKicker: "Media — Tài nguyên dự án",
      mediaTitle: "Hình ảnh minh họa cho câu chuyện dự án.",
      mediaDescription: "Thêm ảnh chụp màn hình đã ẩn dữ liệu nhạy cảm, sơ đồ quy trình hoặc tài liệu public từ tab Admin Media.",
      preview: "Xem trước",
      thumbnail: "Ảnh đại diện dự án",
      primaryVisual: "Hình ảnh chính của dự án.",
      context: "Bối cảnh",
      contextTitle: "Công việc bắt đầu từ đâu.",
      problem: "Vấn đề",
      problemTitle: "Điều cần giải quyết.",
      contribution: "Đóng góp của tôi",
      process: "Quy trình",
      processTitle: "Lộ trình có cấu trúc từ nhu cầu đến triển khai.",
      solution: "Giải pháp",
      solutionTitle: "Giải pháp được hình thành như thế nào.",
      result: "Kết quả",
      resultTitle: "Điều đã cải thiện.",
      lessons: "Bài học kinh nghiệm",
      exploreOther: "Xem dự án khác",
    },
    production: {
      kicker: "Bản production",
      title: "đã sẵn sàng sử dụng public.",
      description: "Portfolio hiện đã có CMS, tracking analytics, SEO metadata, case study dự án, resume và media assets.",
      items: [
        { title: "Dữ liệu CMS", text: "Trang public có thể đọc nội dung live từ Supabase và fallback về dữ liệu source khi cần." },
        { title: "CV/PDF", text: "Trang CV có thể in/lưu PDF và dùng chung nguồn dữ liệu portfolio." },
        { title: "Câu chuyện dự án", text: "Mỗi dự án tiêu biểu có thể mở thành một case study có cấu trúc." },
        { title: "Media sẵn sàng", text: "Ảnh dự án, gallery và link Google Drive có thể quản lý từ Admin." },
      ],
    },
    notFound: {
      kicker: "404 — Không tìm thấy",
      title: "Không tìm thấy trang.",
      description: "Trang bạn mở không tồn tại hoặc đã được di chuyển trong quá trình nâng cấp portfolio.",
      action: "Quay lại portfolio",
    },
    footer: {
      designed: "Thiết kế rõ ràng. Xây dựng cho web.",
    },
  },
} as const;

export function getUiCopy(locale?: string | null) {
  return uiCopy[getLocale(locale)];
}

export function translatedCategory(category: string, locale: Locale) {
  const copy = uiCopy[locale].projects;
  if (category === "Professional") return copy.professional;
  if (category === "Product") return copy.product;
  if (category === "Tool") return copy.tool;
  return category;
}

export type PortfolioTranslation = Partial<{
  role: string;
  headline: string;
  description: string;
  availability: string;
  location: string;
  media: Partial<{
    avatarAlt: string;
  }>;
  specialties: string[];
  about: string[];
  careerSummary: Partial<{
    title: string;
    text: string;
    highlights: Array<{ label?: string; value?: string }>;
  }>;
  experience: Record<string, Partial<{
    period: string;
    role: string;
    organization: string;
    summary: string;
    responsibilities: string[];
    tags: string[];
  }>>;
  projects: Record<string, Partial<{
    title: string;
    category: string;
    year: string;
    role: string;
    summary: string;
    contributions: string[];
    technologies: string[];
    media: Partial<{
      thumbnailAlt: string;
      assets: Array<Partial<{ title: string; caption: string; alt: string }>>;
    }>;
    caseStudy: Partial<{
      context: string;
      problem: string;
      process: string[];
      solution: string;
      result: string;
      lessons: string[];
    }>;
  }>>;
  blog: Record<string, Partial<{
    title: string;
    date: string;
    summary: string;
    tags: string[];
    content: string[];
    coverImageAlt: string;
  }>>;
  skillGroups: Record<string, Partial<{ title: string; skills: string[] }>>;
  education: Record<string, Partial<{ period: string; institution: string; degree: string; note: string }>>;
  certifications: Record<string, Partial<{ year: string; name: string; issuer: string }>>;
  workingProcess: Record<string, Partial<{ title: string; text: string }>>;
  contact: Partial<{
    title: string;
    subtitle: string;
    description: string;
    responseNote: string;
    preferredTopics: string[];
    methods: Record<string, Partial<{ label: string; value: string; description: string }>>;
  }>;
}>;

export type TranslationMap = Partial<Record<Locale, PortfolioTranslation>>;

type AnyRecord = Record<string, any>;

function mergeByRecord<T extends object>(base: T, override?: AnyRecord) {
  return { ...(base as AnyRecord), ...(override || {}) } as T;
}

export function localizeProfile(profile: PortfolioProfile, localeInput?: string | null): PortfolioProfile {
  const locale = getLocale(localeInput);
  if (locale === defaultLocale) return profile;

  const translations = (profile as unknown as { translations?: TranslationMap }).translations || {};
  const translation = translations[locale] as AnyRecord | undefined;
  if (!translation) return profile;

  const localized = {
    ...(profile as AnyRecord),
    ...translation,
    media: { ...(profile.media as AnyRecord), ...(translation.media || {}) },
    social: { ...(profile.social as AnyRecord) },
    careerSummary: {
      ...(profile.careerSummary as AnyRecord),
      ...(translation.careerSummary || {}),
      highlights: profile.careerSummary.highlights.map((item, index) => ({
        ...(item as AnyRecord),
        ...((translation.careerSummary?.highlights || [])[index] || {}),
      })),
    },
    experience: profile.experience.map((item) => {
      const key = `${item.organization}|${item.role}`;
      return mergeByRecord(item, translation.experience?.[key] || translation.experience?.[item.role]);
    }),
    projects: profile.projects.map((project) => {
      const translated = translation.projects?.[project.slug] as AnyRecord | undefined;
      return {
        ...(project as AnyRecord),
        ...(translated || {}),
        slug: project.slug,
        category: project.category,
        featured: project.featured,
        media: {
          ...(project.media as AnyRecord),
          ...(translated?.media || {}),
          assets: project.media.assets.map((asset, index) => ({
            ...(asset as AnyRecord),
            ...((translated?.media?.assets || [])[index] || {}),
          })),
        },
        caseStudy: {
          ...(project.caseStudy as AnyRecord),
          ...(translated?.caseStudy || {}),
        },
      };
    }),
    blog: profile.blog.map((post) => ({
      ...(post as AnyRecord),
      ...(translation.blog?.[post.slug] || {}),
      slug: post.slug,
      status: post.status,
      featured: post.featured,
      coverImageUrl: post.coverImageUrl,
    })),
    skillGroups: profile.skillGroups.map((group) => mergeByRecord(group, translation.skillGroups?.[group.title])),
    education: profile.education.map((item) => mergeByRecord(item, translation.education?.[item.degree])),
    certifications: profile.certifications.map((item) => mergeByRecord(item, translation.certifications?.[item.name])),
    workingProcess: profile.workingProcess.map((item) => mergeByRecord(item, translation.workingProcess?.[item.index] || translation.workingProcess?.[item.title])),
    contact: {
      ...(profile.contact as AnyRecord),
      ...(translation.contact || {}),
      preferredTopics: translation.contact?.preferredTopics || profile.contact.preferredTopics,
      methods: profile.contact.methods.map((method) => ({
        ...(method as AnyRecord),
        ...(translation.contact?.methods?.[method.label] || {}),
      })),
    },
    translations: profile.translations,
  };

  return localized as unknown as PortfolioProfile;
}
