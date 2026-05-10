"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function Spinner() {
  return <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />;
}

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  // Confirm we landed here from a recovery email link
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setHasSession(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
      // Sign out so the user re-authenticates with the new password
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/login");
      }, 2000);
    }
  }

  // No recovery session detected
  if (hasSession === false) {
    return (
      <div className="min-h-dvh bg-(--color-surface) flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5 text-red-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-2">Link invalid or expired</h2>
            <p className="text-sm text-(--color-text-muted) leading-relaxed">
              Reset links expire after 1 hour. Request a new one to continue.
            </p>
            <Link href="/forgot-password" className="inline-block mt-6 text-sm text-(--color-brand) font-medium hover:underline">
              Request new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (done) {
    return (
      <div className="min-h-dvh bg-(--color-surface) flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5 text-green-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-2">Password updated</h2>
            <p className="text-sm text-(--color-text-muted)">Redirecting you to sign in…</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading the session
  if (hasSession === null) return null;

  return (
    <div className="min-h-dvh bg-(--color-surface) flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-(--color-brand) flex items-center justify-center text-2xl mx-auto mb-4 shadow-md">
            🧺
          </div>
          <h1 className="text-2xl font-semibold text-(--color-text-primary) tracking-tight">
            Set a new password
          </h1>
          <p className="text-sm text-(--color-text-muted) mt-1">Choose something you&apos;ll remember</p>
        </div>

        {/* Card */}
        <div className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* New password */}
            <div>
              <label className="block text-xs font-medium text-(--color-text-muted) mb-1.5">New password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-faint) pointer-events-none">
                  <IconLock />
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  autoFocus
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) text-sm placeholder:text-(--color-text-faint) focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-faint) hover:text-(--color-text-muted) transition-colors">
                  {showPw ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-medium text-(--color-text-muted) mb-1.5">Confirm password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-faint) pointer-events-none">
                  <IconLock />
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-type password"
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
              {loading ? <><Spinner />Updating…</> : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
