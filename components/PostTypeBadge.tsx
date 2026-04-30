import type { PostType } from "@/app/generated/prisma/enums";

type Props = { type: PostType };

export default function PostTypeBadge({ type }: Props) {
  if (type === "PROMPTED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 text-[#2dd4bf] text-xs px-2.5 py-1 rounded-full tracking-wider font-medium">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-pulse" />
        TRANSMISSION
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-[#b87333]/10 border border-[#b87333]/30 text-[#b87333] text-xs px-2.5 py-1 rounded-full tracking-wider font-medium">
      ✍ DISPATCH
    </span>
  );
}
