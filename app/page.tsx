import { db } from "@/lib/db";
import { PostStatus } from "@/app/generated/prisma/client";
import PostCard from "@/components/PostCard";
import PostFilters from "@/components/PostFilters";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  const where: Record<string, unknown> = { status: PostStatus.PUBLISHED };
  if (type === "PROMPTED" || type === "FREE") where.type = type;

  const posts = await db.post.findMany({
    where,
    include: { prompt: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero stripe */}
      <div className="border-y border-[#b87333]/30 bg-gradient-to-r from-[#0d1b2a] via-[#1a2f45] to-[#0d1b2a] py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="deco-divider mb-4">
            <span className="text-xs tracking-[0.3em] uppercase text-[#b87333]">
              Transmissions from the City
            </span>
          </div>
          <p className="text-[#faf6f0]/60 text-sm max-w-xl mx-auto">
            Stories and dispatches from Tomorrowland — headquarters of the League of
            Planets, where the future never quite arrived.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:py-12">
        <PostFilters activeType={type} />

        {posts.length === 0 ? (
          <div className="text-center py-20 text-[#faf6f0]/40">
            <div className="text-5xl mb-4">◈</div>
            <p className="text-lg">No transmissions yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#b87333]/20 py-8 text-center text-[#faf6f0]/30 text-xs tracking-widest">
        <div className="deco-divider max-w-xs mx-auto mb-3">
          <span>◈</span>
        </div>
        <div className="mb-4 flex items-center justify-center gap-4">
          <a href="https://bsky.app/profile/lightandpower.bsky.social" target="_blank" rel="noopener noreferrer" className="hover:text-[#b87333] transition-colors uppercase tracking-widest">
            Bluesky
          </a>
          <span className="text-[#b87333]/30">·</span>
          <a href="mailto:N.Litened@proton.me" className="hover:text-[#b87333] transition-colors uppercase tracking-widest">
            Contact
          </a>
          <span className="text-[#b87333]/30">·</span>
          <a href="/feed.xml" title="RSS Feed" className="hover:text-[#b87333] transition-colors uppercase tracking-widest">
            RSS
          </a>
        </div>
        TOMORROWLAND LIGHT &amp; POWER CO. · EST. 1994 · ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
