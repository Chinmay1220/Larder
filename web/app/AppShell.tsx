"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/",     icon: "🧺", label: "Pantry"  },
  { href: "/scan", icon: "📸", label: "Scan"    },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-dvh md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:shrink-0 md:flex-col bg-(--color-card) border-r border-(--color-border) px-4 py-7 gap-1">
        <div className="px-2 mb-7">
          <h1 className="text-2xl font-[family-name:--font-display] text-(--color-text-primary) tracking-tight">
            Larder
          </h1>
          <p className="text-xs text-(--color-text-faint) mt-0.5">Pantry tracker</p>
        </div>
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-100
                ${active
                  ? "bg-(--color-brand-xlight) text-(--color-brand)"
                  : "text-(--color-text-muted) hover:bg-stone-50 hover:text-(--color-text-primary)"
                }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-(--color-card) border-t border-(--color-border) flex h-16">
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors
                ${active ? "text-(--color-brand)" : "text-(--color-text-faint) hover:text-(--color-text-muted)"}`}
            >
              <span className={`text-xl transition-transform ${active ? "scale-110" : ""}`}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
