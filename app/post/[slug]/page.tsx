import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PostStatus } from "@/app/generated/prisma/client";
import SiteHeader from "@/components/SiteHeader";
import PostTypeBadge from "@/components/PostTypeBadge";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });
  if (!post) return { title: "Not Found" };
  return { title: `${post.title} | Tomorrowland Light & Power Co.` };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const post = await db.post.findUnique({
    where: { slug, status: PostStatus.PUBLISHED },
    include: { prompt: true },
  });

  if (!post) notFound();

  // Adjacent posts for prev/next nav
  const allPosts = await db.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "asc" },
    select: { id: true, title: true, slug: true },
  });

  const idx = allPosts.findIndex((p) => p.id === post.id);
  const prev = idx > 0 ? allPosts[idx - 1] : null;
  const next = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden border border-[#b87333]/20">
            <img src={post.coverImage} alt={post.title} className="w-full object-cover max-h-72" />
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

          <h1 className="font-[family-name:var(--font-josefin)] text-4xl md:text-5xl font-bold tracking-wide text-[#faf6f0] mb-4 leading-tight">
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

        {/* Prev/Next navigation */}
        <div className="mt-16 pt-8 border-t border-[#b87333]/20 grid grid-cols-2 gap-4">
          <div>
            {prev && (
              <Link
                href={`/post/${prev.slug}`}
                className="group flex flex-col gap-1 text-sm hover:text-[#b87333] transition-colors"
              >
                <span className="text-[#faf6f0]/40 text-xs tracking-widest">← PREVIOUS</span>
                <span className="text-[#faf6f0]/80 group-hover:text-[#b87333] line-clamp-2">
                  {prev.title}
                </span>
              </Link>
            )}
          </div>
          <div className="text-right">
            {next && (
              <Link
                href={`/post/${next.slug}`}
                className="group flex flex-col gap-1 text-sm hover:text-[#b87333] transition-colors"
              >
                <span className="text-[#faf6f0]/40 text-xs tracking-widest">NEXT →</span>
                <span className="text-[#faf6f0]/80 group-hover:text-[#b87333] line-clamp-2">
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
