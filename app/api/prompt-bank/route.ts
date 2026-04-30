import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [prompts, total, unused] = await Promise.all([
    db.promptBank.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.promptBank.count(),
    db.promptBank.count({ where: { usedAt: null } }),
  ]);

  return NextResponse.json({ prompts, total, unused });
}

// Add one or more prompts to the bank
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  // Accept either a single prompt or an array
  const items: { promptText: string; theme?: string }[] = Array.isArray(body)
    ? body
    : [body];

  if (!items.length) {
    return NextResponse.json({ error: "No prompts provided" }, { status: 400 });
  }

  // Get current max sortOrder
  const last = await db.promptBank.findFirst({ orderBy: { sortOrder: "desc" } });
  const startOrder = (last?.sortOrder ?? -1) + 1;

  const created = await db.promptBank.createMany({
    data: items.map((item, i) => ({
      promptText: item.promptText.trim(),
      theme: item.theme?.trim() || null,
      sortOrder: startOrder + i,
    })),
  });

  return NextResponse.json({ created: created.count }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.promptBank.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
