"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const NAV = [
  { href: "/",     icon: "🧺", label: "Pantry" },
  { href: "/scan", icon: "📸", label: "Scan"   },
];

const AUTH_ROUTES = ["/login", "/signup"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const isAuthPage = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    if (isAuthPage) { setChecking(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        setChecking(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/login");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [isAuthPage, router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Auth pages: render without shell
  if (isAuthPage) return <>{children}</>;

  // Still checking session: blank screen (avoids flash)
  if (checking) return null;

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

        {/* User + logout at bottom */}
        <div className="mt-auto pt-4 border-t border-(--color-border)">
          <p className="text-xs text-(--color-text-faint) px-3 truncate mb-2">{user?.email}</p>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-(--color-text-muted) hover:bg-stone-50 hover:text-(--color-urgent-text) transition-colors"
          >
            <span>🚪</span> Sign out
          </button>
        </div>
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
        <button
          onClick={logout}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-(--color-text-faint) hover:text-(--color-urgent-text) transition-colors"
        >
          <span className="text-xl">🚪</span>
          Sign out
        </button>
      </nav>
    </div>
  );
}
