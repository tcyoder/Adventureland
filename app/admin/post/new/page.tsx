import { db } from "@/lib/db";
import PostEditor from "@/components/PostEditor";

export default async function NewPostPage() {
  const bankPrompts = await db.promptBank.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return <PostEditor post={null} initialBankPrompts={bankPrompts} />;
}
