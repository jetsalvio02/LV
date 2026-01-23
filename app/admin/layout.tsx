"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Plus,
  Menu,
  X,
  LogOut,
  Vote,
  ClipboardList,
} from "lucide-react";

const menu = [
  // { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Polls", href: "/admin/polls", icon: BarChart3 },
  { name: "Results", href: "/admin/results", icon: ClipboardList },
  // { name: "Create Poll", href: "/admin/polls/create", icon: Plus },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.replace("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex md:w-72 md:flex-col bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Voting Admin</h1>
            <p className="text-xs text-slate-400">Management Panel</p>
          </div>
        </div>

        <nav className="space-y-2 px-4 py-6 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="px-4 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">
            v1.0 Admin Dashboard
          </p>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR ================= */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-900 to-slate-950 z-50 md:hidden shadow-2xl border-r border-slate-800">
            <div className="p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Vote className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Voting Admin</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white transition p-1.5 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2 px-4 py-6">
              {menu.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">
        {/* ================= TOP NAVBAR ================= */}
        <header className="h-16 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setOpen(true)}
              className="text-slate-300 hover:text-white transition p-1.5 hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-semibold text-white">Admin Panel</span>
          </div>

          {/* Desktop title */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
            <h2 className="font-semibold text-lg text-white">
              Voting Administration
            </h2>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-red-500/10 transition-all duration-200 border border-red-500/20 hover:border-red-500/40"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* ================= PAGE CONTENT ================= */}
        <main className="flex-1 p-6 md:p-2 overflow-auto bg-white rounded">
          {children}
        </main>
      </div>
    </div>
  );
}
