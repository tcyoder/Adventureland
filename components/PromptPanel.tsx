"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WeeklyPrompt, Post } from "@/app/generated/prisma/client";

const PostStatus = { PUBLISHED: "PUBLISHED" as const, DRAFT: "DRAFT" as const };

type PromptWithPosts = (WeeklyPrompt & { posts: Pick<Post, "id" | "title" | "slug" | "status">[] }) | null;

export default function PromptPanel({
  prompt,
  unusedCount,
}: {
  prompt: PromptWithPosts;
  unusedCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bankError, setBankError] = useState("");

  async function handleAssign() {
    setLoading(true);
    setBankError("");
    try {
      const res = await fetch("/api/cron/generate-prompt", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setBankError(data.error ?? "Failed to assign prompt.");
      } else {
        router.refresh();
      }
    } catch {
      setBankError("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  const publishedResponse = prompt?.posts?.find((p) => p.status === PostStatus.PUBLISHED);
  const draftResponse = prompt?.posts?.find((p) => p.status === PostStatus.DRAFT);

  return (
    <div className="bg-[#1a2f45] border border-[#2dd4bf]/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs tracking-[0.2em] uppercase text-[#2dd4bf] font-semibold">
          ◉ This Week's Prompt
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-[#faf6f0]/25 text-xs">{unusedCount} in bank</span>
          <Link
            href="/admin/prompts"
            className="text-xs tracking-widest uppercase text-[#faf6f0]/40 hover:text-[#b87333] transition-colors"
          >
            Manage →
          </Link>
        </div>
      </div>

      {bankError && (
        <p className="text-amber-400 text-xs bg-amber-400/10 border border-amber-400/20 rounded px-3 py-2 mb-4">
          {bankError}{" "}
          <Link href="/admin/prompts" className="underline">
            Add prompts to the bank →
          </Link>
        </p>
      )}

      {prompt ? (
        <>
          <p className="text-[#faf6f0]/80 italic text-sm leading-relaxed mb-5">
            {prompt.promptText}
          </p>

          <div className="flex items-center justify-between gap-3">
            <div>
              {publishedResponse ? (
                <div className="flex items-center gap-2 text-xs text-[#2dd4bf]">
                  <span className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
                  <span>Responded:</span>
                  <Link
                    href={`/admin/post/${publishedResponse.id}/edit`}
                    className="underline hover:text-[#faf6f0] transition-colors"
                  >
                    {publishedResponse.title}
                  </Link>
                </div>
              ) : draftResponse ? (
                <div className="flex items-center gap-2 text-xs text-[#f59e0b]">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <span>Draft in progress:</span>
                  <Link
                    href={`/admin/post/${draftResponse.id}/edit`}
                    className="underline hover:text-[#faf6f0] transition-colors"
                  >
                    {draftResponse.title}
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/admin/post/new?promptId=${prompt.id}&type=PROMPTED`}
                  className="bg-[#2dd4bf] hover:bg-[#5eead4] text-[#0d1b2a] font-bold px-4 py-2 rounded text-xs tracking-widest uppercase transition-colors"
                >
                  Write Your Story →
                </Link>
              )}
            </div>

            {unusedCount > 0 && (
              <button
                onClick={handleAssign}
                disabled={loading}
                className="text-xs tracking-widest uppercase text-[#faf6f0]/30 hover:text-[#2dd4bf] transition-colors disabled:opacity-40"
              >
                {loading ? "…" : "↻ Use Next"}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          {unusedCount > 0 ? (
            <>
              <p className="text-[#faf6f0]/40 text-sm mb-4">
                No prompt assigned this week yet.
              </p>
              <button
                onClick={handleAssign}
                disabled={loading}
                className="bg-[#2dd4bf] hover:bg-[#5eead4] disabled:opacity-50 text-[#0d1b2a] font-bold px-5 py-2 rounded text-xs tracking-widest uppercase transition-colors"
              >
                {loading ? "Assigning…" : "Assign This Week's Prompt"}
              </button>
            </>
          ) : (
            <div className="text-[#faf6f0]/40 text-sm">
              <p className="mb-3">No prompt assigned and the bank is empty.</p>
              <Link
                href="/admin/prompts"
                className="text-[#b87333] hover:text-[#d4945a] underline transition-colors"
              >
                Add prompts to the bank →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
