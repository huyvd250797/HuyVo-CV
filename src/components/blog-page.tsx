import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { blogPostJsonLd, breadcrumbJsonLd } from "@/data/structured-data";
import { profile as fallbackProfile, type BlogPost, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, localizedPath, type Locale } from "@/data/i18n";
import { absoluteUrl } from "@/data/seo";
import { mediaPreviewUrl } from "@/lib/media-url";

export function getPublishedBlogPosts(profile: PortfolioProfile): BlogPost[] {
  return [...(((profile as unknown as { blog?: BlogPost[] }).blog) || [])]
    .filter((post) => post.status === "Published")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function BlogListPage({ profile = fallbackProfile, locale = "en" }: { profile?: PortfolioProfile; locale?: Locale }) {
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const posts = getPublishedBlogPosts(profile);

  return (
    <main>
      <Header profileData={profile} locale={activeLocale} />
      <section className="page-hero blog-page-hero">
        <div className="container">
          <a className="page-back" href={localizedPath(activeLocale)}>← Portfolio</a>
          <div className="section-label"><span>Blog</span> {copy.blog.latest}</div>
          <h1>{copy.blog.allPostsTitle}</h1>
          <p>{copy.blog.allPostsDescription}</p>
        </div>
      </section>

      <section className="section blog-list-section">
        <div className="container">
          {posts.length ? (
            <div className="blog-list-grid">
              {posts.map((post) => <BlogListCard key={post.slug} post={post} locale={activeLocale} />)}
            </div>
          ) : (
            <div className="blog-empty-state">
              <h2>{copy.blog.emptyTitle}</h2>
              <p>{copy.blog.emptyDescription}</p>
            </div>
          )}
        </div>
      </section>
      <Footer profileData={profile} locale={activeLocale} />
    </main>
  );
}

function BlogListCard({ post, locale }: { post: BlogPost; locale: Locale }) {
  const copy = getUiCopy(locale);
  const cover = mediaPreviewUrl(post.coverImageUrl, 1200);
  return (
    <article className="blog-list-card">
      {cover ? (
        <div className="blog-list-media">
          <img src={cover} alt={post.coverImageAlt || post.title} loading="lazy" referrerPolicy="no-referrer" />
        </div>
      ) : null}
      <div className="blog-list-content">
        <div className="blog-card-meta"><span>{post.date}</span>{post.featured ? <strong>{copy.blog.featured}</strong> : null}</div>
        <h2>{post.title}</h2>
        <p>{post.summary}</p>
        <div className="blog-tags">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <Link className="project-case-link" href={localizedPath(locale, `/blog/${post.slug}`)} data-track-event="cta_click" data-track-label={`Read blog: ${post.title}`}>
          {copy.blog.readMore} <span>↗</span>
        </Link>
      </div>
    </article>
  );
}

export function BlogPostPage({ profile = fallbackProfile, post, locale = "en" }: { profile?: PortfolioProfile; post: BlogPost; locale?: Locale }) {
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const cover = mediaPreviewUrl(post.coverImageUrl, 1600);

  return (
    <main>
      <JsonLd data={[
        blogPostJsonLd(post, profile, activeLocale),
        breadcrumbJsonLd([
          { name: "Portfolio", url: absoluteUrl(localizedPath(activeLocale)) },
          { name: copy.blog.allPostsTitle, url: absoluteUrl(localizedPath(activeLocale, "/blog")) },
          { name: post.title, url: absoluteUrl(localizedPath(activeLocale, `/blog/${post.slug}`)) },
        ]),
      ]} />
      <Header profileData={profile} locale={activeLocale} />
      <article className="blog-post-page">
        <header className="blog-post-hero">
          <div className="container">
            <Link className="page-back" href={localizedPath(activeLocale, "/blog")}>{copy.blog.back}</Link>
            <div className="blog-card-meta"><span>{copy.blog.contentLabel}</span><span>{post.date}</span>{post.featured ? <strong>{copy.blog.featured}</strong> : null}</div>
            <h1>{post.title}</h1>
            <p>{post.summary}</p>
            <div className="blog-tags">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </div>
        </header>

        {cover ? (
          <div className="container">
            <div className="blog-post-cover">
              <img src={cover} alt={post.coverImageAlt || post.title} loading="eager" referrerPolicy="no-referrer" />
            </div>
          </div>
        ) : null}

        <div className="container blog-post-body">
          {post.content.map((paragraph, index) => <p key={`${post.slug}-${index}`}>{paragraph}</p>)}
        </div>
      </article>
      <Footer profileData={profile} locale={activeLocale} />
    </main>
  );
}
