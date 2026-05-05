"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      router.push("/");
    } else {
      setConfirmSent(true);
      setLoading(false);
    }
  }

  if (confirmSent) {
    return (
      <div className="min-h-dvh bg-(--color-surface) flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-5">📬</div>
          <h2 className="text-xl font-semibold text-(--color-text-primary) mb-2">Check your email</h2>
          <p className="text-sm text-(--color-text-muted)">
            We sent a confirmation link to <strong className="text-(--color-text-primary)">{email}</strong>.
            Click it to activate your account, then come back to sign in.
          </p>
          <Link href="/login" className="inline-block mt-6 text-sm text-(--color-brand) font-medium hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-(--color-surface) flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-[family-name:--font-display] text-(--color-text-primary) tracking-tight">
            Larder
          </h1>
          <p className="text-sm text-(--color-text-muted) mt-1">Your kitchen's memory</p>
        </div>

        <div className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-lg font-semibold text-(--color-text-primary) mb-5">Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-(--color-text-muted) mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) text-sm placeholder:text-(--color-text-faint) focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-(--color-text-muted) mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) text-sm placeholder:text-(--color-text-faint) focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-xs text-(--color-urgent-text) bg-(--color-urgent-bg) px-3 py-2 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-(--color-brand) text-white text-sm font-semibold hover:bg-(--color-brand-light) transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-(--color-text-muted) mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-(--color-brand) font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
