import SiteHeader from "@/components/SiteHeader";
import Image from "next/image";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Meet the CEO",
  description: "The official record of the head trader and expedition leader of the Adventure Trading Company.",
  openGraph: {
    title: "Meet the CEO",
    description: "The official record of the head trader and expedition leader of the Adventure Trading Company.",
    url: "/about",
    images: [{ url: "/images/admin-portrait.png", alt: "Official portrait of the head trader" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meet the CEO",
    description: "The official record of the head trader and expedition leader of the Adventure Trading Company.",
    images: ["/images/admin-portrait.png"],
  },
};

export default async function AboutPage() {
  const post = await db.post.findUnique({ where: { slug: "meet-the-admin" } });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#c9a227] text-xs tracking-[0.25em] uppercase font-semibold border border-[#c9a227]/40 px-2 py-0.5 rounded">
              Dispatch
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-josefin)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-[#f0e6c8] mb-4 leading-tight">
            Meet the CEO
          </h1>

          <div className="h-px bg-gradient-to-r from-[#c9a227] via-[#e2b84e] to-transparent" />
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/images/logo-big.png"
            alt="Adventure Trading Company"
            width={880}
            height={744}
            className="w-full max-w-sm h-auto"
          />
        </div>

        {/* Body */}
        {post?.content ? (
          <article
            className="tiptap-content text-[#f0e6c8]/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-[#f0e6c8]/40 italic">
            No introduction written yet. Visit the admin dashboard to add one.
          </p>
        )}
      </main>

      <footer className="border-t border-[#c9a227]/20 py-6 text-center text-[#f0e6c8]/30 text-xs tracking-widest">
        ADVENTURE TRADING COMPANY
      </footer>
    </div>
  );
}
