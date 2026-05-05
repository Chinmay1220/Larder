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

const CATEGORY_EMOJI: Record<string, string> = {
  produce: "🥦", dairy: "🥛", meat: "🥩", seafood: "🐟",
  bakery: "🍞", pantry: "🥫", frozen: "🧊", beverage: "🧃",
  snack: "🍿", household: "🧻", other: "📦",
};

function daysLeft(expiry: string) {
  return Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000);
}

function ExpiryBadge({ expiry }: { expiry: string }) {
  const d = daysLeft(expiry);
  if (d < 0)  return <span className="text-[10px] font-semibold bg-(--color-urgent-bg) text-(--color-urgent-text) px-2 py-0.5 rounded-full border border-red-200">Expired</span>;
  if (d === 0) return <span className="text-[10px] font-semibold bg-(--color-urgent-bg) text-(--color-urgent-text) px-2 py-0.5 rounded-full border border-red-200">Today</span>;
  if (d <= 2) return <span className="text-[10px] font-semibold bg-(--color-urgent-bg) text-(--color-urgent-text) px-2 py-0.5 rounded-full border border-red-200">in {d}d</span>;
  if (d <= 5) return <span className="text-[10px] font-semibold bg-(--color-warn-bg) text-(--color-warn-text) px-2 py-0.5 rounded-full border border-amber-200">in {d}d</span>;
  return       <span className="text-[10px] font-semibold bg-(--color-safe-bg) text-(--color-safe-text) px-2 py-0.5 rounded-full border border-green-200">{d}d left</span>;
}

function urgencyBarColor(expiry: string) {
  const d = daysLeft(expiry);
  if (d <= 2) return "bg-red-400";
  if (d <= 5) return "bg-amber-400";
  return "bg-emerald-400";
}

function urgencyBarWidth(item: PantryItem) {
  const d = daysLeft(item.est_expiry);
  if (d < 0) return 100; // expired — show full red bar
  const shelf = item.shelf_life_days || 14;
  return Math.min(100, (d / shelf) * 100);
}

