import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminSignOut from "@/components/AdminSignOut";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#0f1923] text-[#faf6f0]">
      {/* Admin header */}
      <header className="bg-[#0d1b2a] border-b border-[#b87333]/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-[#b87333] font-bold tracking-widest text-sm uppercase">
            ⚙ Control Room
          </Link>
          <nav className="hidden sm:flex gap-4 text-xs tracking-widest uppercase text-[#faf6f0]/50">
            <Link href="/admin" className="hover:text-[#faf6f0] transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/posts" className="hover:text-[#faf6f0] transition-colors">
              All Posts
            </Link>
            <Link href="/admin/post/new" className="hover:text-[#faf6f0] transition-colors">
              New Post
            </Link>
            <Link href="/admin/prompts" className="hover:text-[#faf6f0] transition-colors">
              Prompt Bank
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/" className="text-[#faf6f0]/40 hover:text-[#faf6f0] tracking-widest uppercase transition-colors">
            View Site →
          </Link>
          <AdminSignOut />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
