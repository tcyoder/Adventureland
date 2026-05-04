import Link from "next/link";
import { db } from "@/lib/db";
import { PostStatus } from "@/app/generated/prisma/client";
import SiteHeader from "@/components/SiteHeader";
import PostCard from "@/components/PostCard";
import ArchiveFilters from "@/components/ArchiveFilters";

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Props = {
  searchParams: Promise<{ year?: string; month?: string; type?: string }>;
};

export default async function ArchivePage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date();

  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;
  const type = params.type === "PROMPTED" || params.type === "FREE" ? params.type : undefined;

  // Fetch all published posts (just date + id) to build the month nav
  const allPosts = await db.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    select: { publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  // Build sorted list of unique year/month combos
  const monthSet = new Map<string, { year: number; month: number }>();
  for (const post of allPosts) {
    if (!post.publishedAt) continue;
    const y = post.publishedAt.getFullYear();
    const m = post.publishedAt.getMonth() + 1;
    const key = `${y}-${m}`;
    if (!monthSet.has(key)) monthSet.set(key, { year: y, month: m });
  }
  const monthNav = Array.from(monthSet.values()); // already newest-first from orderBy

  // Fetch posts for selected month
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const where: Record<string, unknown> = {
    status: PostStatus.PUBLISHED,
    publishedAt: { gte: start, lt: end },
  };
  if (type) where.type = type;

  const posts = await db.post.findMany({
    where,
    include: { prompt: true },
    orderBy: { publishedAt: "desc" },
  });

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  // Group nav months by year for display
  const byYear = new Map<number, number[]>();
  for (const { year: y, month: m } of monthNav) {
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(m);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12">
        {/* Back to latest */}
        <div className="mb-6">
          <Link href="/" className="text-xs tracking-[0.2em] uppercase text-[#faf6f0]/40 hover:text-[#b87333] transition-colors">
            ← Latest
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-10">
          {/* Sidebar: month navigation */}
          <aside className="mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-8">
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-[#b87333] mb-4">Archive</h2>
              {years.map((y) => (
                <div key={y} className="mb-4">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-[#faf6f0]/30 mb-1">{y}</div>
                  <ul className="space-y-1">
                    {byYear.get(y)!.map((m) => {
                      const isActive = y === year && m === month;
                      const navParams = new URLSearchParams();
                      navParams.set("year", String(y));
                      navParams.set("month", String(m));
                      if (type) navParams.set("type", type);
                      return (
                        <li key={m}>
                          <Link
                            href={`/archive?${navParams.toString()}`}
                            className={`text-xs tracking-[0.15em] uppercase transition-colors ${
                              isActive
                                ? "text-[#b87333] font-semibold"
                                : "text-[#faf6f0]/40 hover:text-[#faf6f0]"
                            }`}
                          >
                            {MONTH_NAMES[m - 1]}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div>
            <h1 className="font-[family-name:var(--font-josefin)] text-2xl sm:text-3xl font-bold tracking-wide text-[#faf6f0] mb-6">
              {monthLabel}
            </h1>

            <ArchiveFilters year={year} month={month} activeType={type} />

            {posts.length === 0 ? (
              <div className="text-center py-20 text-[#faf6f0]/40">
                <div className="text-5xl mb-4">◈</div>
                <p className="text-lg">No posts this month.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#b87333]/20 py-8 text-center text-[#faf6f0]/30 text-xs tracking-widest">
        <div className="deco-divider max-w-xs mx-auto mb-3">
          <span>◈</span>
        </div>
        <div className="mb-4 flex items-center justify-center gap-3 flex-wrap">
          <a href="https://bsky.app/profile/lightandpower.bsky.social" target="_blank" rel="noopener noreferrer" className="hover:text-[#b87333] transition-colors uppercase tracking-widest">
            Bluesky
          </a>
          <span className="text-[#b87333]/30">·</span>
          <a href="mailto:N.Litened@proton.me" className="hover:text-[#b87333] transition-colors uppercase tracking-widest">
            Contact
          </a>
          <span className="text-[#b87333]/30">·</span>
          <a href="https://buttondown.com/xatencio" target="_blank" rel="noopener noreferrer" className="hover:text-[#b87333] transition-colors uppercase tracking-widest">
            Subscribe
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
