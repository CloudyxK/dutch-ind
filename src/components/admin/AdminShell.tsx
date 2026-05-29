"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop: fixed; mobile: drawer) */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right side: mobile top bar + main content */}
      <div className="flex-1 flex flex-col lg:ml-56">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-20"
          style={{ background: "#050507", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 hover:bg-white/[0.06] transition-colors"
            aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-bold uppercase tracking-[0.2em]">Admin</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto relative z-10">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
