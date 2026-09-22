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
        <h1 className="font-[family-name:var(--font-josefin)] text-3xl font-bold tracking-wide text-[#f0e6c8] mb-1">
          Prompt Bank
        </h1>
        <p className="text-[#f0e6c8]/40 text-sm">
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
            className="bg-[#1a2e10] border border-[#c9a227]/20 rounded-lg p-4 text-center"
          >
            <div className="font-[family-name:var(--font-josefin)] text-3xl font-bold text-[#c9a227]">
              {value}
            </div>
            <div className="text-xs tracking-widest uppercase text-[#f0e6c8]/50 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Add prompts form */}
      <div className="bg-[#1a2e10] border border-[#c9a227]/20 rounded-lg p-6 mb-8">
        <h2 className="text-xs tracking-[0.2em] uppercase text-[#c9a227] font-semibold mb-3">
          Add Prompts
        </h2>
        <p className="text-[#f0e6c8]/50 text-xs mb-4">
          Paste one or more prompts below. Separate multiple prompts with a blank line between each.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            placeholder={`A trader arrives at the outpost with a crate sealed in unfamiliar wax, marked only with the symbol of a river no one has charted. The skipper must decide: open it now, or wait until the monsoon passes and the jungle stops watching.

Deep in the temple ruins, the Jungle Cruise boat idles in still water. The skipper has told this joke a hundred times before — but tonight, something in the dark laughed back.`}
            className="w-full bg-[#0d1a08] border border-[#c9a227]/30 rounded px-4 py-3 text-[#f0e6c8]/80 placeholder-[#f0e6c8]/20 focus:outline-none focus:border-[#c9a227] text-sm leading-relaxed resize-y transition-colors font-[family-name:var(--font-dm-sans)]"
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
            <span className="text-[#f0e6c8]/30 text-xs">
              {parsePrompts(input).length > 0 &&
                `${parsePrompts(input).length} prompt${parsePrompts(input).length === 1 ? "" : "s"} detected`}
            </span>
            <button
              type="submit"
              disabled={saving || !input.trim()}
              className="bg-[#c9a227] hover:bg-[#e2b84e] disabled:opacity-50 text-[#0d1a08] font-bold px-5 py-2 rounded text-xs tracking-widest uppercase transition-colors"
            >
              {saving ? "Saving…" : "Add to Bank"}
            </button>
          </div>
        </form>
      </div>

      {/* Prompt list */}
      <div className="bg-[#1a2e10] border border-[#c9a227]/20 rounded-lg overflow-hidden">
        <div className="border-b border-[#c9a227]/20 px-5 py-3 flex items-center justify-between">
          <h2 className="text-xs tracking-[0.2em] uppercase text-[#c9a227] font-semibold">
            All Prompts (in queue order)
          </h2>
        </div>

        {prompts.length === 0 ? (
          <p className="text-center py-12 text-[#f0e6c8]/30 text-sm">
            No prompts in the bank yet. Add some above.
          </p>
        ) : (
          <ul className="divide-y divide-[#c9a227]/10">
            {prompts.map((p, i) => (
              <li key={p.id} className="px-5 py-4 flex gap-4 group">
                <div className="shrink-0 w-7 h-7 rounded-full border border-[#c9a227]/20 flex items-center justify-center text-xs text-[#f0e6c8]/30 font-mono">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#f0e6c8]/80 text-sm leading-relaxed">{p.promptText}</p>
                  {p.usedAt && (
                    <p className="text-[#f0e6c8]/30 text-xs mt-1">
                      Used {new Date(p.usedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                  {!p.usedAt && (
                    <span className="inline-block mt-1 text-xs text-[#2d9c6e]/60 tracking-widest uppercase">
                      Available
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="shrink-0 text-xs text-[#f0e6c8]/20 hover:text-red-400 tracking-widest uppercase transition-colors opacity-0 group-hover:opacity-100"
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
