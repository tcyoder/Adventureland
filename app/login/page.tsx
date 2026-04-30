"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid username or password.");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-[#b87333] text-5xl mb-3">⚙</div>
          <h1 className="font-[family-name:var(--font-josefin)] text-2xl font-bold tracking-[0.15em] text-[#faf6f0] uppercase">
            Tomorrowland
          </h1>
          <p className="text-[#b87333] text-xs tracking-[0.3em] uppercase mt-1">
            Light &amp; Power Co.
          </p>
          <div className="mt-4 deco-divider">
            <span className="text-xs text-[#b87333]/60 tracking-widest">SECURE ACCESS</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#1a2f45] border border-[#b87333]/30 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs tracking-[0.2em] uppercase text-[#b87333] mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full bg-[#0d1b2a] border border-[#b87333]/30 rounded px-4 py-3 text-[#faf6f0] placeholder-[#faf6f0]/20 focus:outline-none focus:border-[#b87333] transition-colors"
                placeholder="admin"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs tracking-[0.2em] uppercase text-[#b87333] mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-[#0d1b2a] border border-[#b87333]/30 rounded px-4 py-3 text-[#faf6f0] placeholder-[#faf6f0]/20 focus:outline-none focus:border-[#b87333] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b87333] hover:bg-[#d4945a] disabled:opacity-50 text-[#0d1b2a] font-bold py-3 rounded tracking-[0.1em] uppercase text-sm transition-colors"
            >
              {loading ? "Authenticating…" : "Access Terminal"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#faf6f0]/20 text-xs mt-6 tracking-widest">
          AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
