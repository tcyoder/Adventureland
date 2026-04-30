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
            className={`px-4 py-2 rounded-full text-xs tracking-[0.15em] uppercase border transition-all ${
              isActive
                ? "bg-[#b87333] border-[#b87333] text-[#0d1b2a] font-bold"
                : "border-[#b87333]/30 text-[#faf6f0]/60 hover:border-[#b87333]/60 hover:text-[#faf6f0]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