function StatCard({ label, value, icon, urgent }: { label: string; value: string | number; icon: string; urgent?: boolean }) {
  return (
    <div className={`rounded-2xl px-4 py-4 bg-(--color-card) border shadow-[0_1px_4px_rgba(0,0,0,0.06)]
      ${urgent ? "border-red-200 bg-(--color-urgent-bg)" : "border-(--color-border)"}`}>
      <p className="text-xl mb-1">{icon}</p>
      <p className="text-2xl font-bold text-(--color-text-primary) tabular-nums">{value}</p>
      <p className="text-xs text-(--color-text-muted) mt-0.5 font-medium">{label}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse px-4 md:px-8 py-4">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-stone-100" />)}
      </div>
      {[...Array(2)].map((_, g) => (
        <div key={g} className="mb-5">
          <div className="h-3 w-20 bg-stone-100 rounded mb-2" />
          <div className="rounded-2xl bg-white border border-(--color-border) divide-y divide-(--color-border) overflow-hidden">
            {[...Array(3)].map((_, r) => (
              <div key={r} className="flex justify-between items-center px-4 py-3">
                <div className="space-y-1.5">
                  <div className="h-3 w-32 bg-stone-100 rounded" />
                  <div className="h-2 w-16 bg-stone-50 rounded" />
                </div>
                <div className="h-5 w-12 bg-stone-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [consuming, setConsuming] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id ?? "";
      fetch(`${API}/pantry`, {
        headers: { "X-User-Id": userId },
      })
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then(setItems)
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    });
  }, []);

  async function markUsed(item: PantryItem) {
    setConsuming(item.id);
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? "";
    try {
      await fetch(`${API}/pantry/${item.id}/consumed`, {
        method: "PATCH",
        headers: { "X-User-Id": userId },
      });
      setItems(prev => prev.filter(i => i.id !== item.id));
    } finally {
      setConsuming(null);
    }
  }

  const byCategory = items.reduce<Record<string, PantryItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  const visibleCategories = activeFilter === "all"
    ? byCategory
    : byCategory[activeFilter] ? { [activeFilter]: byCategory[activeFilter] } : {};

  // Include already-expired items in the alert strip
  const urgentItems  = items.filter(i => daysLeft(i.est_expiry) <= 3);
  const expiredCount = items.filter(i => daysLeft(i.est_expiry) < 0).length;
  const totalValue   = items.reduce((s, i) => s + (i.price ?? 0), 0);

  // Truncate alert names to avoid wall of text
  const urgentNames = urgentItems.slice(0, 4).map(i => i.canonical_name);
  const urgentExtra = urgentItems.length > 4 ? ` +${urgentItems.length - 4} more` : "";

  return (
    <main className="min-h-full bg-(--color-surface)">
      {/* Header */}
      <div className="px-4 md:px-8 pt-6 pb-2">
        <h1 className="text-3xl font-[family-name:--font-display] text-(--color-text-primary) tracking-tight md:hidden">
          Larder
        </h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">
          {loading ? "Loading…" : error ? "Could not load pantry" : `${items.length} items · ${expiredCount > 0 ? `${expiredCount} expired` : "all good"}`}
        </p>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="mx-4 md:mx-8 mt-4 rounded-xl bg-(--color-urgent-bg) border border-red-200 px-4 py-3 text-sm text-(--color-urgent-text) font-medium">
          ⚠️ Could not reach the backend. Check your connection and try again.
        </div>
      )}

      {loading ? <Skeleton /> : !error && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 px-4 md:px-8 py-4">
            <StatCard label="Total Items"   value={items.length}                    icon="🧺" />
            <StatCard label="Expiring Soon" value={urgentItems.length}              icon="⏳" urgent={urgentItems.length > 0} />
            <StatCard label="Categories"    value={Object.keys(byCategory).length}  icon="🗂" />
            <StatCard label="Est. Value"    value={`$${totalValue.toFixed(2)}`}     icon="💰" />
          </div>

          {/* Alert strip */}
          {urgentItems.length > 0 && (
            <div className="mx-4 md:mx-8 mb-2 rounded-xl bg-(--color-urgent-bg) border border-red-200 px-4 py-3 flex items-start gap-3">
              <span className="text-lg shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-(--color-urgent-text)">
                  Use soon: {urgentNames.join(", ")}{urgentExtra}
                </p>
                <p className="text-xs text-red-400 mt-0.5">
                  {urgentItems.length} item{urgentItems.length !== 1 ? "s" : ""} expiring or expired
                </p>
              </div>
            </div>
          )}

          {/* Filter pills */}
          {items.length > 0 && (
            <div className="flex gap-2 px-4 md:px-8 pb-3 overflow-x-auto scrollbar-none">
              {["all", ...Object.keys(byCategory)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150
                    ${activeFilter === cat
                      ? "bg-(--color-brand) text-white shadow-sm"
                      : "bg-(--color-card) text-(--color-text-muted) border border-(--color-border) hover:border-(--color-brand-light) hover:text-(--color-brand-light)"
                    }`}
                >
                  {CATEGORY_EMOJI[cat] ?? "📦"} {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
              <div className="w-20 h-20 rounded-full bg-(--color-card-warm) border-2 border-dashed border-(--color-border) flex items-center justify-center text-3xl mb-5">
                🧺
              </div>
              <h2 className="text-lg font-[family-name:--font-display] text-(--color-text-primary) mb-1">
                Your pantry is empty
              </h2>
              <p className="text-sm text-(--color-text-muted) mb-6">
                Scan a grocery receipt to stock your shelves
              </p>
              <Link href="/scan" className="bg-(--color-brand) text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-(--color-brand-light) transition-colors shadow-sm">
                Scan your first receipt
              </Link>
            </div>
          )}

          {/* Category groups */}
          {Object.entries(visibleCategories).map(([cat, catItems]) => (
            <section key={cat} className="mb-5">
              <div className="px-4 md:px-8 mb-1 mt-4 flex items-center gap-2">
                <span className="text-base">{CATEGORY_EMOJI[cat] ?? "📦"}</span>
                <span className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest">{cat}</span>
                <span className="ml-auto text-xs text-(--color-text-faint)">{catItems.length}</span>
              </div>
              <div className="mx-4 md:mx-8 bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_1px_4px_rgba(0,0,0,0.04)] divide-y divide-(--color-border) overflow-hidden">
                {catItems.map((item) => (
                  <div key={item.id} className="px-4 py-3 group hover:bg-(--color-card-warm) transition-colors duration-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-medium text-(--color-text-primary) capitalize text-sm leading-snug">
                        {item.canonical_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <ExpiryBadge expiry={item.est_expiry} />
                        <button
                          onClick={() => markUsed(item)}
                          disabled={consuming === item.id}
                          title="Mark as used"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-0.5 rounded-full border border-(--color-border) text-(--color-text-faint) hover:border-red-200 hover:text-red-500 hover:bg-(--color-urgent-bg) disabled:opacity-30"
                        >
                          {consuming === item.id ? "…" : "Used"}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-(--color-text-faint)">{item.quantity} {item.unit}</p>
                      <div className="flex-1 h-1 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${urgencyBarColor(item.est_expiry)}`}
                          style={{ width: `${urgencyBarWidth(item)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {/* Mobile scan FAB */}
      <Link href="/scan"
        className="md:hidden fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-(--color-brand) text-white flex items-center justify-center text-2xl shadow-lg hover:bg-(--color-brand-light) transition-all active:scale-95">
        📸
      </Link>
    </main>
  );
}
