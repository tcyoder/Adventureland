"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { Post, WeeklyPrompt } from "@/app/generated/prisma/client";

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

type PostWithPrompt = Post & { prompt: WeeklyPrompt | null };

type Props = {
  post?: PostWithPrompt | null;
  promptId?: string | null;
  prompt?: WeeklyPrompt | null;
  defaultType?: PostType;
};

export default function PostEditor({ post, promptId, prompt, defaultType }: Props) {
  const router = useRouter();
  const isNew = !post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [type] = useState<PostType>((post?.type ?? defaultType) || PostType.FREE);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const autoSlugRef = useRef(true);

  // Auto-generate slug from title for new posts
  useEffect(() => {
    if (isNew && autoSlugRef.current && title) {
      setSlug(slugify(title));
    }
  }, [title, isNew]);

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
        promptId: promptId ?? post?.promptId ?? null,
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
    [title, slug, excerpt, content, coverImage, tags, type, promptId, post, isNew, router]
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-josefin)] text-2xl font-bold tracking-wide text-[#faf6f0]">
            {isNew ? "New Post" : "Edit Post"}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-[#faf6f0]/40">
            <span
              className={`px-2 py-0.5 rounded border ${
                type === "PROMPTED"
                  ? "border-[#2dd4bf]/30 text-[#2dd4bf]"
                  : "border-[#b87333]/30 text-[#b87333]"
              }`}
            >
              {type === "PROMPTED" ? "◉ Transmission" : "✍ Dispatch"}
            </span>
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
              <span className="text-[#faf6f0]/30">
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
            className="px-4 py-2 border border-[#b87333]/50 text-[#b87333] rounded text-xs tracking-widest uppercase hover:bg-[#b87333]/10 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            onClick={() => savePost(PostStatus.PUBLISHED)}
            disabled={saving || !title || !content}
            className="px-4 py-2 bg-[#b87333] hover:bg-[#d4945a] text-[#0d1b2a] font-bold rounded text-xs tracking-widest uppercase transition-colors disabled:opacity-50"
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

      {/* Prompt reference panel */}
      {(prompt ?? post?.prompt) && (
        <div className="mb-6 bg-[#1a2f45] border border-[#2dd4bf]/20 rounded-lg p-4">
          <div className="text-[#2dd4bf] text-xs tracking-[0.2em] uppercase font-semibold mb-2">
            ◉ Writing Prompt
          </div>
          <p className="text-[#faf6f0]/70 italic text-sm leading-relaxed">
            {(prompt ?? post?.prompt)?.promptText}
          </p>
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#b87333] mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title…"
            className="w-full bg-[#0d1b2a] border border-[#b87333]/30 rounded px-4 py-3 text-[#faf6f0] placeholder-[#faf6f0]/20 focus:outline-none focus:border-[#b87333] font-[family-name:var(--font-josefin)] text-xl tracking-wide transition-colors"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#b87333] mb-2">
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
            className="w-full bg-[#0d1b2a] border border-[#b87333]/30 rounded px-4 py-2.5 text-[#faf6f0]/80 placeholder-[#faf6f0]/20 focus:outline-none focus:border-[#b87333] text-sm font-mono transition-colors"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#b87333] mb-2">
            Excerpt <span className="text-[#faf6f0]/30 normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Short summary shown in post lists…"
            className="w-full bg-[#0d1b2a] border border-[#b87333]/30 rounded px-4 py-2.5 text-[#faf6f0]/80 placeholder-[#faf6f0]/20 focus:outline-none focus:border-[#b87333] text-sm resize-none transition-colors"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#b87333] mb-2">
            Tags <span className="text-[#faf6f0]/30 normal-case tracking-normal">(optional — press Enter or comma to add)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1a2f45] border border-[#b87333]/30 rounded text-xs text-[#b87333] tracking-wide"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-[#faf6f0]/30 hover:text-red-400 transition-colors leading-none"
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
            className="w-full bg-[#0d1b2a] border border-[#b87333]/30 rounded px-4 py-2.5 text-[#faf6f0]/80 placeholder-[#faf6f0]/20 focus:outline-none focus:border-[#b87333] text-sm transition-colors"
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#b87333] mb-2">
            Cover Image <span className="text-[#faf6f0]/30 normal-case tracking-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            <label className="cursor-pointer bg-[#1a2f45] border border-[#b87333]/30 hover:border-[#b87333] rounded px-4 py-2.5 text-xs tracking-widest uppercase text-[#faf6f0]/60 hover:text-[#faf6f0] transition-colors">
              {uploading ? "Uploading…" : "Upload"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          {coverImage && (
            <img src={coverImage} alt="Cover preview" className="mt-2 h-24 rounded object-cover border border-[#b87333]/20" />
          )}
        </div>

        {/* Content editor */}
        <div>
          <label className="block text-xs tracking-[0.2em] uppercase text-[#b87333] mb-2">
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
