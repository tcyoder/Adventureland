"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PromptBank } from "@/app/generated/prisma/client";

type Props = {
  prompts: PromptBank[];
  total: number;
  unused: number;
};

export default function PromptBankManager({ prompts, total, unused }: Props) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Parse textarea: split on blank lines, each block = one prompt
  function parsePrompts(text: string): string[] {
    return text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parsePrompts(input);
    if (!parsed.length) {
      setError("No prompts detected. Separate multiple prompts with a blank line.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/prompt-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.map((promptText) => ({ promptText }))),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Failed to save prompts.");
      return;
    }

    const data = await res.json();
    setSuccess(`${data.created} prompt${data.created === 1 ? "" : "s"} added to the bank.`);
    setInput("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this prompt from the bank?")) return;
    await fetch("/api/prompt-bank", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-josefin)] text-3xl font-bold tracking-wide text-[#faf6f0] mb-1">
          Prompt Bank
        </h1>
        <p className="text-[#faf6f0]/40 text-sm">
          Pre-written prompts drawn one-by-one each week. Each Monday the cron job assigns the next
          unused prompt.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Prompts", value: total },
          { label: "Unused", value: unused },
          { label: "Used", value: total - unused },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-[#1a2f45] border border-[#b87333]/20 rounded-lg p-4 text-center"
          >
            <div className="font-[family-name:var(--font-josefin)] text-3xl font-bold text-[#b87333]">
              {value}
            </div>
            <div className="text-xs tracking-widest uppercase text-[#faf6f0]/50 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Add prompts form */}
      <div className="bg-[#1a2f45] border border-[#b87333]/20 rounded-lg p-6 mb-8">
        <h2 className="text-xs tracking-[0.2em] uppercase text-[#b87333] font-semibold mb-3">
          Add Prompts
        </h2>
        <p className="text-[#faf6f0]/50 text-xs mb-4">
          Paste one or more prompts below. Separate multiple prompts with a blank line between each.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            placeholder={`The Robot Newsboy's headlines have been wrong three times this week — not wrong exactly, but early, as if he knows what's coming before it happens. When the Transit Authority detective finally corners him on the Avenue of the Planets, he offers her a single folded slip of paper and says, "You'll want to read this before you arrest me."

A cargo crate arrives at Space Mountain with no manifest, no sender, and an address label written in a language that even the League of Planets' translators can't identify — except for one word, repeated in the corner: urgent.`}
            className="w-full bg-[#0d1b2a] border border-[#b87333]/30 rounded px-4 py-3 text-[#faf6f0]/80 placeholder-[#faf6f0]/20 focus:outline-none focus:border-[#b87333] text-sm leading-relaxed resize-y transition-colors font-[family-name:var(--font-dm-sans)]"
          />

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded px-3 py-2">
              ✓ {success}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[#faf6f0]/30 text-xs">
              {parsePrompts(input).length > 0 &&
                `${parsePrompts(input).length} prompt${parsePrompts(input).length === 1 ? "" : "s"} detected`}
            </span>
            <button
              type="submit"
              disabled={saving || !input.trim()}
              className="bg-[#b87333] hover:bg-[#d4945a] disabled:opacity-50 text-[#0d1b2a] font-bold px-5 py-2 rounded text-xs tracking-widest uppercase transition-colors"
            >
              {saving ? "Saving…" : "Add to Bank"}
            </button>
          </div>
        </form>
      </div>

      {/* Prompt list */}
      <div className="bg-[#1a2f45] border border-[#b87333]/20 rounded-lg overflow-hidden">
        <div className="border-b border-[#b87333]/20 px-5 py-3 flex items-center justify-between">
          <h2 className="text-xs tracking-[0.2em] uppercase text-[#b87333] font-semibold">
            All Prompts (in queue order)
          </h2>
        </div>

        {prompts.length === 0 ? (
          <p className="text-center py-12 text-[#faf6f0]/30 text-sm">
            No prompts in the bank yet. Add some above.
          </p>
        ) : (
          <ul className="divide-y divide-[#b87333]/10">
            {prompts.map((p, i) => (
              <li key={p.id} className="px-5 py-4 flex gap-4 group">
                <div className="shrink-0 w-7 h-7 rounded-full border border-[#b87333]/20 flex items-center justify-center text-xs text-[#faf6f0]/30 font-mono">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#faf6f0]/80 text-sm leading-relaxed">{p.promptText}</p>
                  {p.usedAt && (
                    <p className="text-[#faf6f0]/30 text-xs mt-1">
                      Used {new Date(p.usedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                  {!p.usedAt && (
                    <span className="inline-block mt-1 text-xs text-[#2dd4bf]/60 tracking-widest uppercase">
                      Available
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="shrink-0 text-xs text-[#faf6f0]/20 hover:text-red-400 tracking-widest uppercase transition-colors opacity-0 group-hover:opacity-100"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

}
