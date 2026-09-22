import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { PostStatus } from "@/app/generated/prisma/client";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    select: { slug: true, publishedAt: true, updatedAt: true, tags: true },
    orderBy: { publishedAt: "desc" },
  });

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/post/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const allTags = [...new Set(posts.flatMap((p) => p.tags))];
  const tagUrls: MetadataRoute.Sitemap = allTags.map((tag) => ({
    url: `${SITE_URL}/tag/${tag}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/archive`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...postUrls,
    ...tagUrls,
  ];
}
