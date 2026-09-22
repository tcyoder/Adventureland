"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { Post, WeeklyPrompt, PromptBank } from "@/app/generated/prisma/client";

// Use string literal types to avoid importing Prisma runtime in the browser
type PostType = "PROMPTED" | "FREE";
type PostStatus = "DRAFT" | "PUBLISHED";
const PostType = { PROMPTED: "PROMPTED" as const, FREE: "FREE" as const };
const PostStatus = { DRAFT: "DRAFT" as const, PUBLISHED: "PUBLISHED" as const };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const RichTextEditor = dynamic(() => import("@/components/Editor/RichTextEditor"), { ssr: false });

type PostWithPrompt = Post & {
  prompt: WeeklyPrompt | null;
  bankPrompt: PromptBank | null;
};

type Props = {
  post?: PostWithPrompt | null;
  initialBankPrompts?: PromptBank[];
};

export default function PostEditor({ post, initialBankPrompts = [] }: Props) {
  const router = useRouter();
  const isNew = !post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const DEFAULT_TAGS = [
    "walt-disney-world",
    "adventureland",
    "magic-kingdom",
    "disneyland",
    "jungle-cruise",
    "skipper-tales",
    "pirates",
    "tiki-room",
    "swiss-family-treehouse",
    "adventure-trading-company",
    "blog",
    "creative-writing",
    "short-fiction",
    "exploration",
    "jungle-adventure",
    "river-expedition",
    "worldbuilding",
  ];
  const [tags, setTags] = useState<string[]>(post?.tags.length ? post.tags : DEFAULT_TAGS);
  const [tagInput, setTagInput] = useState("");
  const [type, setType] = useState<PostType>((post?.type as PostType) ?? PostType.FREE);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptBank | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const autoSlugRef = useRef(true);

  // The prompt to display in the reference panel
  const displayPrompt: { promptText: string } | null =
    selectedPrompt ?? post?.bankPrompt ?? post?.prompt ?? null;

  // Auto-generate slug from title for new posts
  useEffect(() => {
    if (isNew && autoSlugRef.current && title) {
      setSlug(slugify(title));
    }
  }, [title, isNew]);

  // Clear selected prompt when switching away from Transmission
  useEffect(() => {
    if (type === PostType.FREE) setSelectedPrompt(null);
  }, [type]);

  // Debounced auto-save
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savePost = useCallback(
    async (status?: PostStatus) => {
      if (!title) return;
      setSaving(true);
      setError("");

      const body = {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        tags,
        type,
        status: status ?? post?.status ?? PostStatus.DRAFT,
        promptBankId: selectedPrompt?.id ?? post?.promptBankId ?? null,
        promptId: post?.promptId ?? null,
      };

      try {
        let res: Response;
        if (isNew) {
          res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        } else {
          res = await fetch(`/api/posts/${post!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        }

        if (!res.ok) throw new Error("Save failed");

        const saved = await res.json();
        setLastSaved(new Date());

        if (isNew) {
          router.push(`/admin/post/${saved.id}/edit`);
        } else {
          router.refresh();
        }
      } catch {
        setError("Failed to save. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [title, slug, excerpt, content, coverImage, tags, type, selectedPrompt, post, isNew, router]
  );

  // Auto-save every 30s when content changes
  useEffect(() => {
    if (!title || isNew) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      savePost();
    }, 30000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, slug, excerpt, content, coverImage, tags, savePost, isNew]);

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setCoverImage(data.url);
      else setError(data.error || "Upload failed.");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleUnpublish() {
    await savePost(PostStatus.DRAFT);
  }

  async function handleDelete() {
    if (!post) return;
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    router.push("/admin/posts");
  }

  const unusedPrompts = initialBankPrompts.filter((p) => !p.usedAt);
  const usedPrompts = initialBankPrompts.filter((p) => p.usedAt);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-josefin)] text-2xl font-bold tracking-wide text-[#f0e6c8]">
            {isNew ? "New Post" : "Edit Post"}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-[#f0e6c8]/40">
            {/* Type badge — display-only for existing posts */}
            {!isNew && (
              <span
                className={`px-2 py-0.5 rounded border ${
                  type === "PROMPTED"
                    ? "border-[#2d9c6e]/30 text-[#2d9c6e]"
                    : "border-[#c9a227]/30 text-[#c9a227]"
                }`}
              >
                {type === "PROMPTED" ? "◉ Transmission" : "✍ Dispatch"}
              </span>
            )}
            {post?.status && (
              <span
                className={`px-2 py-0.5 rounded border ${
                  post.status === "PUBLISHED"
                    ? "border-green-500/30 text-green-400"
                    : "border-yellow-500/30 text-yellow-400"
                }`}
              >
                {post.status}
              </span>
            )}
            {lastSaved && (
              <span className="text-[#f0e6c8]/30">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {post?.status === "PUBLISHED" && (
            <button
              onClick={handleUnpublish}
              disabled={saving}
              className="px-4 py-2 border border-yellow-500/30 text-yellow-400 rounded text-xs tracking-widest uppercase hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
            >
              Unpublish
            </button>
          )}
          {post && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-500/30 text-red-400 rounded text-xs tracking-widest uppercase hover:bg-red-500/10 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => savePost(PostStatus.DRAFT)}
            disabled={saving || !title}
            className="px-4 py-2 border border-[#c9a227]/50 text-[#c9a227] rounded text-xs tracking-widest uppercase hover:bg-[#c9a227]/10 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            onClick={() => savePost(PostStatus.PUBLISHED)}
            disabled={saving || !title || !content}
            className="px-4 py-2 bg-[#c9a227] hover:bg-[#e2b84e] text-[#0d1a08] font-bold rounded text-xs tracking-widest uppercase transition-colors disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-400/10 border border-red-400/20 rounded px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Type toggle — new posts only */}
      {isNew && (
        <div className="mb-6">
          <label className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2">
            Post Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType(PostType.FREE)}
              className={`px-5 py-2.5 rounded-full text-xs tracking-[0.15em] uppercase border transition-all ${
                type === PostType.FREE
                  ? "bg-[#c9a227] border-[#c9a227] text-[#0d1a08] font-bold"
                  : "border-[#c9a227]/30 text-[#f0e6c8]/60 hover:border-[#c9a227]/60 hover:text-[#f0e6c8]"
              }`}
            >
              ✍ Dispatch
            </button>
            <button
              type="button"
              onClick={() => setType(PostType.PROMPTED)}
              className={`px-5 py-2.5 rounded-full text-xs tracking-[0.15em] uppercase border transition-all ${
                type === PostType.PROMPTED
                  ? "bg-[#2d9c6e] border-[#2d9c6e] text-[#0d1a08] font-bold"
                  : "border-[#2d9c6e]/30 text-[#f0e6c8]/60 hover:border-[#2d9c6e]/60 hover:text-[#f0e6c8]"
              }`}
            >
              ◉ Transmission
            </button>
          </div>
        </div>
      )}

      {/* Prompt picker — new Transmissions only */}
      {isNew && type === PostType.PROMPTED && (
        <div className="mb-6 bg-[#1a2e10] border border-[#2d9c6e]/20 rounded-lg p-4">
          <div className="text-[#2d9c6e] text-xs tracking-[0.2em] uppercase font-semibold mb-3">
            ◉ Choose a Writing Prompt
          </div>

          {initialBankPrompts.length === 0 ? (
            <p className="text-[#f0e6c8]/40 text-sm">
              No prompts in the bank.{" "}
              <a href="/admin/prompts" className="underline text-[#c9a227] hover:text-[#e2b84e]">
                Add some →
              </a>
            </p>
          ) : (
            <>
              {unusedPrompts.length > 0 && (
                <div className="mb-4">
                  <div className="text-[#f0e6c8]/30 text-[10px] tracking-widest uppercase mb-2">Available</div>
                  <div className="space-y-2">
                    {unusedPrompts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPrompt(selectedPrompt?.id === p.id ? null : p)}
                        className={`w-full text-left px-4 py-3 rounded border text-sm leading-relaxed transition-all ${
                          selectedPrompt?.id === p.id
                            ? "border-[#2d9c6e] bg-[#2d9c6e]/10 text-[#f0e6c8]"
                            : "border-[#2d9c6e]/20 text-[#f0e6c8]/70 hover:border-[#2d9c6e]/50 hover:text-[#f0e6c8]"
                        }`}
                      >
                        {p.promptText}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {usedPrompts.length > 0 && (
                <div>
                  <div className="text-[#f0e6c8]/30 text-[10px] tracking-widest uppercase mb-2">Previously Used</div>
                  <div className="space-y-2">
                    {usedPrompts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPrompt(selectedPrompt?.id === p.id ? null : p)}
                        className={`w-full text-left px-4 py-3 rounded border text-sm leading-relaxed transition-all ${
                          selectedPrompt?.id === p.id
                            ? "border-[#2d9c6e] bg-[#2d9c6e]/10 text-[#f0e6c8]"
                            : "border-[#c9a227]/10 text-[#f0e6c8]/40 hover:border-[#c9a227]/30 hover:text-[#f0e6c8]/70"
                        }`}
                      >
                        {p.promptText}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Prompt reference panel — shows selected prompt or existing post's prompt */}
      {!isNew && displayPrompt && (
        <div className="mb-6 bg-[#1a2e10] border border-[#2d9c6e]/20 rounded-lg p-4">
          <div className="text-[#2d9c6e] text-xs tracking-[0.2em] uppercase font-semibold mb-2">
            ◉ Writing Prompt
          </div>
          <p className="text-[#f0e6c8]/70 italic text-sm leading-relaxed">
            {displayPrompt.promptText}
          </p>
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title…"
            className="w-full bg-[#0d1a08] border border-[#c9a227]/30 rounded px-4 py-3 text-[#f0e6c8] placeholder-[#f0e6c8]/20 focus:outline-none focus:border-[#c9a227] font-[family-name:var(--font-josefin)] text-xl tracking-wide transition-colors"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              autoSlugRef.current = false;
              setSlug(e.target.value);
            }}
            placeholder="post-slug-here"
            className="w-full bg-[#0d1a08] border border-[#c9a227]/30 rounded px-4 py-2.5 text-[#f0e6c8]/80 placeholder-[#f0e6c8]/20 focus:outline-none focus:border-[#c9a227] text-sm font-mono transition-colors"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2">
            Excerpt <span className="text-[#f0e6c8]/30 normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Short summary shown in post lists…"
            className="w-full bg-[#0d1a08] border border-[#c9a227]/30 rounded px-4 py-2.5 text-[#f0e6c8]/80 placeholder-[#f0e6c8]/20 focus:outline-none focus:border-[#c9a227] text-sm resize-none transition-colors"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2">
            Tags <span className="text-[#f0e6c8]/30 normal-case tracking-normal">(optional — press Enter or comma to add)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1a2e10] border border-[#c9a227]/30 rounded text-xs text-[#c9a227] tracking-wide"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-[#f0e6c8]/30 hover:text-red-400 transition-colors leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
            placeholder="walt-disney-world, fan-fiction, sci-fi…"
            className="w-full bg-[#0d1a08] border border-[#c9a227]/30 rounded px-4 py-2.5 text-[#f0e6c8]/80 placeholder-[#f0e6c8]/20 focus:outline-none focus:border-[#c9a227] text-sm transition-colors"
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2">
            Cover Image <span className="text-[#f0e6c8]/30 normal-case tracking-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            <label className="cursor-pointer bg-[#1a2e10] border border-[#c9a227]/30 hover:border-[#c9a227] rounded px-4 py-2.5 text-xs tracking-widest uppercase text-[#f0e6c8]/60 hover:text-[#f0e6c8] transition-colors">
              {uploading ? "Uploading…" : "Upload"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          {coverImage && (
            <img src={coverImage} alt="Cover preview" className="mt-2 h-24 rounded object-cover border border-[#c9a227]/20" />
          )}
        </div>

        {/* Content editor */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2">
            Content *
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder={type === "PROMPTED" ? "Write your story in response to the prompt above…" : "Begin your dispatch…"}
          />
        </div>
      </div>
    </div>
  );
}
