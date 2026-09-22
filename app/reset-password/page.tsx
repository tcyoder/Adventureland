"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Reset failed.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1a08] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Image src="/images/logo-small.png" alt="Adventure Trading Company" width={80} height={80} className="h-20 w-20 object-contain mx-auto mb-3" />
          <h1 className="font-[family-name:var(--font-josefin)] text-2xl font-bold tracking-[0.15em] text-[#f0e6c8] uppercase">
            Adventure Trading
          </h1>
          <p className="text-[#c9a227] text-xs tracking-[0.3em] uppercase mt-1">
            Company
          </p>
          <div className="mt-4 deco-divider">
            <span className="text-xs text-[#c9a227]/60 tracking-widest">EMERGENCY RESET</span>
          </div>
        </div>

        <div className="bg-[#1a2e10] border border-[#c9a227]/30 rounded-lg p-8">
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-green-400 text-sm">Password updated successfully.</p>
              <Link
                href="/login"
                className="inline-block bg-[#c9a227] hover:bg-[#e2b84e] text-[#0d1a08] font-bold py-3 px-6 rounded tracking-[0.1em] uppercase text-sm transition-colors"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="token"
                  className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2"
                >
                  Reset Token
                </label>
                <input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full bg-[#0d1a08] border border-[#c9a227]/30 rounded px-4 py-3 text-[#f0e6c8] placeholder-[#f0e6c8]/20 focus:outline-none focus:border-[#c9a227] transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full bg-[#0d1a08] border border-[#c9a227]/30 rounded px-4 py-3 text-[#f0e6c8] placeholder-[#f0e6c8]/20 focus:outline-none focus:border-[#c9a227] transition-colors"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm"
                  className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
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
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/login" className="text-[#f0e6c8]/30 hover:text-[#f0e6c8]/60 text-xs tracking-widest uppercase transition-colors">
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
