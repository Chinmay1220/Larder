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
  purchased_at?: string;
};

type SortBy = "expiry" | "name" | "recent";

const CATEGORY_EMOJI: Record<string, string> = {
  produce: "🥦", dairy: "🥛", meat: "🥩", seafood: "🐟",
  bakery: "🍞", pantry: "🥫", frozen: "🧊", beverage: "🧃",
  snack: "🍿", household: "🧻", other: "📦",
};

const IconBox = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconDollar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconPencil = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const IconCamera = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const CATEGORIES = ["produce","dairy","meat","seafood","bakery","pantry","frozen","beverage","snack","household","other"] as const;

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
  if (d < 0) return 100;
  const shelf = item.shelf_life_days || 14;
  return Math.min(100, (d / shelf) * 100);
}

function StatStrip({ label, value, icon, urgent }: { label: string; value: string | number; icon: React.ReactNode; urgent?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
        ${urgent ? "bg-red-50 text-red-500" : "bg-(--color-brand-xlight) text-(--color-brand)"}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xl font-bold tabular-nums leading-tight ${urgent ? "text-red-600" : "text-(--color-text-primary)"}`}>{value}</p>
        <p className="text-[11px] text-(--color-text-faint) font-medium">{label}</p>
      </div>
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

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-800 text-white text-sm px-4 py-2 rounded-full shadow-lg whitespace-nowrap pointer-events-none animate-fade-in">
      {message}
    </div>
  );
}

function EditModal({ item, onSave, onClose }: {
  item: PantryItem;
  onSave: (id: string, fields: Partial<PantryItem>) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(item.canonical_name);
  const [qty, setQty] = useState(item.quantity);
  const [unit, setUnit] = useState(item.unit);
  const [category, setCategory] = useState(item.category);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(item.id, { canonical_name: name, quantity: qty, unit, category });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-(--color-card) rounded-2xl w-full max-w-sm p-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-(--color-text-primary) mb-4">Edit item</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-(--color-text-muted) mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-(--color-text-muted) mb-1">Quantity</label>
              <input type="number" min={0} step={0.5} value={qty} onChange={e => setQty(Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-(--color-text-muted) mb-1">Unit</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-(--color-text-muted) mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-sm font-medium text-(--color-text-muted) hover:bg-stone-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-(--color-brand) text-white text-sm font-semibold hover:bg-(--color-brand-light) transition-colors shadow-sm disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({
  onSave,
  onClose,
}: {
  onSave: (fields: Omit<PantryItem, "id">) => Promise<void>;
  onClose: () => void;
}) {
  const defaultExpiry = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("each");
  const [category, setCategory] = useState("other");
  const [expiry, setExpiry] = useState(defaultExpiry);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        canonical_name: name.trim().toLowerCase(),
        category,
        quantity: qty,
        unit,
        price: null,
        est_expiry: new Date(expiry + "T12:00:00Z").toISOString(),
        shelf_life_days: Math.max(1, Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000)),
      });
      onClose();
    } catch {
      setError("Failed to add item. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-(--color-card) rounded-2xl w-full max-w-sm p-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-(--color-text-primary) mb-4">Add item</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-(--color-text-muted) mb-1">Name</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Whole milk"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-(--color-text-muted) mb-1">Quantity</label>
              <input type="number" min={0.5} step={0.5} value={qty} onChange={e => setQty(Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-(--color-text-muted) mb-1">Unit</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="each, lb, oz…" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-(--color-text-muted) mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-(--color-text-muted) mb-1">Expiry date</label>
            <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className={inputCls} />
          </div>
          {error && (
            <p className="text-xs text-(--color-urgent-text) bg-(--color-urgent-bg) px-3 py-2 rounded-lg border border-red-200">{error}</p>
          )}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-sm font-medium text-(--color-text-muted) hover:bg-stone-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-(--color-brand) text-white text-sm font-semibold hover:bg-(--color-brand-light) transition-colors shadow-sm disabled:opacity-50">
            {saving ? "Adding…" : "Add item"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({
  item,
  onClose,
  onEdit,
  onDelete,
  onUsed,
}: {
  item: PantryItem;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUsed: () => void;
}) {
  const d = daysLeft(item.est_expiry);
  const expiryDate = new Date(item.est_expiry).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const purchasedDate = item.purchased_at
    ? new Date(item.purchased_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  const daysSincePurchase = item.purchased_at
    ? Math.floor((Date.now() - new Date(item.purchased_at).getTime()) / 86400000)
    : null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-(--color-card) rounded-2xl w-full max-w-sm shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-(--color-border)">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{CATEGORY_EMOJI[item.category] ?? "📦"}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-(--color-text-primary) text-base capitalize leading-snug">{item.canonical_name}</h3>
              <p className="text-xs text-(--color-text-faint) capitalize mt-0.5">{item.category}</p>
            </div>
            <button onClick={onClose} className="text-(--color-text-faint) hover:text-(--color-text-muted) transition-colors -mt-1 -mr-1 p-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Details */}
        <dl className="px-5 py-4 space-y-3">
          <Row label="Quantity" value={`${item.quantity} ${item.unit}`} />
          {item.price != null && <Row label="Price" value={`$${item.price.toFixed(2)}`} />}
          <Row
            label="Expires"
            value={
              <span className="flex items-center gap-2">
                {expiryDate}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  d < 0 ? "bg-(--color-urgent-bg) text-(--color-urgent-text) border-red-200"
                  : d <= 2 ? "bg-(--color-urgent-bg) text-(--color-urgent-text) border-red-200"
                  : d <= 5 ? "bg-(--color-warn-bg) text-(--color-warn-text) border-amber-200"
                  : "bg-(--color-safe-bg) text-(--color-safe-text) border-green-200"
                }`}>
                  {d < 0 ? "Expired" : d === 0 ? "Today" : `in ${d}d`}
                </span>
              </span>
            }
          />
          {purchasedDate && (
            <Row label="Added" value={`${purchasedDate}${daysSincePurchase != null ? ` (${daysSincePurchase}d ago)` : ""}`} />
          )}
          <Row label="Shelf life" value={`${item.shelf_life_days} days`} />
        </dl>

        {/* Actions */}
        <div className="px-5 pb-5 grid grid-cols-3 gap-2">
          <button onClick={onEdit} className="py-2.5 rounded-xl border border-(--color-border) text-sm font-medium text-(--color-text-muted) hover:bg-stone-50 hover:text-(--color-text-primary) transition-colors">
            Edit
          </button>
          <button onClick={onUsed} className="py-2.5 rounded-xl border border-(--color-border) text-sm font-medium text-(--color-text-muted) hover:bg-stone-50 hover:text-(--color-text-primary) transition-colors">
            Used
          </button>
          <button onClick={onDelete} className="py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs font-medium text-(--color-text-faint) uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-(--color-text-primary) text-right">{value}</dd>
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [consuming, setConsuming] = useState<string | null>(null);
  const [decrementing, setDecrementing] = useState<string | null>(null);
  const [editing, setEditing] = useState<PantryItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("expiry");
  const [viewing, setViewing] = useState<PantryItem | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.access_token ?? "";
      fetch(`${API}/pantry`, {
        headers: { "Authorization": `Bearer ${token}` },
      })
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then(setItems)
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

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
      showToast("Marked as used");
    } finally {
      setConsuming(null);
    }
  }

  async function decrementItem(item: PantryItem) {
    setDecrementing(item.id);
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? "";
    try {
      const res = await fetch(`${API}/pantry/${item.id}/decrement`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.consumed) {
        setItems(prev => prev.filter(i => i.id !== item.id));
        showToast("Item finished");
      } else {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: data.quantity } : i));
        showToast("Quantity updated");
      }
    } finally {
      setDecrementing(null);
    }
  }

  async function editItem(id: string, fields: Partial<PantryItem>) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? "";
    const res = await fetch(`${API}/pantry/${id}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error("Failed to update item");
    const updated = await res.json();
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
    showToast("Item updated");
  }

  async function deleteItem(item: PantryItem) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? "";
    await fetch(`${API}/pantry/${item.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    setItems(prev => prev.filter(i => i.id !== item.id));
    showToast("Item removed");
  }

  async function addItem(fields: Omit<PantryItem, "id">) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? "";
    const res = await fetch(`${API}/pantry`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error("Failed to add item");
    const newItem = await res.json();
    setItems(prev => [...prev, newItem].sort((a, b) =>
      new Date(a.est_expiry).getTime() - new Date(b.est_expiry).getTime()
    ));
    showToast("Item added");
  }

  const byCategory = items.reduce<Record<string, PantryItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  const filteredItems = searchQuery.trim()
    ? items.filter(i => i.canonical_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const displayItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "name") return a.canonical_name.localeCompare(b.canonical_name);
    if (sortBy === "recent") {
      const ta = a.purchased_at ? new Date(a.purchased_at).getTime() : 0;
      const tb = b.purchased_at ? new Date(b.purchased_at).getTime() : 0;
      return tb - ta; // most recent first
    }
    // expiry: soonest first
    return new Date(a.est_expiry).getTime() - new Date(b.est_expiry).getTime();
  });

  const byDisplayCategory = displayItems.reduce<Record<string, PantryItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  const visibleDisplayCategories = activeFilter === "all"
    ? byDisplayCategory
    : byDisplayCategory[activeFilter] ? { [activeFilter]: byDisplayCategory[activeFilter] } : {};

  const urgentItems  = items.filter(i => daysLeft(i.est_expiry) <= 3);
  const expiredCount = items.filter(i => daysLeft(i.est_expiry) < 0).length;
  const totalValue   = items.reduce((s, i) => s + (i.price ?? 0), 0);

  const urgentNames = urgentItems.slice(0, 4).map(i => i.canonical_name);
  const urgentExtra = urgentItems.length > 4 ? ` +${urgentItems.length - 4} more` : "";

  return (
    <main className="min-h-full bg-(--color-surface)">
      {/* Header */}
      <div className="px-4 md:px-8 pt-6 pb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-(--color-text-primary) tracking-tight">Pantry</h1>
          <p className="text-sm text-(--color-text-muted) mt-0.5">
            {loading ? "Loading…" : error ? "Could not load pantry" : `${items.length} item${items.length !== 1 ? "s" : ""} tracked${expiredCount > 0 ? ` · ${expiredCount} expired` : ""}`}
          </p>
        </div>
        {!loading && !error && (
          <button
            onClick={() => setAddingItem(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-(--color-brand) text-white text-sm font-semibold hover:bg-(--color-brand-light) transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add item
          </button>
        )}
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="mx-4 md:mx-8 mt-4 rounded-xl bg-(--color-urgent-bg) border border-red-200 px-4 py-3 text-sm text-(--color-urgent-text) font-medium">
          ⚠️ Could not reach the backend. Check your connection and try again.
        </div>
      )}

      {loading ? <Skeleton /> : !error && (
        <>
          {/* Stat strip */}
          <div className="mx-4 md:mx-8 my-3 bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_1px_4px_rgba(0,0,0,0.06)] grid grid-cols-2 md:grid-cols-4">
            <div className="border-r border-b md:border-b-0 border-(--color-border)">
              <StatStrip label="Total Items"   value={items.length}                   icon={<IconBox />} />
            </div>
            <div className="border-b md:border-b-0 md:border-r border-(--color-border)">
              <StatStrip label="Expiring Soon" value={urgentItems.length}             icon={<IconClock />} urgent={urgentItems.length > 0} />
            </div>
            <div className="border-r border-(--color-border)">
              <StatStrip label="Categories"   value={Object.keys(byCategory).length} icon={<IconGrid />} />
            </div>
            <div>
              <StatStrip label="Est. Value"   value={`$${totalValue.toFixed(2)}`}    icon={<IconDollar />} />
            </div>
          </div>

          {/* Search bar + sort */}
          {items.length > 0 && (
            <div className="px-4 md:px-8 pb-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-faint) pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search items…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-(--color-border) bg-(--color-card) text-(--color-text-primary) text-sm placeholder:text-(--color-text-faint) focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-faint) hover:text-(--color-text-muted) transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortBy)}
                  title="Sort items"
                  className="shrink-0 px-3 py-2 rounded-xl border border-(--color-border) bg-(--color-card) text-(--color-text-muted) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition cursor-pointer hover:text-(--color-text-primary)"
                >
                  <option value="expiry">Expiry ↑</option>
                  <option value="name">Name A→Z</option>
                  <option value="recent">Recent first</option>
                </select>
              </div>
              {searchQuery && (
                <p className="text-xs text-(--color-text-faint) mt-1.5 px-1">
                  {displayItems.length} result{displayItems.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Alert strip */}
          {urgentItems.length > 0 && (
            <div className="mx-4 md:mx-8 mb-2 rounded-xl bg-(--color-urgent-bg) border border-red-200 px-4 py-3 flex items-start gap-3">
              <span className="shrink-0 text-red-400 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
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
            <div className="px-4 md:px-8 py-10 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-(--color-card-warm) border-2 border-dashed border-(--color-border) flex items-center justify-center text-stone-300 mb-5 mx-auto">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-(--color-text-primary) mb-1">
                  Welcome to Larder
                </h2>
                <p className="text-sm text-(--color-text-muted) max-w-sm mx-auto">
                  Track everything in your kitchen so nothing goes to waste. Get started in seconds.
                </p>
              </div>

              {/* Two CTA cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <Link href="/scan" className="group bg-(--color-card) rounded-2xl border border-(--color-border) p-5 hover:border-(--color-brand-light) hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-(--color-brand-xlight) text-(--color-brand) flex items-center justify-center mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                  <p className="font-semibold text-(--color-text-primary) text-sm mb-0.5">Scan a receipt</p>
                  <p className="text-xs text-(--color-text-muted) leading-snug">Snap a grocery receipt — Claude AI reads every item in seconds.</p>
                  <p className="text-xs text-(--color-brand) font-medium mt-2 group-hover:underline">Open scanner →</p>
                </Link>

                <button onClick={() => setAddingItem(true)} className="group text-left bg-(--color-card) rounded-2xl border border-(--color-border) p-5 hover:border-(--color-brand-light) hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-(--color-brand-xlight) text-(--color-brand) flex items-center justify-center mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                  <p className="font-semibold text-(--color-text-primary) text-sm mb-0.5">Add an item</p>
                  <p className="text-xs text-(--color-text-muted) leading-snug">Type it in manually — name, quantity, category, and expiry date.</p>
                  <p className="text-xs text-(--color-brand) font-medium mt-2 group-hover:underline">Add item →</p>
                </button>
              </div>

              {/* Tips */}
              <div className="bg-(--color-card-warm) rounded-2xl border border-(--color-border) p-4">
                <p className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest mb-2">A few things to know</p>
                <ul className="text-sm text-(--color-text-muted) space-y-1.5">
                  <li className="flex gap-2"><span className="text-(--color-brand) shrink-0">·</span>Larder estimates expiry dates — adjust them anytime by clicking an item.</li>
                  <li className="flex gap-2"><span className="text-(--color-brand) shrink-0">·</span>The colored bar shows freshness: green is fresh, red means use soon.</li>
                  <li className="flex gap-2"><span className="text-(--color-brand) shrink-0">·</span>Click <strong className="text-(--color-text-primary)">Used</strong> when you finish something — it tracks what you actually consume.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Category groups */}
          {Object.entries(visibleDisplayCategories).map(([cat, catItems]) => (
            <section key={cat} className="mb-5">
              <div className="px-4 md:px-8 mb-1 mt-5 flex items-center gap-2">
                <div className="w-0.5 h-3.5 rounded-full bg-(--color-brand) opacity-60 shrink-0" />
                <span className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest">{cat}</span>
                <span className="ml-auto text-xs font-medium text-(--color-text-faint) bg-stone-100 px-1.5 py-0.5 rounded-md">{catItems.length}</span>
              </div>
              <div className="mx-4 md:mx-8 bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_1px_4px_rgba(0,0,0,0.04)] divide-y divide-(--color-border) overflow-hidden">
                {catItems.map((item) => (
                  <div key={item.id} className="px-4 py-3.5 group hover:bg-(--color-card-warm) transition-colors duration-100">
                    {/* Top row: name + expiry badge (inline) + actions far right */}
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => setViewing(item)}
                        className="font-medium text-(--color-text-primary) capitalize text-sm leading-snug text-left hover:text-(--color-brand) transition-colors"
                      >
                        {item.canonical_name}
                      </button>
                      <ExpiryBadge expiry={item.est_expiry} />
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => setEditing(item)}
                          title="Edit"
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center text-(--color-text-faint) hover:text-(--color-brand) hover:bg-stone-100"
                        ><IconPencil /></button>
                        <button
                          onClick={() => deleteItem(item)}
                          title="Delete"
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center text-(--color-text-faint) hover:text-red-500 hover:bg-red-50"
                        ><IconTrash /></button>
                      </div>
                    </div>
                    {/* Bottom row: decrement + qty + freshness bar + used */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decrementItem(item)}
                        disabled={decrementing === item.id || consuming === item.id}
                        title="Use one"
                        className="shrink-0 text-xs w-5 h-5 rounded-full border border-(--color-border) flex items-center justify-center text-(--color-text-faint) hover:border-(--color-brand) hover:text-(--color-brand) disabled:opacity-30 transition-colors"
                      >−</button>
                      <p className="text-xs text-(--color-text-faint) shrink-0">
                        {decrementing === item.id ? "…" : `${item.quantity} ${item.unit}`}
                      </p>
                      <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${urgencyBarColor(item.est_expiry)}`}
                          style={{ width: `${urgencyBarWidth(item)}%` }}
                        />
                      </div>
                      <button
                        onClick={() => markUsed(item)}
                        disabled={consuming === item.id || decrementing === item.id}
                        title="Mark all used"
                        className="shrink-0 text-xs px-2 py-0.5 rounded-full border border-(--color-border) text-(--color-text-faint) hover:border-red-200 hover:text-red-500 hover:bg-(--color-urgent-bg) disabled:opacity-30 transition-colors"
                      >
                        {consuming === item.id ? "…" : "Used"}
                      </button>
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
        className="md:hidden fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-(--color-brand) text-white flex items-center justify-center shadow-lg hover:bg-(--color-brand-light) transition-all active:scale-95">
        <IconCamera />
      </Link>

      {/* Edit modal */}
      {viewing && (
        <DetailModal
          item={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null); }}
          onDelete={() => { deleteItem(viewing); setViewing(null); }}
          onUsed={() => { markUsed(viewing); setViewing(null); }}
        />
      )}

      {editing && (
        <EditModal
          item={editing}
          onSave={editItem}
          onClose={() => setEditing(null)}
        />
      )}

      {addingItem && (
        <AddItemModal
          onSave={addItem}
          onClose={() => setAddingItem(false)}
        />
      )}

      {toast && <Toast message={toast} />}
    </main>
  );
}
