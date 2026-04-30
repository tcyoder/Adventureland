import { db } from "@/lib/db";
import { PostType } from "@/app/generated/prisma/client";
import PostEditor from "@/components/PostEditor";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ promptId?: string; type?: string }>;
}) {
  const { promptId, type } = await searchParams;

  let prompt = null;
  if (promptId) {
    prompt = await db.weeklyPrompt.findUnique({ where: { id: promptId } });
  }

  const defaultType: PostType =
    type === "PROMPTED" ? PostType.PROMPTED : type === "FREE" ? PostType.FREE : PostType.FREE;

  return (
    <PostEditor
      post={null}
      promptId={promptId || null}
      prompt={prompt}
      defaultType={defaultType}
    />
  );
}
