"use client";

import { useState } from "react";

function MockPantry() {
  const items = [
    { name: "Blueberries", bar: "w-2/12", color: "bg-red-400", label: "Today" },
    { name: "Whole milk", bar: "w-5/12", color: "bg-amber-400", label: "3d left" },
    { name: "Gold potatoes", bar: "w-9/12", color: "bg-emerald-400", label: "18d left" },
    { name: "Cheddar cheese", bar: "w-7/12", color: "bg-emerald-400", label: "12d left" },
  ];
  return (
    <div className="bg-(--color-surface) p-4 space-y-3 select-none">
      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium">
        ⚠ Blueberries expiring today
      </div>
      <div className="flex gap-2 flex-wrap">
        {["All", "Produce", "Dairy", "Pantry"].map((c) => (
          <span key={c} className="text-xs px-2.5 py-1 rounded-full border border-(--color-border) text-(--color-text-muted) bg-(--color-card)">{c}</span>
        ))}
      </div>
      {items.map((item) => (
        <div key={item.name} className="bg-(--color-card) rounded-xl border border-(--color-border) px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-(--color-text-primary)">{item.name}</span>
            <span className="text-xs text-(--color-text-faint)">{item.label}</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className={`h-1.5 rounded-full ${item.bar} ${item.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MockScan() {
  return (
    <div className="bg-(--color-surface) p-5 select-none">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-full bg-(--color-brand) text-white text-xs font-bold flex items-center justify-center">1</div>
        <div className="flex-1 h-0.5 bg-(--color-border)" />
        <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-400 text-xs font-bold flex items-center justify-center">2</div>
        <div className="flex-1 h-0.5 bg-(--color-border)" />
        <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-400 text-xs font-bold flex items-center justify-center">3</div>
      </div>
      <div className="border-2 border-dashed border-(--color-brand-light) rounded-2xl p-6 text-center bg-(--color-brand-xlight)/40">
        <div className="text-3xl mb-2">📷</div>
        <p className="text-sm font-semibold text-(--color-text-primary) mb-1">Drop your receipt here</p>
        <p className="text-xs text-(--color-text-faint)">Image, PDF, Excel, Word, CSV or TXT</p>
      </div>
      <div className="mt-4 bg-(--color-brand) text-white text-sm font-semibold text-center py-2.5 rounded-xl">
        Process Receipt →
      </div>
    </div>
  );
}

function MockAlerts() {
  return (
    <div className="bg-(--color-surface) p-4 space-y-3 select-none">
      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium">
        ⚠ 2 items expiring soon — Blueberries, Spinach
      </div>
      {[
        { name: "Blueberries", badge: "Expired", bar: "w-full", color: "bg-red-400", label: "2d ago" },
        { name: "Spinach", badge: "Today", bar: "w-1/12", color: "bg-red-400", label: "Today" },
        { name: "Greek yogurt", badge: null, bar: "w-4/12", color: "bg-amber-400", label: "2d left" },
      ].map((item) => (
        <div key={item.name} className="bg-(--color-card) rounded-xl border border-(--color-border) px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-(--color-text-primary)">{item.name}</span>
              {item.badge && (
                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">{item.badge}</span>
              )}
            </div>
            <span className="text-xs text-(--color-text-faint)">{item.label}</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className={`h-1.5 rounded-full ${item.bar} ${item.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

const tabs = [
  {
    label: "Pantry",
    icon: "📦",
    headline: "Always know what you have",
    body: "Every receipt you scan updates your pantry automatically. Color-coded freshness bars show what to use first — green for fresh, amber for soon, red for now.",
    features: ["Freshness bars on every item", "Category filters (Produce, Dairy, Pantry)", "Edit, delete, or decrement quantities"],
    renderMock: () => <MockPantry />,
  },
  {
    label: "Scanning",
    icon: "📸",
    headline: "Snap. Done.",
    body: "Photograph a receipt or upload a PDF. Claude AI reads every item in seconds — no manual entry, ever. Works with JPEG, PNG, PDF, Excel, Word, CSV and more.",
    features: ["AI reads any receipt format", "Results in under 15 seconds", "10 scans per minute, unlimited total"],
    renderMock: () => <MockScan />,
  },
  {
    label: "Alerts",
    icon: "🔔",
    headline: "Nothing slips to the back of the fridge",
    body: "A red alert strip appears the moment something is about to expire. Expired items stay visible with a badge until you mark them used — nothing disappears silently.",
    features: ["Red alert strip for upcoming expiries", "Expired badge stays visible", "Nightly expiry check runs automatically"],
    renderMock: () => <MockAlerts />,
  },
];

export default function TabbedFeatures() {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  return (
    <div>
      {/* Tab pills */}
      <div className="flex gap-3 justify-center mb-14 flex-wrap">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              i === active
                ? "bg-(--color-brand) text-white shadow-sm"
                : "bg-(--color-card) text-(--color-text-muted) border border-(--color-border) hover:border-(--color-text-faint)"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center px-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-(--color-brand) uppercase mb-3">{tab.label}</p>
          <h2 className="font-[family-name:--font-display] text-4xl text-(--color-text-primary) mb-4 leading-tight">
            {tab.headline}
          </h2>
          <p className="text-(--color-text-muted) leading-relaxed mb-6">{tab.body}</p>
          <ul className="space-y-2.5">
            {tab.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-(--color-text-muted)">
                <span className="w-5 h-5 rounded-full bg-(--color-brand-xlight) text-(--color-brand) text-xs flex items-center justify-center shrink-0 font-bold">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <a
            href="https://larder-theta.vercel.app"
            className="inline-block mt-8 bg-(--color-brand) text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-(--color-brand-dark) transition-colors"
          >
            Try it free →
          </a>
        </div>

        <div className="rounded-2xl border border-(--color-border) shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden bg-(--color-card)">
          <div className="bg-stone-50 border-b border-(--color-border) px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-amber-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 bg-stone-200/60 rounded-md h-4 max-w-[180px]" />
          </div>
          {tab.renderMock()}
        </div>
      </div>
    </div>
  );
}
