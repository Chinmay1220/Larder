"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const API = process.env.NEXT_PUBLIC_API_URL;

function Spinner() {
  return <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />;
}

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 md:p-6">
      <h2 className="font-semibold text-(--color-text-primary) text-base">{title}</h2>
      {description && <p className="text-sm text-(--color-text-muted) mt-0.5 mb-4">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </section>
  );
}

function ChangePasswordForm() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(false);
    if (pw.length < 6)   { setError("Password must be at least 6 characters"); return; }
    if (pw !== confirm)  { setError("Passwords do not match"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setSuccess(true); setPw(""); setConfirm("");
    setTimeout(() => setSuccess(false), 3000);
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) text-sm placeholder:text-(--color-text-faint) focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-(--color-text-muted) mb-1.5">New password</label>
        <div className="relative">
          <input type={show ? "text" : "password"} required minLength={6} value={pw} onChange={e => setPw(e.target.value)}
                 placeholder="At least 6 characters" className={`${inputCls} pr-10`} />
          <button type="button" onClick={() => setShow(v => !v)} tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-faint) hover:text-(--color-text-muted) transition-colors">
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-(--color-text-muted) mb-1.5">Confirm new password</label>
        <input type={show ? "text" : "password"} required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)}
               placeholder="Re-type password" className={inputCls} />
      </div>
      {error && (
        <p className="text-xs text-(--color-urgent-text) bg-(--color-urgent-bg) px-3 py-2 rounded-lg border border-red-200">{error}</p>
      )}
      {success && (
        <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">Password updated successfully</p>
      )}
      <button type="submit" disabled={saving}
        className="px-4 py-2 rounded-xl bg-(--color-brand) text-white text-sm font-semibold hover:bg-(--color-brand-light) transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
        {saving ? <><Spinner />Updating…</> : "Update password"}
      </button>
    </form>
  );
}

function DeleteAccountSection({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canConfirm = confirmText.trim().toLowerCase() === email.toLowerCase();

  async function handleDelete() {
    if (!canConfirm) return;
    setDeleting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";
      const res = await fetch(`${API}/account`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Server returned " + res.status);
      await supabase.auth.signOut();
      router.push("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setDeleting(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
        Delete account
      </button>
    );
  }

  return (
    <div className="border border-red-200 rounded-xl p-4 bg-red-50/50 space-y-3">
      <p className="text-sm text-red-700 font-medium">
        Type <span className="font-mono">{email}</span> to permanently delete your account and all data.
      </p>
      <input
        autoFocus
        value={confirmText}
        onChange={e => setConfirmText(e.target.value)}
        placeholder={email}
        className="w-full px-3 py-2 rounded-xl border border-red-200 bg-white text-(--color-text-primary) text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
      />
      {error && <p className="text-xs text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => { setOpen(false); setConfirmText(""); setError(null); }} disabled={deleting}
          className="flex-1 py-2 rounded-xl border border-(--color-border) bg-white text-sm font-medium text-(--color-text-muted) hover:bg-stone-50 transition-colors disabled:opacity-50">
          Cancel
        </button>
        <button onClick={handleDelete} disabled={!canConfirm || deleting}
          className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {deleting ? "Deleting…" : "Delete forever"}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!user) return null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";
  const initials = user.email?.slice(0, 2).toUpperCase() ?? "LA";

  return (
    <main className="min-h-full bg-(--color-surface)">
      <div className="px-4 md:px-8 pt-6 pb-3">
        <h1 className="text-xl font-semibold text-(--color-text-primary) tracking-tight">Settings</h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="px-4 md:px-8 pb-8 space-y-4 max-w-2xl">

        {/* Profile */}
        <Card title="Profile">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-(--color-brand-xlight) border border-(--color-border) flex items-center justify-center text-base font-bold text-(--color-brand) shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-(--color-text-primary) truncate">{user.email}</p>
              <p className="text-xs text-(--color-text-faint) mt-0.5">Member since {memberSince}</p>
            </div>
          </div>
        </Card>

        {/* Password */}
        <Card title="Password" description="Change the password used to sign in to Larder.">
          <ChangePasswordForm />
        </Card>

        {/* Session */}
        <Card title="Session">
          <button onClick={signOut}
            className="px-4 py-2 rounded-xl border border-(--color-border) text-sm font-medium text-(--color-text-muted) hover:bg-stone-50 hover:text-(--color-text-primary) transition-colors">
            Sign out of this device
          </button>
        </Card>

        {/* Danger zone */}
        <Card title="Danger zone" description="Once deleted, your pantry, receipts, and account cannot be recovered.">
          <DeleteAccountSection email={user.email ?? ""} />
        </Card>

      </div>
    </main>
  );
}
