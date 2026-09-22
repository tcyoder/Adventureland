import type { PostType } from "@/app/generated/prisma/enums";

type Props = { type: PostType };

export default function PostTypeBadge({ type }: Props) {
  if (type === "PROMPTED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#2d9c6e]/10 border border-[#2d9c6e]/30 text-[#2d9c6e] text-xs px-2.5 py-1 rounded-full tracking-wider font-medium">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2d9c6e] animate-pulse" />
        TRANSMISSION
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-[#c9a227]/10 border border-[#c9a227]/30 text-[#c9a227] text-xs px-2.5 py-1 rounded-full tracking-wider font-medium">
      ✍ DISPATCH
    </span>
  );
}
