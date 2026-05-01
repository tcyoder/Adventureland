import Link from "next/link";
import type { Post, WeeklyPrompt } from "@/app/generated/prisma/client";
import type { PostType } from "@/app/generated/prisma/enums";
import PostTypeBadge from "./PostTypeBadge";

type PostWithPrompt = Post & { prompt: WeeklyPrompt | null };

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function PostCard({ post }: { post: PostWithPrompt }) {
  const excerpt =
    post.excerpt ||
    (post.content ? stripHtml(post.content).slice(0, 160) + "…" : "");

  return (
    <Link href={`/post/${post.slug}`} className="group block">
      <article className="bg-[#1a2f45]/60 border border-[#b87333]/20 rounded-lg overflow-hidden hover:border-[#b87333]/50 transition-all duration-200 hover:bg-[#1a2f45]/80">
        {post.coverImage && (
          <div className="h-48 overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <PostTypeBadge type={post.type as PostType} />
            {post.publishedAt && (
              <span className="text-[#faf6f0]/30 text-xs tracking-wider">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          <h2 className="font-[family-name:var(--font-josefin)] text-xl md:text-2xl font-bold tracking-wide text-[#faf6f0] group-hover:text-[#d4945a] transition-colors mb-2 leading-snug">
            {post.title}
          </h2>

          {excerpt && (
            <p className="text-[#faf6f0]/60 text-sm leading-relaxed line-clamp-3">{excerpt}</p>
          )}

          <div className="mt-4 flex items-center gap-1 text-[#b87333] text-xs tracking-widest md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <span>READ TRANSMISSION</span>
            <span>→</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
