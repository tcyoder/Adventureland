import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PostType, PostStatus } from "@/app/generated/prisma/client";

export default async function AboutEditorRedirect() {
  let post = await db.post.findUnique({ where: { slug: "meet-the-admin" } });

  if (!post) {
    post = await db.post.create({
      data: {
        title: "Meet the CEO",
        slug: "meet-the-admin",
        content: "",
        type: PostType.FREE,
        status: PostStatus.DRAFT,
      },
    });
  }

  redirect(`/admin/post/${post.id}/edit`);
}
