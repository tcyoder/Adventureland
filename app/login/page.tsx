"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen bg-[#0d1a08] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Image src="/images/logo-small.png" alt="Adventure Trading Company" width={80} height={80} className="h-20 w-20 object-contain mx-auto mb-3" />
          <h1 className="font-[family-name:var(--font-josefin)] text-2xl font-bold tracking-[0.15em] text-[#f0e6c8] uppercase">
            Adventure Trading
          </h1>
          <p className="text-[#c9a227] text-xs tracking-[0.3em] uppercase mt-1">
            Company
          </p>
          <div className="mt-4 deco-divider">
            <span className="text-xs text-[#c9a227]/60 tracking-widest">SECURE ACCESS</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#1a2e10] border border-[#c9a227]/30 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2"
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
                className="w-full bg-[#0d1a08] border border-[#c9a227]/30 rounded px-4 py-3 text-[#f0e6c8] placeholder-[#f0e6c8]/20 focus:outline-none focus:border-[#c9a227] transition-colors"
                placeholder="admin"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2"
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
                className="w-full bg-[#0d1a08] border border-[#c9a227]/30 rounded px-4 py-3 text-[#f0e6c8] placeholder-[#f0e6c8]/20 focus:outline-none focus:border-[#c9a227] transition-colors"
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
              className="w-full bg-[#c9a227] hover:bg-[#e2b84e] disabled:opacity-50 text-[#0d1a08] font-bold py-3 rounded tracking-[0.1em] uppercase text-sm transition-colors"
            >
              {loading ? "Authenticating…" : "Access Terminal"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-[#f0e6c8]/20 text-xs tracking-widest">
            AUTHORIZED PERSONNEL ONLY
          </p>
          <Link href="/reset-password" className="text-[#f0e6c8]/25 hover:text-[#c9a227]/60 text-xs tracking-widest uppercase transition-colors">
            Forgot password?
          </Link>
        </div>
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
