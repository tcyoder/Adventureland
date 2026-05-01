import { db } from "@/lib/db";
import { PostStatus } from "@/app/generated/prisma/client";

const SITE_URL = "https://tomorrowlandlightandpowerco.vercel.app";
const SITE_NAME = "Tomorrowland Light & Power Co.";
const SITE_DESCRIPTION =
  "Stories and dispatches from New Tomorrowland 1994 — headquarters of the League of Planets, where the future never quite arrived.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await db.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/post/${post.slug}`;
      const pubDate = (post.publishedAt ?? post.updatedAt).toUTCString();
      const description = post.excerpt
        ? escapeXml(post.excerpt)
        : "A story from Tomorrowland Light &amp; Power Co.";
      const coverImage = post.coverImage
        ? `<enclosure url="${escapeXml(post.coverImage)}" type="image/jpeg"/>`
        : "";

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      ${coverImage}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
