import Link from "next/link";
import Image from "next/image";

export default function SiteHeader() {
  return (
    <header className="border-b border-[#c9a227]/30 bg-[#0d1a08]">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/images/logo-small.png"
            alt="Adventure Trading Company"
            width={100}
            height={100}
            className="h-10 w-auto"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-[family-name:var(--font-josefin)] text-base sm:text-lg font-bold tracking-[0.1em] text-[#f0e6c8] group-hover:text-[#e2b84e] transition-colors uppercase">
              Adventure Trading
            </span>
            <span className="text-[#c9a227] text-[9px] sm:text-[10px] tracking-[0.3em] uppercase">
              Company
            </span>
          </div>
        </Link>

        <div className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#f0e6c8]/40">
          <Link href="/about" className="hover:text-[#c9a227] transition-colors">
            Meet the CEO
          </Link>
        </div>
      </div>
    </header>
  );
}
