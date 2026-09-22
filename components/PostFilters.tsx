"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { activeType?: string };

const filters = [
  { label: "All", value: undefined },
  { label: "◉ Transmissions", value: "PROMPTED" },
  { label: "✍ Dispatches", value: "FREE" },
];

export default function PostFilters({ activeType }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 mb-8 flex-wrap">
      {filters.map(({ label, value }) => {
        const href = value ? `${pathname}?type=${value}` : pathname;
        const isActive = activeType === value;

        return (
          <Link
            key={label}
            href={href}
            className={`px-3 py-3 rounded-full text-xs tracking-[0.15em] uppercase border transition-all ${
              isActive
                ? "bg-[#c9a227] border-[#c9a227] text-[#0d1a08] font-bold"
                : "border-[#c9a227]/30 text-[#f0e6c8]/60 hover:border-[#c9a227]/60 hover:text-[#f0e6c8]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
