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

  const [totalPosts, draftPosts, publishedPosts, recentDrafts, weeklyPrompt, unusedCount] = await Promise.all([
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
  ]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-josefin)] text-3xl font-bold tracking-wide text-[#faf6f0]">
          Dashboard
        </h1>
        <Link
          href="/admin/post/new"
          className="bg-[#b87333] hover:bg-[#d4945a] text-[#0d1b2a] font-bold px-5 py-2.5 rounded text-sm tracking-widest uppercase transition-colors"
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
            className="bg-[#1a2f45] border border-[#b87333]/20 rounded-lg p-5 text-center"
          >
            <div className="font-[family-name:var(--font-josefin)] text-4xl font-bold text-[#b87333]">
              {value}
            </div>
            <div className="text-xs tracking-widest uppercase text-[#faf6f0]/50 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Prompt Panel */}
        <PromptPanel prompt={weeklyPrompt} unusedCount={unusedCount} />

        {/* Recent Drafts */}
        <div className="bg-[#1a2f45] border border-[#b87333]/20 rounded-lg p-6">
          <h2 className="text-xs tracking-[0.2em] uppercase text-[#b87333] mb-4 font-semibold">
            Recent Drafts
          </h2>
          {recentDrafts.length === 0 ? (
            <p className="text-[#faf6f0]/40 text-sm">No drafts in progress.</p>
          ) : (
            <ul className="space-y-2">
              {recentDrafts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/post/${post.id}/edit`}
                    className="flex items-center justify-between group py-2 border-b border-[#b87333]/10 last:border-0"
                  >
                    <span className="text-[#faf6f0]/80 group-hover:text-[#d4945a] text-sm transition-colors line-clamp-1">
                      {post.title}
                    </span>
                    <span className="text-[#faf6f0]/30 text-xs ml-2 shrink-0">Edit →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
