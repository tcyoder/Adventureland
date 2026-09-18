import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PostStatus } from "@/app/generated/prisma/client";
import SiteHeader from "@/components/SiteHeader";
import PostTypeBadge from "@/components/PostTypeBadge";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });
  if (!post) return { title: "Not Found" };

  const description = post.excerpt || "A story from Tomorrowland Light & Power Co.";
  const images = post.coverImage ? [{ url: post.coverImage, alt: post.title }] : [];

  return {
    title: post.title,
    description,
    keywords: post.tags.length > 0 ? post.tags.join(", ") : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/post/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      images,
      tags: post.tags.length > 0 ? post.tags : undefined,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const post = await db.post.findUnique({
    where: { slug, status: PostStatus.PUBLISHED },
    include: { prompt: true },
  });

  if (!post) notFound();

  // Increment view count (fire and forget)
  db.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});

  // Adjacent posts for prev/next nav
  const allPosts = await db.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "asc" },
    select: { id: true, title: true, slug: true },
  });

  const idx = allPosts.findIndex((p) => p.id === post.id);
  const prev = idx > 0 ? allPosts[idx - 1] : null;
  const next = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

  const postUrl = `${SITE_URL}/post/${post.slug}`;
  const description = post.excerpt || "A story from Tomorrowland Light & Power Co.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    url: postUrl,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: { "@type": "Person", "name": "N. Litenment" },
    publisher: {
      "@type": "Organization",
      name: "Tomorrowland Light & Power Co.",
      url: SITE_URL,
    },
    ...(post.coverImage && { image: post.coverImage }),
    ...(post.tags.length > 0 && { keywords: post.tags.join(", ") }),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:py-12">
        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden border border-[#b87333]/20">
            <img src={post.coverImage} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        {/* Post header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <PostTypeBadge type={post.type} />
            <span className="text-[#faf6f0]/40 text-sm">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-josefin)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-[#faf6f0] mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="h-px bg-gradient-to-r from-[#b87333] via-[#d4945a] to-transparent" />
        </div>

        {/* Prompt callout for PROMPTED posts */}
        {post.type === "PROMPTED" && post.prompt && (
          <div className="mb-8 bg-[#1a2f45] border border-[#b87333]/40 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2 text-[#b87333] text-xs tracking-[0.2em] uppercase font-semibold">
              <span>◉</span>
              <span>Incoming Transmission — Weekly Prompt</span>
            </div>
            <p className="text-[#faf6f0]/80 italic leading-relaxed">{post.prompt.promptText}</p>
          </div>
        )}

        {/* Post content */}
        <article
          className="tiptap-content text-[#faf6f0]/90 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share */}
        <div className="mt-6 flex items-center gap-4">
          <span className="text-[#faf6f0]/30 text-xs tracking-widest uppercase">Share</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#faf6f0]/40 hover:text-[#faf6f0] tracking-widest uppercase transition-colors"
          >
            Twitter / X
          </a>
          <a
            href={`https://reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#faf6f0]/40 hover:text-[#faf6f0] tracking-widest uppercase transition-colors"
          >
            Reddit
          </a>
          <a
            href={`https://bsky.app/intent/compose?text=${encodeURIComponent(post.title + " " + postUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#faf6f0]/40 hover:text-[#faf6f0] tracking-widest uppercase transition-colors"
          >
            Bluesky
          </a>
        </div>

        {/* Prev/Next navigation */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-[#b87333]/20 flex flex-col sm:grid sm:grid-cols-2 gap-6 sm:gap-4">
          <div>
            {prev && (
              <Link
                href={`/post/${prev.slug}`}
                className="group flex flex-col gap-1 hover:text-[#b87333] transition-colors"
              >
                <span className="text-[#faf6f0]/40 text-xs tracking-widest">← PREVIOUS</span>
                <span className="text-[#faf6f0]/80 group-hover:text-[#b87333] text-sm line-clamp-2">
                  {prev.title}
                </span>
              </Link>
            )}
          </div>
          <div className="sm:text-right">
            {next && (
              <Link
                href={`/post/${next.slug}`}
                className="group flex flex-col gap-1 hover:text-[#b87333] transition-colors"
              >
                <span className="text-[#faf6f0]/40 text-xs tracking-widest">NEXT →</span>
                <span className="text-[#faf6f0]/80 group-hover:text-[#b87333] text-sm line-clamp-2">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#b87333]/20 py-6 text-center text-[#faf6f0]/30 text-xs tracking-widest">
        TOMORROWLAND LIGHT &amp; POWER CO.
      </footer>
    </div>
  );
}
