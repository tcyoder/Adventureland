import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { PostStatus } from "@/app/generated/prisma/client";
import PostCard from "@/components/PostCard";
import PostFilters from "@/components/PostFilters";
import SiteHeader from "@/components/SiteHeader";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: { url: SITE_URL },
  alternates: { canonical: SITE_URL },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  const where: Record<string, unknown> = { status: PostStatus.PUBLISHED };
  if (type === "PROMPTED" || type === "FREE") where.type = type;

  const posts = await db.post.findMany({
    where,
    include: { prompt: true },
    orderBy: { publishedAt: "desc" },
    take: 5,
  });

  const viewMoreHref = type ? `/archive?type=${type}` : "/archive";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero stripe */}
      <div className="border-y border-[#c9a227]/30 bg-gradient-to-r from-[#0d1a08] via-[#1a2e10] to-[#0d1a08] py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="deco-divider mb-4">
            <span className="text-xs tracking-[0.3em] uppercase text-[#c9a227]">
              Bulletins from the Jungle
            </span>
          </div>
          <p className="text-[#f0e6c8]/60 text-sm max-w-xl mx-auto">
            Dispatches and transmissions from Adventureland — where the rivers run deep,
            the skippers spin tall tales, and every trading post hides a secret.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:py-12">
        <PostFilters activeType={type} />

        {posts.length === 0 ? (
          <div className="text-center py-20 text-[#f0e6c8]/40">
            <Image
              src="/images/logo-small.png"
              alt=""
              width={80}
              height={80}
              className="h-16 w-auto mx-auto mb-4 opacity-30"
            />
            <p className="text-lg">No dispatches yet.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href={viewMoreHref}
                className="inline-block px-8 py-3 border border-[#c9a227]/40 text-[#c9a227] text-xs tracking-[0.25em] uppercase hover:bg-[#c9a227]/10 hover:border-[#c9a227] transition-all"
              >
                View More →
              </Link>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-[#c9a227]/20 py-8 text-center text-[#f0e6c8]/30 text-xs tracking-widest">
        <div className="flex justify-center mb-3">
          <Link href="/login" className="opacity-30 hover:opacity-60 transition-opacity">
            <Image src="/images/logo-small.png" alt="" width={40} height={40} className="h-10 w-auto" />
          </Link>
        </div>
        <div className="mb-4 flex items-center justify-center gap-3 flex-wrap">
          <a href="https://bsky.app" target="_blank" rel="noopener noreferrer" className="hover:text-[#c9a227] transition-colors uppercase tracking-widest">
            Bluesky
          </a>
          <span className="text-[#c9a227]/30">·</span>
          <a href="mailto:N.Litened@proton.me" className="hover:text-[#c9a227] transition-colors uppercase tracking-widest">
            Contact
          </a>
          <span className="text-[#c9a227]/30">·</span>
          <a href="https://buttondown.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#c9a227] transition-colors uppercase tracking-widest">
            Subscribe
          </a>
          <span className="text-[#c9a227]/30">·</span>
          <a href="/feed.xml" title="RSS Feed" className="hover:text-[#c9a227] transition-colors uppercase tracking-widest">
            RSS
          </a>
        </div>
        ADVENTURE TRADING COMPANY · EST. IN THE HEART OF THE JUNGLE · ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
