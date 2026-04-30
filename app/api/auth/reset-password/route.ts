import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resetSecret = process.env.RESET_SECRET;
    if (!resetSecret) {
      return NextResponse.json({ error: "Reset not configured" }, { status: 503 });
    }

    // Constant-time comparison to prevent timing attacks
    const { timingSafeEqual } = await import("crypto");
    const tokenBuf = Buffer.from(token);
    const secretBuf = Buffer.from(resetSecret);
    const match =
      tokenBuf.length === secretBuf.length && timingSafeEqual(tokenBuf, secretBuf);

    if (!match) {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 403 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const username = process.env.ADMIN_USERNAME ?? "admin";

    await db.adminCredentials.upsert({
      where: { username },
      update: { passwordHash },
      create: { username, passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
