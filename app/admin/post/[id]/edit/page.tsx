import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PostEditor from "@/components/PostEditor";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const post = await db.post.findUnique({
    where: { id },
    include: { prompt: true },
  });

  if (!post) notFound();

  return <PostEditor post={post} />;
}
