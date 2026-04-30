"use client";

import { signOut } from "next-auth/react";

export default function AdminSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-[#faf6f0]/40 hover:text-red-400 tracking-widest uppercase transition-colors"
    >
      Sign Out
    </button>
  );
}
