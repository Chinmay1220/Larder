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

const CATEGORIES = ["produce","dairy","meat","seafood","bakery","pantry","frozen","beverage","snack","household","other"] as const;

/* ── Hand-drawn line icons ── */
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
const IcoPlus = () => <Ico size={15}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Ico>;
const IcoSearch = () => <Ico size={14}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></Ico>;
const IcoPencil = () => <Ico size={13}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Ico>;
const IcoTrash = () => <Ico size={13}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></Ico>;
const IcoCamera = () => <Ico size={22}><path d="M3 8h3.5l1.8-2h7.4l1.8 2H21v12H3z" /><circle cx="12" cy="13" r="3.5" /></Ico>;
const IcoBell = () => <Ico size={18}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></Ico>;
const IcoGrid = () => <Ico size={14}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></Ico>;
const IcoClose = () => <Ico size={16}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Ico>;

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
  alert: "var(--color-alert)",
  soon: "var(--color-soon)",
  ok: "var(--color-ok)",
};
function expiryLabel(expiry: string) {
  const d = daysLeft(expiry);
  if (d < 0) return "expired";
  if (d === 0) return "expires today";
  if (d === 1) return "1 day left";
  return `${d} days left`;
}

/* Segmented freshness meter (5 ticks) */
function Segments({ item }: { item: PantryItem }) {
  const d = daysLeft(item.est_expiry);
  const shelf = item.shelf_life_days || 14;
  const filled = d < 0 ? 1 : Math.max(1, Math.min(5, Math.ceil((d / shelf) * 5)));
  const color = TIER_VAR[tierOf(item.est_expiry)];
  return (
    <div className="flex gap-[3px] shrink-0" aria-hidden>
      {[0, 1, 2, 3, 4].map((k) => (
        <span key={k} className="w-[5px] h-4 rounded-[2px]"
          style={{ background: k < filled ? color : "var(--color-border)" }} />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse px-4 md:px-8 py-4">
      <div className="h-28 rounded-3xl bg-(--color-card-warm) mb-4" />
      <div className="flex gap-2 mb-4">{[...Array(3)].map((_, i) => <div key={i} className="h-9 w-24 rounded-full bg-(--color-card-warm)" />)}</div>
      {[...Array(4)].map((_, r) => <div key={r} className="h-16 rounded-2xl bg-(--color-card-warm) mb-2.5" />)}
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-(--color-text-primary) text-(--color-surface) text-sm px-4 py-2 rounded-full shadow-lg whitespace-nowrap pointer-events-none animate-fade-in">
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
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-sm font-medium text-(--color-text-muted) hover:bg-(--color-card-warm) transition-colors">
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

function AddItemModal({ onSave, onClose }: {
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
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Whole milk" className={inputCls} />
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
            <p className="text-xs text-(--color-urgent-text) bg-(--color-urgent-bg) px-3 py-2 rounded-lg border border-(--color-border)">{error}</p>
          )}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-sm font-medium text-(--color-text-muted) hover:bg-(--color-card-warm) transition-colors">
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

function DetailModal({ item, onClose, onEdit, onDelete, onUsed }: {
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
        <div className="px-5 pt-5 pb-4 border-b border-(--color-border)">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-(--color-surface) flex items-center justify-center text-(--color-brand) shrink-0"><CatIcon cat={item.category} /></div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-(--color-text-primary) text-base capitalize leading-snug">{item.canonical_name}</h3>
              <p className="text-xs text-(--color-text-faint) capitalize mt-0.5">{item.category}</p>
            </div>
            <button onClick={onClose} className="text-(--color-text-faint) hover:text-(--color-text-muted) transition-colors -mt-1 -mr-1 p-1"><IcoClose /></button>
          </div>
        </div>

        <dl className="px-5 py-4 space-y-3">
          <Row label="Quantity" value={`${item.quantity} ${item.unit}`} />
          {item.price != null && <Row label="Price" value={`$${item.price.toFixed(2)}`} />}
          <Row label="Expires" value={
            <span className="flex items-center gap-2">
              {expiryDate}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ background: TIER_VAR[tierOf(item.est_expiry)] }}>
                {d < 0 ? "Expired" : d === 0 ? "Today" : `in ${d}d`}
              </span>
            </span>
          } />
          {purchasedDate && (
            <Row label="Added" value={`${purchasedDate}${daysSincePurchase != null ? ` (${daysSincePurchase}d ago)` : ""}`} />
          )}
          <Row label="Shelf life" value={`${item.shelf_life_days} days`} />
        </dl>

        <div className="px-5 pb-5 grid grid-cols-3 gap-2">
          <button onClick={onEdit} className="py-2.5 rounded-xl border border-(--color-border) text-sm font-medium text-(--color-text-muted) hover:bg-(--color-card-warm) hover:text-(--color-text-primary) transition-colors">Edit</button>
          <button onClick={onUsed} className="py-2.5 rounded-xl border border-(--color-border) text-sm font-medium text-(--color-text-muted) hover:bg-(--color-card-warm) hover:text-(--color-text-primary) transition-colors">Used</button>
          <button onClick={onDelete} className="py-2.5 rounded-xl border border-(--color-border) bg-(--color-urgent-bg) text-sm font-medium text-(--color-urgent-text) hover:brightness-95 transition">Delete</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-mono text-[10px] font-medium text-(--color-text-faint) uppercase tracking-wider">{label}</dt>
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
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.access_token ?? "";
      setEmail(session?.user?.email ?? "");
      fetch(`${API}/pantry`, { headers: { "Authorization": `Bearer ${token}` } })
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
      await fetch(`${API}/pantry/${item.id}/consumed`, { method: "PATCH", headers: { "Authorization": `Bearer ${token}` } });
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
      const res = await fetch(`${API}/pantry/${item.id}/decrement`, { method: "PATCH", headers: { "Authorization": `Bearer ${token}` } });
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
    await fetch(`${API}/pantry/${item.id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
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
    setItems(prev => [...prev, newItem].sort((a, b) => new Date(a.est_expiry).getTime() - new Date(b.est_expiry).getTime()));
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
      return tb - ta;
    }
    return new Date(a.est_expiry).getTime() - new Date(b.est_expiry).getTime();
  });

  const byDisplayCategory = displayItems.reduce<Record<string, PantryItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  const visibleDisplayCategories = activeFilter === "all"
    ? byDisplayCategory
    : byDisplayCategory[activeFilter] ? { [activeFilter]: byDisplayCategory[activeFilter] } : {};

  const urgentItems = items.filter(i => daysLeft(i.est_expiry) <= 3);
  const expiredCount = items.filter(i => daysLeft(i.est_expiry) < 0).length;

  const freshPct = items.length ? Math.round((items.filter(i => daysLeft(i.est_expiry) > 3).length / items.length) * 100) : 100;

  // 7-day expiry week strip
  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const hit = items.some(it => daysLeft(it.est_expiry) === i);
    const tier = hit ? (i <= 1 ? "alert" : i <= 3 ? "soon" : "ok") : null;
    const dt = new Date(); dt.setDate(dt.getDate() + i);
    return { tier, letter: dt.toLocaleDateString("en-US", { weekday: "narrow" }) };
  });

  const initials = email ? email.slice(0, 2).toUpperCase() : "LA";
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  return (
    <main className="min-h-full bg-(--color-surface)">
      {/* Header */}
      <div className="px-4 md:px-8 pt-6 pb-2 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-(--color-text-primary) text-(--color-surface) grid place-items-center font-bold text-[15px] shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-faint)">{greeting}</p>
          <h1 className="text-[17px] font-bold text-(--color-text-primary) tracking-tight leading-tight -mt-0.5">Your pantry</h1>
        </div>
        {!loading && !error && (
          <button onClick={() => setAddingItem(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-(--color-brand) text-white text-sm font-semibold hover:bg-(--color-brand-light) transition-colors shadow-sm">
            <IcoPlus /> Add
          </button>
        )}
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="mx-4 md:mx-8 mt-4 rounded-xl bg-(--color-urgent-bg) border border-(--color-border) px-4 py-3 text-sm text-(--color-urgent-text) font-medium">
          Could not reach the backend. Check your connection and try again.
        </div>
      )}

      {loading ? <Skeleton /> : !error && items.length > 0 && (
        <>
          {/* Freshness + week-strip panel */}
          <section className="px-4 md:px-8 my-3">
            <div className="rounded-3xl border border-(--color-border) bg-(--color-card) p-5 flex items-center gap-5 shadow-[0_10px_26px_-18px_rgba(90,70,30,.5)]">
              <div className="shrink-0">
                <div className="text-[46px] leading-[0.85] font-bold tracking-tight tabular-nums text-(--color-text-primary)">
                  {freshPct}<span className="text-lg">%</span>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-(--color-brand) mt-1.5">fresh</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-wider text-(--color-text-faint) mb-2.5">This week</div>
                <div className="flex justify-between">
                  {weekDots.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <span className="w-[9px] h-[9px] rounded-full"
                        style={{ background: d.tier ? TIER_VAR[d.tier] : "var(--color-border)" }} />
                      <span className="font-mono text-[9px] text-(--color-text-faint)">{d.letter}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Search + sort */}
          <div className="px-4 md:px-8 pb-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-faint) pointer-events-none"><IcoSearch /></span>
                <input type="text" placeholder="Search your pantry…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-(--color-border) bg-(--color-card) text-(--color-text-primary) text-sm placeholder:text-(--color-text-faint) focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-faint) hover:text-(--color-text-muted)"><IcoClose /></button>
                )}
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} title="Sort items"
                className="shrink-0 px-3 py-2.5 rounded-xl border border-(--color-border) bg-(--color-card) text-(--color-text-muted) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand) focus:border-transparent transition cursor-pointer">
                <option value="expiry">Expiry ↑</option>
                <option value="name">Name A→Z</option>
                <option value="recent">Recent first</option>
              </select>
            </div>
            {searchQuery && (
              <p className="font-mono text-[10px] text-(--color-text-faint) mt-2 px-1">
                {displayItems.length} result{displayItems.length !== 1 ? "s" : ""} for “{searchQuery}”
              </p>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 px-4 md:px-8 pb-3 overflow-x-auto scrollbar-none">
            {["all", ...Object.keys(byCategory)].map(cat => (
              <button key={cat} onClick={() => setActiveFilter(cat)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold capitalize transition-colors border-[1.5px]
                  ${activeFilter === cat
                    ? "bg-(--color-text-primary) text-(--color-surface) border-(--color-text-primary)"
                    : "bg-(--color-card) text-(--color-text-muted) border-(--color-border) hover:border-(--color-brand)"}`}>
                {cat === "all" ? <IcoGrid /> : <CatIcon cat={cat} size={14} />}
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Category groups → crafted rows */}
          {Object.entries(visibleDisplayCategories).map(([cat, catItems]) => (
            <section key={cat} className="mb-4">
              <div className="px-4 md:px-8 mb-2 mt-4 flex items-baseline gap-2">
                <span className="font-mono text-[10px] font-semibold text-(--color-text-muted) uppercase tracking-widest">{cat}</span>
                <span className="ml-auto font-mono text-[10px] text-(--color-text-faint)">{catItems.length}</span>
              </div>
              <div className="px-4 md:px-8 flex flex-col gap-2.5">
                {catItems.map((item) => (
                  <div key={item.id}
                    className="relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-card) pl-4 pr-3.5 py-3 shadow-[0_5px_16px_-12px_rgba(90,70,30,.5)] group">
                    <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: TIER_VAR[tierOf(item.est_expiry)] }} />
                    {/* identity */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-(--color-surface) flex items-center justify-center text-(--color-brand) shrink-0">
                        <CatIcon cat={item.category} />
                      </div>
                      <button onClick={() => setViewing(item)} className="flex-1 min-w-0 text-left">
                        <p className="font-bold text-sm text-(--color-text-primary) capitalize leading-snug truncate group-hover:text-(--color-brand) transition-colors">{item.canonical_name}</p>
                        <p className="font-mono text-[10px] text-(--color-text-faint) mt-0.5 capitalize">{item.category} · {expiryLabel(item.est_expiry)}</p>
                      </button>
                      <Segments item={item} />
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setEditing(item)} title="Edit"
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center text-(--color-text-faint) hover:text-(--color-brand) hover:bg-(--color-surface)"><IcoPencil /></button>
                        <button onClick={() => deleteItem(item)} title="Delete"
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center text-(--color-text-faint) hover:text-(--color-alert) hover:bg-(--color-urgent-bg)"><IcoTrash /></button>
                      </div>
                    </div>
                    {/* controls */}
                    <div className="flex items-center gap-2 mt-2.5 pl-[52px]">
                      <button onClick={() => decrementItem(item)} disabled={decrementing === item.id || consuming === item.id} title="Use one"
                        className="shrink-0 w-6 h-6 rounded-full border border-(--color-border) flex items-center justify-center text-(--color-text-faint) hover:border-(--color-brand) hover:text-(--color-brand) disabled:opacity-30 transition-colors leading-none">−</button>
                      <span className="font-mono text-[11px] text-(--color-text-muted) shrink-0">
                        {decrementing === item.id ? "…" : `${item.quantity} ${item.unit}`}
                      </span>
                      <span className="flex-1" />
                      <button onClick={() => markUsed(item)} disabled={consuming === item.id || decrementing === item.id} title="Mark all used"
                        className="shrink-0 font-mono text-[10px] uppercase tracking-wide px-3 py-1.5 rounded-full border border-(--color-border) text-(--color-text-muted) hover:border-(--color-ok) hover:text-(--color-ok) disabled:opacity-30 transition-colors">
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

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-(--color-card) border border-(--color-border) flex items-center justify-center text-(--color-brand) mb-5 mx-auto shadow-[0_10px_26px_-18px_rgba(90,70,30,.5)]">
              <CatIcon cat="other" size={34} />
            </div>
            <h2 className="text-xl font-bold text-(--color-text-primary) mb-1">Welcome to Larder</h2>
            <p className="text-sm text-(--color-text-muted) max-w-sm mx-auto">Track everything in your kitchen so nothing goes to waste. Get started in seconds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/scan" className="group bg-(--color-card) rounded-2xl border border-(--color-border) p-5 hover:border-(--color-brand) transition-all">
              <div className="w-10 h-10 rounded-xl bg-(--color-surface) text-(--color-brand) flex items-center justify-center mb-3"><IcoCamera /></div>
              <p className="font-bold text-(--color-text-primary) text-sm mb-0.5">Scan a receipt</p>
              <p className="text-xs text-(--color-text-muted) leading-snug">Snap a grocery receipt — Claude AI reads every item in seconds.</p>
            </Link>
            <button onClick={() => setAddingItem(true)} className="group text-left bg-(--color-card) rounded-2xl border border-(--color-border) p-5 hover:border-(--color-brand) transition-all">
              <div className="w-10 h-10 rounded-xl bg-(--color-surface) text-(--color-brand) flex items-center justify-center mb-3"><IcoPlus /></div>
              <p className="font-bold text-(--color-text-primary) text-sm mb-0.5">Add an item</p>
              <p className="text-xs text-(--color-text-muted) leading-snug">Type it in manually — name, quantity, category, and expiry date.</p>
            </button>
          </div>
        </div>
      )}

      {/* Alert note */}
      {!loading && !error && urgentItems.length > 0 && (
        <p className="px-4 md:px-8 pb-24 md:pb-8 font-mono text-[10px] text-(--color-text-faint)">
          {urgentItems.length} item{urgentItems.length !== 1 ? "s" : ""} need attention{expiredCount > 0 ? ` · ${expiredCount} expired` : ""}
        </p>
      )}

      {/* Mobile scan FAB */}
      <Link href="/scan"
        className="md:hidden fixed bottom-20 right-5 z-50 w-14 h-14 rounded-2xl bg-(--color-brand) text-white flex items-center justify-center shadow-lg hover:bg-(--color-brand-light) transition-all active:scale-95">
        <IcoCamera />
      </Link>

      {viewing && (
        <DetailModal item={viewing} onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null); }}
          onDelete={() => { deleteItem(viewing); setViewing(null); }}
          onUsed={() => { markUsed(viewing); setViewing(null); }} />
      )}
      {editing && <EditModal item={editing} onSave={editItem} onClose={() => setEditing(null)} />}
      {addingItem && <AddItemModal onSave={addItem} onClose={() => setAddingItem(false)} />}
      {toast && <Toast message={toast} />}
    </main>
  );
}
