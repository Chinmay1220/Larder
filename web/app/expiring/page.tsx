"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const API = process.env.NEXT_PUBLIC_API_URL;

type PantryItem = {
  id: string;
  canonical_name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number | null;
  est_expiry: string;
  shelf_life_days: number;
};

function daysLeft(expiry: string) {
  return Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000);
}

function ExpiryBadge({ expiry }: { expiry: string }) {
  const d = daysLeft(expiry);
  if (d < 0)   return <span className="text-[10px] font-semibold bg-(--color-urgent-bg) text-(--color-urgent-text) px-2 py-0.5 rounded-full border border-red-200">Expired</span>;
  if (d === 0) return <span className="text-[10px] font-semibold bg-(--color-urgent-bg) text-(--color-urgent-text) px-2 py-0.5 rounded-full border border-red-200">Today</span>;
  if (d <= 2)  return <span className="text-[10px] font-semibold bg-(--color-urgent-bg) text-(--color-urgent-text) px-2 py-0.5 rounded-full border border-red-200">in {d}d</span>;
  return        <span className="text-[10px] font-semibold bg-(--color-warn-bg) text-(--color-warn-text) px-2 py-0.5 rounded-full border border-amber-200">in {d}d</span>;
}

export default function ExpiringPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [consuming, setConsuming] = useState<string | null>(null);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? "";
    try {
      const res = await fetch(`${API}/pantry/expiring?days=3`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markUsed(item: PantryItem) {
    setConsuming(item.id);
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? "";
    try {
      await fetch(`${API}/pantry/${item.id}/consumed`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
      });
      setItems(prev => prev.filter(i => i.id !== item.id));
    } finally {
      setConsuming(null);
    }
  }

  const expired = items.filter(i => daysLeft(i.est_expiry) < 0);
  const today   = items.filter(i => daysLeft(i.est_expiry) === 0);
  const soon    = items.filter(i => { const d = daysLeft(i.est_expiry); return d > 0 && d <= 3; });

  return (
    <main className="min-h-full bg-(--color-surface)">
      {/* Header */}
      <div className="px-4 md:px-8 pt-6 pb-3">
        <h1 className="text-xl font-semibold text-(--color-text-primary) tracking-tight">Expiring soon</h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">
          {loading ? "Loading…" : `${items.length} item${items.length !== 1 ? "s" : ""} need${items.length === 1 ? "s" : ""} attention`}
        </p>
      </div>

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-dashed border-green-200 flex items-center justify-center text-green-500 mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="text-lg font-semibold text-(--color-text-primary) mb-1">Nothing expiring soon</h2>
          <p className="text-sm text-(--color-text-muted) mb-6">All your pantry items are fresh.</p>
          <Link href="/" className="text-sm text-(--color-brand) font-medium hover:underline">
            ← Back to pantry
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="px-4 md:px-8 pb-8 space-y-5">
          {expired.length > 0 && <Section title="Expired" items={expired} consuming={consuming} onUsed={markUsed} tone="red" />}
          {today.length > 0 &&   <Section title="Today"   items={today}   consuming={consuming} onUsed={markUsed} tone="red" />}
          {soon.length > 0 &&    <Section title="Next 3 days" items={soon} consuming={consuming} onUsed={markUsed} tone="amber" />}
        </div>
      )}
    </main>
  );
}

function Section({ title, items, consuming, onUsed, tone }: {
  title: string;
  items: PantryItem[];
  consuming: string | null;
  onUsed: (item: PantryItem) => void;
  tone: "red" | "amber";
}) {
  const accent = tone === "red" ? "bg-red-400" : "bg-amber-400";
  return (
    <section>
      <div className="flex items-center gap-2 mb-2 mt-3">
        <div className={`w-0.5 h-3.5 rounded-full ${accent} opacity-80 shrink-0`} />
        <span className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest">{title}</span>
        <span className="ml-auto text-xs font-medium text-(--color-text-faint) bg-stone-100 px-1.5 py-0.5 rounded-md">{items.length}</span>
      </div>
      <div className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_1px_4px_rgba(0,0,0,0.04)] divide-y divide-(--color-border) overflow-hidden">
        {items.map(item => (
          <div key={item.id} className="px-4 py-3.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-medium text-(--color-text-primary) capitalize text-sm leading-snug truncate">{item.canonical_name}</p>
                <ExpiryBadge expiry={item.est_expiry} />
              </div>
              <p className="text-xs text-(--color-text-faint)">{item.quantity} {item.unit} · <span className="capitalize">{item.category}</span></p>
            </div>
            <button
              onClick={() => onUsed(item)}
              disabled={consuming === item.id}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-(--color-border) text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand) hover:bg-stone-50 disabled:opacity-30 transition-colors font-medium"
            >
              {consuming === item.id ? "…" : "Used"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
