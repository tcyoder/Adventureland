import SiteHeader from "@/components/SiteHeader";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Meet the Admin — Tomorrowland Light & Power Co.",
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
            <span className="text-[#b87333] text-xs tracking-[0.25em] uppercase font-semibold border border-[#b87333]/40 px-2 py-0.5 rounded">
              Dispatch
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-josefin)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-[#faf6f0] mb-4 leading-tight">
            Meet the Admin
          </h1>

          <div className="h-px bg-gradient-to-r from-[#b87333] via-[#d4945a] to-transparent" />
        </div>

        {/* Body */}
        {post?.content ? (
          <article
            className="tiptap-content text-[#faf6f0]/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-[#faf6f0]/40 italic">
            No introduction written yet. Visit the admin dashboard to add one.
          </p>
        )}
      </main>

      <footer className="border-t border-[#b87333]/20 py-6 text-center text-[#faf6f0]/30 text-xs tracking-widest">
        TOMORROWLAND LIGHT &amp; POWER CO.
      </footer>
    </div>
  );
}
