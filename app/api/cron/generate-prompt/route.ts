import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function assignNextPrompt(weekOf: Date) {
  const bankPrompt = await db.promptBank.findFirst({
    where: { usedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  if (!bankPrompt) {
    return { error: "No prompts available in the bank. Add more prompts in the admin." };
  }

  const [prompt] = await Promise.all([
    db.weeklyPrompt.upsert({
      where: { weekOf },
      update: { promptText: bankPrompt.promptText, promptBankId: bankPrompt.id },
      create: { weekOf, promptText: bankPrompt.promptText, promptBankId: bankPrompt.id },
    }),
    db.promptBank.update({
      where: { id: bankPrompt.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { prompt };
}

// GET: called by Vercel cron (secured with x-cron-secret header)
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekOf = getWeekStart(new Date());
  const existing = await db.weeklyPrompt.findUnique({ where: { weekOf } });

  if (existing) {
    return NextResponse.json({ message: "Prompt already exists for this week", prompt: existing });
  }

  const result = await assignNextPrompt(weekOf);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ message: "Prompt assigned", prompt: result.prompt });
}

// POST: manual trigger from admin UI (requires logged-in session)
export async function POST(_request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekOf = getWeekStart(new Date());
  const result = await assignNextPrompt(weekOf);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ message: "Prompt assigned", prompt: result.prompt });
}
