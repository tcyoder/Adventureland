import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { PostType, PostStatus } from "@/app/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const publicOnly = searchParams.get("public") === "true";

  const where: Record<string, unknown> = {};

  if (publicOnly) {
    where.status = PostStatus.PUBLISHED;
  } else {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (status) where.status = status as PostStatus;
  }

  if (type) where.type = type as PostType;

  const posts = await db.post.findMany({
    where,
    include: { prompt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, excerpt, type, status, promptId, coverImage, slug: customSlug } = body;

  if (!title || !content || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const baseSlug = customSlug || slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (await db.post.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const post = await db.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      type: type as PostType,
      status: (status as PostStatus) || PostStatus.DRAFT,
      promptId: promptId || null,
      coverImage: coverImage || null,
      publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
    },
    include: { prompt: true },
  });

  return NextResponse.json(post, { status: 201 });
}
