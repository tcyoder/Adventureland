import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-[#b87333]/30 bg-[#0d1b2a]">
      <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="group flex flex-col">
          <span className="font-[family-name:var(--font-josefin)] text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.1em] sm:tracking-[0.12em] text-[#faf6f0] group-hover:text-[#d4945a] transition-colors uppercase leading-none">
            Tomorrowland
          </span>
          <span className="text-[#b87333] text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase font-medium">
            Light &amp; Power Co.
          </span>
        </Link>

        <div className="flex items-center gap-3 text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.2em] uppercase text-[#faf6f0]/40">
          <Link href="/about" className="hover:text-[#b87333] transition-colors">
            Meet the Admin
          </Link>
          <span className="text-[#b87333]/30">·</span>
          <a href="/feed.xml" title="RSS Feed" className="hover:text-[#b87333] transition-colors">
            RSS
          </a>
          <span className="text-[#b87333]/30">·</span>
          <Link href="/admin" className="hover:text-[#b87333] transition-colors">
            ⚙
          </Link>
        </div>
      </div>
    </header>
  );
}
