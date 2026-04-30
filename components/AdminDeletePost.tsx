"use client";

import { useRouter } from "next/navigation";

export default function AdminDeletePost({ postId, postTitle }: { postId: string; postTitle: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${postTitle}"? This cannot be undone.`)) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-400/50 hover:text-red-400 tracking-widest uppercase transition-colors"
    >
      Delete
    </button>
  );
}
