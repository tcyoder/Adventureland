import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostStatus } from "@/app/generated/prisma/client";
import SiteHeader from "@/components/SiteHeader";
import PostCard from "@/components/PostCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  return {
    title: `#${tag}`,
    description: `Posts tagged with #${tag} on Tomorrowland Light & Power Co.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;

  const posts = await db.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      tags: { has: tag },
    },
    include: { prompt: true },
    orderBy: { publishedAt: "desc" },
  });

  if (posts.length === 0) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#faf6f0]/30 text-xs tracking-widest uppercase hover:text-[#b87333] transition-colors"
          >
            ← All Posts
          </Link>
          <h1 className="font-[family-name:var(--font-josefin)] text-3xl font-bold tracking-wide text-[#faf6f0] mt-3">
            #{tag}
          </h1>
          <p className="text-[#faf6f0]/40 text-sm mt-1">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>

      <footer className="border-t border-[#b87333]/20 py-6 text-center text-[#faf6f0]/30 text-xs tracking-widest">
        TOMORROWLAND LIGHT &amp; POWER CO.
      </footer>
    </div>
  );
}
