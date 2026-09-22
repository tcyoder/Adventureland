"use client";

import { useState, FormEvent } from "react";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } else {
      const data = await res.json();
      setError(data.error ?? "Change failed.");
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="font-[family-name:var(--font-josefin)] text-2xl font-bold tracking-[0.1em] text-[#f0e6c8] uppercase mb-8">
        Change Password
      </h1>

      <div className="bg-[#1a2e10] border border-[#c9a227]/30 rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-xs tracking-[0.2em] uppercase text-[#c9a227] mb-2"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
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
              Confirm New Password
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

          {success && (
            <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded px-3 py-2">
              Password updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c9a227] hover:bg-[#e2b84e] disabled:opacity-50 text-[#0d1a08] font-bold py-3 rounded tracking-[0.1em] uppercase text-sm transition-colors"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
