import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { PostStatus } from "@/app/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const post = await db.post.findUnique({
    where: { id },
    include: { prompt: true },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { title, content, excerpt, status, coverImage, slug: customSlug } = body;

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let slug = existing.slug;
  if (customSlug && customSlug !== existing.slug) {
    const newSlug = slugify(customSlug);
    const conflict = await db.post.findFirst({
      where: { slug: newSlug, NOT: { id } },
    });
    slug = conflict ? existing.slug : newSlug;
  } else if (title && title !== existing.title && !customSlug) {
    // auto-update slug only if title changed and no custom slug given
  }

  const wasPublished = existing.status === PostStatus.PUBLISHED;
  const nowPublishing = status === PostStatus.PUBLISHED;

  const post = await db.post.update({
    where: { id },
    data: {
      ...(title && { title }),
      slug,
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(status && { status: status as PostStatus }),
      ...(coverImage !== undefined && { coverImage }),
      publishedAt:
        nowPublishing && !wasPublished
          ? new Date()
          : status === PostStatus.DRAFT
          ? null
          : existing.publishedAt,
    },
    include: { prompt: true },
  });

  return NextResponse.json(post);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
