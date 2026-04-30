import { db } from "@/lib/db";
import PromptBankManager from "@/components/PromptBankManager";

export const dynamic = "force-dynamic";

export default async function AdminPromptsPage() {
  const [prompts, total, unused] = await Promise.all([
    db.promptBank.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.promptBank.count(),
    db.promptBank.count({ where: { usedAt: null } }),
  ]);

  return <PromptBankManager prompts={prompts} total={total} unused={unused} />;
}
