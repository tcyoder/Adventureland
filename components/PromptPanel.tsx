import Link from "next/link";
import type { Post } from "@/app/generated/prisma/client";

type RecentTransmission = Pick<Post, "id" | "title" | "status">;

export default function PromptPanel({
  unusedCount,
  recentTransmissions,
}: {
  unusedCount: number;
  recentTransmissions: RecentTransmission[];
}) {
  return (
    <div className="bg-[#1a2e10] border border-[#2d9c6e]/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs tracking-[0.2em] uppercase text-[#2d9c6e] font-semibold">
          ◉ Transmissions
        </h2>
        <Link
          href="/admin/prompts"
          className="text-xs tracking-widest uppercase text-[#f0e6c8]/40 hover:text-[#c9a227] transition-colors"
        >
          Manage Prompts →
        </Link>
      </div>

      {/* Bank status */}
      <div className="flex items-center gap-2 mb-5">
        <span
          className={`text-2xl font-bold font-[family-name:var(--font-josefin)] ${
            unusedCount === 0 ? "text-red-400" : "text-[#2d9c6e]"
          }`}
        >
          {unusedCount}
        </span>
        <span className="text-[#f0e6c8]/40 text-sm">
          {unusedCount === 1 ? "prompt" : "prompts"} available in bank
        </span>
      </div>

      {unusedCount === 0 && (
        <p className="text-amber-400 text-xs bg-amber-400/10 border border-amber-400/20 rounded px-3 py-2 mb-4">
          Prompt bank is empty.{" "}
          <Link href="/admin/prompts" className="underline hover:text-amber-300 transition-colors">
            Add prompts →
          </Link>
        </p>
      )}

      <Link
        href="/admin/post/new"
        className="inline-block bg-[#2d9c6e] hover:bg-[#5eead4] text-[#0d1a08] font-bold px-4 py-2 rounded text-xs tracking-widest uppercase transition-colors mb-5"
      >
        + New Transmission
      </Link>

      {/* Recent transmissions */}
      {recentTransmissions.length > 0 && (
        <div>
          <div className="text-[#f0e6c8]/30 text-[10px] tracking-widest uppercase mb-2">Recent</div>
          <ul className="space-y-2">
            {recentTransmissions.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/admin/post/${post.id}/edit`}
                  className="flex items-center justify-between group py-1.5 border-b border-[#2d9c6e]/10 last:border-0"
                >
                  <span className="text-[#f0e6c8]/70 group-hover:text-[#f0e6c8] text-sm transition-colors line-clamp-1">
                    {post.title}
                  </span>
                  <span
                    className={`text-[10px] ml-2 shrink-0 ${
                      post.status === "PUBLISHED" ? "text-[#2d9c6e]" : "text-[#d47b0a]"
                    }`}
                  >
                    {post.status === "PUBLISHED" ? "Live" : "Draft"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
