import Link from "next/link";
import { profile as fallbackProfile, type BlogPost, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, localizedPath, type Locale } from "@/data/i18n";
import { mediaPreviewUrl } from "@/lib/media-url";

function publishedPosts(profile: PortfolioProfile): BlogPost[] {
  return [...(((profile as unknown as { blog?: BlogPost[] }).blog) || [])]
    .filter((post) => post.status === "Published")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function BlogPreview({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const posts = publishedPosts(profile).slice(0, 3);

  if (!posts.length) return null;

  return (
    <section className="section blog-preview" id="blog">
      <div className="container">
        <div className="blog-preview-heading">
          <div>
            <div className="section-label"><span>10</span> {copy.sections.blog}</div>
            <h2>{copy.sections.blogTitle}</h2>
          </div>
          <div>
            <p>{copy.sections.blogDescription}</p>
            <Link className="text-link" href={localizedPath(activeLocale, "/blog")}>{copy.blog.readAll} ↗</Link>
          </div>
        </div>

        <div className="blog-card-grid">
          {posts.map((post) => {
            const cover = mediaPreviewUrl(post.coverImageUrl, 1200);
            return (
              <article className={post.featured ? "blog-card featured" : "blog-card"} key={post.slug}>
                {cover ? (
                  <div className="blog-card-media">
                    <img src={cover} alt={post.coverImageAlt || post.title} loading="lazy" referrerPolicy="no-referrer" />
                  </div>
                ) : null}
                <div className="blog-card-meta">
                  <span>{post.date}</span>
                  {post.featured ? <strong>{copy.blog.featured}</strong> : null}
                </div>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <div className="blog-tags">
                  {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <Link className="project-case-link" href={localizedPath(activeLocale, `/blog/${post.slug}`)} data-track-event="cta_click" data-track-label={`Read blog: ${post.title}`}>
                  {copy.blog.readMore} <span>↗</span>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
