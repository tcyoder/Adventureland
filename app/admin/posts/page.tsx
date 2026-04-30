import { db } from "@/lib/db";
import { PostStatus, PostType } from "@/app/generated/prisma/client";
import Link from "next/link";
import AdminDeletePost from "@/components/AdminDeletePost";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; sort?: string }>;
}) {
  const { status, type, sort } = await searchParams;

  const where: Record<string, unknown> = {};
  if (status === "DRAFT" || status === "PUBLISHED") where.status = status as PostStatus;
  if (type === "PROMPTED" || type === "FREE") where.type = type as PostType;

  const orderBy =
    sort === "published"
      ? { publishedAt: "desc" as const }
      : { createdAt: "desc" as const };

  const posts = await db.post.findMany({
    where,
    orderBy,
    include: { prompt: false },
  });

  function filterHref(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { status, type, sort, ...params };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    return `/admin/posts${sp.toString() ? "?" + sp.toString() : ""}`;
  }

  function filterBtn(label: string, param: string, value: string | undefined, current: string | undefined) {
    const active = current === value;
    const href = filterHref({ [param]: value });
    return (
      <Link
        key={label}
        href={href}
        className={`px-3 py-1.5 rounded text-xs tracking-widest uppercase border transition-all ${
          active
            ? "bg-[#b87333] border-[#b87333] text-[#0d1b2a] font-bold"
            : "border-[#b87333]/30 text-[#faf6f0]/50 hover:border-[#b87333]/60"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-josefin)] text-3xl font-bold tracking-wide">
          All Posts
        </h1>
        <Link
          href="/admin/post/new"
          className="bg-[#b87333] hover:bg-[#d4945a] text-[#0d1b2a] font-bold px-4 py-2 rounded text-xs tracking-widest uppercase transition-colors"
        >
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterBtn("All Status", "status", undefined, status)}
        {filterBtn("Draft", "status", "DRAFT", status)}
        {filterBtn("Published", "status", "PUBLISHED", status)}
        <span className="w-px h-6 bg-[#b87333]/20 self-center" />
        {filterBtn("All Types", "type", undefined, type)}
        {filterBtn("Transmissions", "type", "PROMPTED", type)}
        {filterBtn("Dispatches", "type", "FREE", type)}
      </div>

      {/* Table */}
      <div className="bg-[#1a2f45] border border-[#b87333]/20 rounded-lg overflow-hidden">
        {posts.length === 0 ? (
          <p className="text-center py-12 text-[#faf6f0]/40">No posts found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#b87333]/20 text-xs tracking-widest uppercase text-[#faf6f0]/40">
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-3 py-3 hidden sm:table-cell">Type</th>
                <th className="text-left px-3 py-3 hidden md:table-cell">Status</th>
                <th className="text-left px-3 py-3 hidden lg:table-cell">
                  <Link href={filterHref({ sort: "created" })} className="hover:text-[#b87333]">
                    Created
                  </Link>
                </th>
                <th className="text-left px-3 py-3 hidden lg:table-cell">
                  <Link href={filterHref({ sort: "published" })} className="hover:text-[#b87333]">
                    Published
                  </Link>
                </th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-[#b87333]/10 last:border-0 hover:bg-[#0d1b2a]/30 transition-colors"
                >
                  <td className="px-5 py-3">
                    <span className="font-medium text-[#faf6f0]/90 line-clamp-1">{post.title}</span>
                  </td>
                  <td className="px-3 py-3 hidden sm:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        post.type === "PROMPTED"
                          ? "border-[#2dd4bf]/30 text-[#2dd4bf]"
                          : "border-[#b87333]/30 text-[#b87333]"
                      }`}
                    >
                      {post.type === "PROMPTED" ? "◉ Trans." : "✍ Disp."}
                    </span>
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        post.status === "PUBLISHED"
                          ? "border-green-500/30 text-green-400"
                          : "border-yellow-500/30 text-yellow-400"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell text-[#faf6f0]/40 text-xs">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell text-[#faf6f0]/40 text-xs">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/post/${post.id}/edit`}
                        className="text-xs text-[#b87333] hover:text-[#d4945a] tracking-widest uppercase transition-colors"
                      >
                        Edit
                      </Link>
                      {post.status === "PUBLISHED" && (
                        <Link
                          href={`/post/${post.slug}`}
                          target="_blank"
                          className="text-xs text-[#faf6f0]/30 hover:text-[#faf6f0] tracking-widest uppercase transition-colors"
                        >
                          View
                        </Link>
                      )}
                      <AdminDeletePost postId={post.id} postTitle={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
