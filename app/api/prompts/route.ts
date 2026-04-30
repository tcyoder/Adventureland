import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const weekOf = getWeekStart(new Date());

  const prompt = await db.weeklyPrompt.findUnique({
    where: { weekOf },
    include: { posts: { select: { id: true, title: true, slug: true, status: true } } },
  });

  return NextResponse.json(prompt);
}
