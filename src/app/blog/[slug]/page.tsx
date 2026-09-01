import { notFound } from "next/navigation";
import { BlogPostPage, getPublishedBlogPosts } from "@/components/blog-page";
import { absoluteUrl } from "@/data/seo";
import { localizeProfile } from "@/data/i18n";
import { readPortfolioProfile } from "@/lib/portfolio-cms";
import { mediaPreviewUrl } from "@/lib/media-url";

export const dynamicParams = true;

export async function generateStaticParams() {
  const { profile } = await readPortfolioProfile();
  return getPublishedBlogPosts(profile).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { profile } = await readPortfolioProfile();
  const localizedProfile = localizeProfile(profile, "en");
  const post = getPublishedBlogPosts(localizedProfile).find((item) => item.slug === slug);
  const previewImage = mediaPreviewUrl(post?.coverImageUrl) || "/opengraph-image?locale=en";

  return post
    ? {
        title: post.title,
        description: post.summary,
        alternates: { canonical: `/en/blog/${post.slug}`, languages: { en: absoluteUrl(`/en/blog/${post.slug}`), vi: absoluteUrl(`/vi/blog/${post.slug}`) } },
        openGraph: {
          title: `${post.title} | ${localizedProfile.name}`,
          description: post.summary,
          url: `/en/blog/${post.slug}`,
          type: "article",
          publishedTime: post.date,
          tags: post.tags,
          images: [absoluteUrl(previewImage)],
        },
        twitter: {
          card: "summary_large_image",
          title: `${post.title} | ${localizedProfile.name}`,
          description: post.summary,
          images: [absoluteUrl(previewImage)],
        },
      }
    : {};
}

export default async function BlogPostRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { profile } = await readPortfolioProfile();
  const localizedProfile = localizeProfile(profile, "en");
  const post = getPublishedBlogPosts(localizedProfile).find((item) => item.slug === slug);
  if (!post) notFound();
  return <BlogPostPage profile={localizedProfile} post={post as NonNullable<typeof post>} locale="en" />;
}
