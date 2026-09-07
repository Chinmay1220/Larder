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

function Ico({ children, size = 20 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  );
}
function CatIcon({ cat, size = 20 }: { cat: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    produce: <><path d="M11 20A7 7 0 0 1 4 13C4 7 12 4 20 4c0 8-3 16-9 16Z" /><path d="M4 20c3-4 7-6 11-7" /></>,
    dairy: <path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11Z" />,
    meat: <path d="M14 4a6 6 0 0 1 6 6c0 3-2 5-5 5l-6 4-3-3 4-6c0-3 2-6 4-6Z" />,
    seafood: <><path d="M3 12c3-4 9-6 14-4 3 1 4 3 4 4s-1 3-4 4c-5 2-11 0-14-4Z" /><circle cx="8" cy="11" r=".9" fill="currentColor" stroke="none" /></>,
    bakery: <path d="M6 14c-2 0-3-2-2-4 1-3 5-5 8-5s7 2 8 5c1 2 0 4-2 4Z" />,
    pantry: <><path d="M6 3h12v4H6z" /><path d="M7 7h10l-1 14H8L7 7Z" /></>,
    frozen: <><path d="M12 2v20" /><path d="M4 6l16 12" /><path d="M20 6 4 18" /></>,
    beverage: <path d="M7 4h10l-1.4 16H8.4L7 4Z" />,
    snack: <><circle cx="12" cy="12" r="8" /><circle cx="10" cy="10" r=".8" fill="currentColor" stroke="none" /><circle cx="14" cy="13" r=".8" fill="currentColor" stroke="none" /></>,
    household: <path d="M5 21V9l7-5 7 5v12" />,
    other: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />,
  };
  return <Ico size={size}>{paths[cat] ?? paths.other}</Ico>;
}

function daysLeft(expiry: string) {
  return Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000);
}
function tierOf(expiry: string): "alert" | "soon" | "ok" {
  const d = daysLeft(expiry);
  if (d <= 1) return "alert";
  if (d <= 3) return "soon";
  return "ok";
}
const TIER_VAR: Record<string, string> = {
  alert: "var(--color-alert)", soon: "var(--color-soon)", ok: "var(--color-ok)",
};
function label(expiry: string) {
  const d = daysLeft(expiry);
  if (d < 0) return "expired";
  if (d === 0) return "today";
  if (d === 1) return "1 day left";
  return `${d} days left`;
}

export default function ExpiringPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [consuming, setConsuming] = useState<string | null>(null);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? "";
    try {
      const res = await fetch(`${API}/pantry/expiring?days=3`, { headers: { "Authorization": `Bearer ${token}` } });
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
      await fetch(`${API}/pantry/${item.id}/consumed`, { method: "PATCH", headers: { "Authorization": `Bearer ${token}` } });
      setItems(prev => prev.filter(i => i.id !== item.id));
    } finally {
      setConsuming(null);
    }
  }

  const expired = items.filter(i => daysLeft(i.est_expiry) < 0);
  const today = items.filter(i => daysLeft(i.est_expiry) === 0);
  const soon = items.filter(i => { const d = daysLeft(i.est_expiry); return d > 0 && d <= 3; });

  return (
    <main className="min-h-full bg-(--color-surface)">
      <div className="px-4 md:px-8 pt-6 pb-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-faint)">Larder · Alerts</p>
        <h1 className="text-2xl font-bold text-(--color-text-primary) tracking-tight -mt-0.5">Expiring soon</h1>
        <p className="text-sm text-(--color-text-muted) mt-1">
          {loading ? "Loading…" : `${items.length} item${items.length !== 1 ? "s" : ""} need${items.length === 1 ? "s" : ""} attention`}
        </p>
      </div>

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-(--color-card) border border-(--color-border) flex items-center justify-center text-(--color-ok) mb-5 shadow-[0_10px_26px_-18px_rgba(90,70,30,.5)]">
            <Ico size={34}><polyline points="20 6 9 17 4 12" /></Ico>
          </div>
          <h2 className="text-lg font-bold text-(--color-text-primary) mb-1">Nothing expiring soon</h2>
          <p className="text-sm text-(--color-text-muted) mb-6">All your pantry items are fresh.</p>
          <Link href="/" className="font-mono text-xs uppercase tracking-wide text-(--color-brand) hover:underline">← Back to pantry</Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="px-4 md:px-8 pb-8 space-y-5">
          {expired.length > 0 && <Section title="Expired" items={expired} consuming={consuming} onUsed={markUsed} />}
          {today.length > 0 && <Section title="Today" items={today} consuming={consuming} onUsed={markUsed} />}
          {soon.length > 0 && <Section title="Next 3 days" items={soon} consuming={consuming} onUsed={markUsed} />}
        </div>
      )}
    </main>
  );
}

function Section({ title, items, consuming, onUsed }: {
  title: string;
  items: PantryItem[];
  consuming: string | null;
  onUsed: (item: PantryItem) => void;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-2 mt-3">
        <span className="font-mono text-[10px] font-semibold text-(--color-text-muted) uppercase tracking-widest">{title}</span>
        <span className="ml-auto font-mono text-[10px] text-(--color-text-faint)">{items.length}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map(item => (
          <div key={item.id}
            className="relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-card) pl-4 pr-3.5 py-3 shadow-[0_5px_16px_-12px_rgba(90,70,30,.5)] flex items-center gap-3">
            <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: TIER_VAR[tierOf(item.est_expiry)] }} />
            <div className="w-10 h-10 rounded-xl bg-(--color-surface) flex items-center justify-center text-(--color-brand) shrink-0">
              <CatIcon cat={item.category} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-(--color-text-primary) capitalize leading-snug truncate">{item.canonical_name}</p>
              <p className="font-mono text-[10px] text-(--color-text-faint) mt-0.5 capitalize">{item.quantity} {item.unit} · {item.category} · {label(item.est_expiry)}</p>
            </div>
            <button
              onClick={() => onUsed(item)}
              disabled={consuming === item.id}
              className="shrink-0 font-mono text-[10px] uppercase tracking-wide px-3 py-1.5 rounded-full border border-(--color-border) text-(--color-text-muted) hover:border-(--color-ok) hover:text-(--color-ok) disabled:opacity-30 transition-colors"
            >
              {consuming === item.id ? "…" : "Used"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
