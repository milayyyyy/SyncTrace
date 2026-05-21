"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  FileSearch,
  GitBranch,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

function SidebarNav({
  items,
  pathname,
  onNavigate,
}: Readonly<{
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}>) {
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-white/15 text-white"
                : "text-white/55 hover:bg-white/8 hover:text-white"
            )}
          >
            <item.icon
              className={cn("h-4 w-4 shrink-0", active ? "text-brand-gold" : "text-white/40")}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAuthenticated } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [userMenuOpen]);

  if (!isAuthenticated || !user) return <>{children}</>;

  const wsId = workspace?.id ?? "ws-1";
  const isAdviser = user.role === "FACULTY_ADVISER";
  const homeHref = isAdviser ? "/adviser/dashboard" : "/dashboard";

  const studentNav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `/workspace`, label: "Workspace", icon: Layers, exact: true },
    { href: `/workspace/${wsId}/artifacts`, label: "Artifacts", icon: Upload },
    { href: `/workspace/${wsId}/gaps`, label: "Gap Analysis", icon: GitBranch },
    { href: `/workspace/${wsId}/audit`, label: "Audit", icon: FileSearch },
  ];

  const adviserNav: NavItem[] = [
    { href: "/adviser/dashboard", label: "Groups", icon: Users },
  ];

  const navItems = isAdviser ? adviserNav : studentNav;

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5 shrink-0">
        <Link
          href={homeHref}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 min-w-0"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gold">
            <GitBranch className="h-4 w-4 text-[#0a1628]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate font-heading">SyncTrace</p>
            <p className="text-xs text-white/40 truncate tracking-wide">Academic Audit</p>
          </div>
        </Link>
      </div>



      <div className="flex-1 overflow-y-auto py-4">
        <p className="px-5 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em]">
          {isAdviser ? "Faculty" : "Navigation"}
        </p>
        <SidebarNav
          items={navItems}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <div className="border-t border-white/10 p-4 shrink-0 relative" ref={userMenuRef}>
        {userMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 rounded-xl border border-white/10 bg-[#0d1f3c] shadow-2xl overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <div className="border-t border-white/10" />
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setUserMenuOpen((o) => !o)}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/8 transition-colors"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-sm font-semibold text-brand-gold">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-white/40 truncate">
              {isAdviser ? "Faculty Adviser" : "Student"}
            </p>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-white/25" />
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 bg-[#0a1628] border-r border-white/10">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-navy/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0a1628] border-r border-white/10 transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
        {mobileOpen && sidebarContent}
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-card/90 backdrop-blur-md px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5 text-brand-navy" />
          </Button>
          <Link href={homeHref} className="text-sm font-bold text-brand-navy font-heading">
            SyncTrace
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
