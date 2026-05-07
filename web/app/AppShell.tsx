"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const AUTH_ROUTES = ["/login", "/signup"];

// SVG icons
const Icons = {
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  scan: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors duration-100 group ${
        active
          ? "bg-stone-100 text-(--color-text-primary) font-medium"
          : "text-(--color-text-muted) hover:bg-stone-50 hover:text-(--color-text-primary)"
      }`}
    >
      <span className={`shrink-0 ${active ? "text-(--color-brand)" : "text-stone-400 group-hover:text-stone-500"}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold text-(--color-text-faint) uppercase tracking-widest px-2.5 pt-4 pb-1">
      {label}
    </p>
  );
}

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

  if (isAuthPage) return <>{children}</>;
  if (checking) return null;

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "LA";

  return (
    <div className="flex flex-col h-dvh md:flex-row">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex md:w-56 md:shrink-0 md:flex-col bg-(--color-card) border-r border-(--color-border) py-3 gap-0.5">

        {/* Workspace header */}
        <div className="flex items-center gap-2.5 px-3 py-2 mx-1 rounded-md hover:bg-stone-50 cursor-pointer transition-colors mb-1">
          <div className="w-6 h-6 rounded-md bg-(--color-brand) flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            🧺
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-(--color-text-primary) truncate leading-tight">Larder</p>
            <p className="text-[11px] text-(--color-text-faint) truncate leading-tight">Your kitchen&apos;s memory</p>
          </div>
        </div>

        {/* Main nav */}
        <div className="px-2">
          <NavItem href="/" icon={Icons.home} label="Pantry" active={pathname === "/"} />
          <NavItem href="/scan" icon={Icons.scan} label="Scan receipt" active={pathname === "/scan"} />
        </div>

        {/* Quick actions section */}
        <div className="px-2">
          <SectionLabel label="Quick access" />
          <NavItem href="/" icon={Icons.alert} label="Expiring soon" active={false} />
        </div>

        {/* Bottom: user info + sign out */}
        <div className="mt-auto px-2 pt-2 border-t border-(--color-border) mx-1">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md mb-0.5">
            <div className="w-6 h-6 rounded-full bg-(--color-brand-xlight) border border-(--color-border) flex items-center justify-center text-[11px] font-bold text-(--color-brand) shrink-0">
              {initials}
            </div>
            <p className="text-xs text-(--color-text-muted) truncate flex-1">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-(--color-text-muted) hover:bg-stone-50 hover:text-red-600 transition-colors"
          >
            <span className="text-stone-400">{Icons.logout}</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-(--color-card) border-t border-(--color-border) flex h-16">
        {[
          { href: "/", icon: Icons.home, label: "Pantry" },
          { href: "/scan", icon: Icons.scan, label: "Scan" },
        ].map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                active ? "text-(--color-brand)" : "text-(--color-text-faint) hover:text-(--color-text-muted)"
              }`}
            >
              <span className={active ? "text-(--color-brand)" : "text-stone-400"}>{icon}</span>
              {label}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium text-(--color-text-faint) hover:text-red-500 transition-colors"
        >
          <span className="text-stone-400">{Icons.logout}</span>
          Sign out
        </button>
      </nav>
    </div>
  );
}
