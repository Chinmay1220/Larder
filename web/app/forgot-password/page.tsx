"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function Spinner() {
  return <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />;
}

const IconEmail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-dvh bg-(--color-surface) flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-(--color-brand-xlight) border border-(--color-border) flex items-center justify-center mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-brand)">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-2">Check your inbox</h2>
            <p className="text-sm text-(--color-text-muted) leading-relaxed">
              If an account exists for{" "}
              <strong className="text-(--color-text-primary) font-medium">{email}</strong>,
              we sent a password reset link. The link expires in 1 hour.
            </p>
            <Link href="/login" className="inline-flex items-center gap-1.5 mt-6 text-sm text-(--color-brand) font-medium hover:underline">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-(--color-surface) flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-(--color-brand) flex items-center justify-center text-2xl mx-auto mb-4 shadow-md">
            🧺
          </div>
          <h1 className="text-2xl font-semibold text-(--color-text-primary) tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-(--color-text-muted) mt-1">We&apos;ll email you a link to set a new one</p>
        </div>

        {/* Card */}
        <div className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-(--color-text-muted) mb-1.5">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-faint) pointer-events-none">
                  <IconEmail />
                </span>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) text-sm placeholder:text-(--color-text-faint) focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-xs text-(--color-urgent-text) bg-(--color-urgent-bg) px-3 py-2.5 rounded-lg border border-red-200">
                <svg className="shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-(--color-brand) text-white text-sm font-semibold hover:bg-(--color-brand-light) transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner />Sending…</> : "Send reset link"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-(--color-text-muted) mt-5">
          Remembered it?{" "}
          <Link href="/login" className="text-(--color-brand) font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
