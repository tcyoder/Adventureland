import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const username = session.user?.name ?? "";
    const dbCreds = await db.adminCredentials.findUnique({ where: { username } });

    let currentHash: string;
    if (dbCreds) {
      currentHash = dbCreds.passwordHash;
    } else {
      // Fall back to env var hash if DB not seeded yet
      currentHash = process.env.ADMIN_PASSWORD_HASH ?? "";
    }

    const isValid = await bcrypt.compare(currentPassword, currentHash);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

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
