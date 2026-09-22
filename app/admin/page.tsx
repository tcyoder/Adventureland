import { db } from "@/lib/db";
import { PostStatus } from "@/app/generated/prisma/client";
import Link from "next/link";
import PromptPanel from "@/components/PromptPanel";

export const dynamic = "force-dynamic";

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboard() {
  const weekOf = getWeekStart(new Date());

  const [totalPosts, draftPosts, publishedPosts, recentDrafts, weeklyPrompt, unusedCount, aboutPost, topPosts] = await Promise.all([
    db.post.count(),
    db.post.count({ where: { status: PostStatus.DRAFT } }),
    db.post.count({ where: { status: PostStatus.PUBLISHED } }),
    db.post.findMany({
      where: { status: PostStatus.DRAFT },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.weeklyPrompt.findUnique({
      where: { weekOf },
      include: { posts: { select: { id: true, title: true, slug: true, status: true } } },
    }),
    db.promptBank.count({ where: { usedAt: null } }),
    db.post.findUnique({ where: { slug: "meet-the-admin" }, select: { status: true, updatedAt: true } }),
    db.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, views: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-josefin)] text-3xl font-bold tracking-wide text-[#f0e6c8]">
          Dashboard
        </h1>
        <Link
          href="/admin/post/new"
          className="bg-[#c9a227] hover:bg-[#e2b84e] text-[#0d1a08] font-bold px-5 py-2.5 rounded text-sm tracking-widest uppercase transition-colors"
        >
          + New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Posts", value: totalPosts },
          { label: "Published", value: publishedPosts },
          { label: "Drafts", value: draftPosts },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-[#1a2e10] border border-[#c9a227]/20 rounded-lg p-5 text-center"
          >
            <div className="font-[family-name:var(--font-josefin)] text-4xl font-bold text-[#c9a227]">
              {value}
            </div>
            <div className="text-xs tracking-widest uppercase text-[#f0e6c8]/50 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Prompt Panel */}
        <PromptPanel prompt={weeklyPrompt} unusedCount={unusedCount} />

        {/* Recent Drafts */}
        <div className="bg-[#1a2e10] border border-[#c9a227]/20 rounded-lg p-6">
          <h2 className="text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-4 font-semibold">
            Recent Drafts
          </h2>
          {recentDrafts.length === 0 ? (
            <p className="text-[#f0e6c8]/40 text-sm">No drafts in progress.</p>
          ) : (
            <ul className="space-y-2">
              {recentDrafts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/post/${post.id}/edit`}
                    className="flex items-center justify-between group py-2 border-b border-[#c9a227]/10 last:border-0"
                  >
                    <span className="text-[#f0e6c8]/80 group-hover:text-[#e2b84e] text-sm transition-colors line-clamp-1">
                      {post.title}
                    </span>
                    <span className="text-[#f0e6c8]/30 text-xs ml-2 shrink-0">Edit →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top Posts by Views */}
      <div className="mt-6 bg-[#1a2e10] border border-[#c9a227]/20 rounded-lg p-6">
        <h2 className="text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-4 font-semibold">
          Top Posts by Views
        </h2>
        {topPosts.length === 0 ? (
          <p className="text-[#f0e6c8]/40 text-sm">No published posts yet.</p>
        ) : (
          <ul className="space-y-2">
            {topPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/admin/post/${post.id}/edit`}
                  className="flex items-center justify-between group py-2 border-b border-[#c9a227]/10 last:border-0"
                >
                  <span className="text-[#f0e6c8]/80 group-hover:text-[#e2b84e] text-sm transition-colors line-clamp-1">
                    {post.title}
                  </span>
                  <span className="text-[#c9a227] text-xs ml-4 shrink-0 font-semibold tabular-nums">
                    {post.views.toLocaleString()} {post.views === 1 ? "view" : "views"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Meet the CEO */}
      <div className="mt-6 bg-[#1a2e10] border border-[#c9a227]/20 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-1 font-semibold">
            Meet the CEO
          </h2>
          <p className="text-[#f0e6c8]/50 text-sm">
            Introduction page at{" "}
            <Link href="/about" target="_blank" className="text-[#f0e6c8]/70 hover:text-[#c9a227] transition-colors underline underline-offset-2">
              /about
            </Link>
            {" · "}
            {aboutPost ? (
              aboutPost.status === PostStatus.PUBLISHED ? (
                <span className="text-[#2d9c6e]">Published as Dispatch</span>
              ) : (
                <span className="text-[#f0e6c8]/40">Draft — not yet in feed</span>
              )
            ) : (
              <span className="text-[#f0e6c8]/40">Not yet created</span>
            )}
          </p>
        </div>
        <Link
          href="/admin/about"
          className="shrink-0 border border-[#c9a227]/50 hover:border-[#c9a227] text-[#c9a227] hover:text-[#e2b84e] px-4 py-2 rounded text-xs tracking-widest uppercase transition-colors"
        >
          Edit Introduction
        </Link>
      </div>
    </div>
  );
}
