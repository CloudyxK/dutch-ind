"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export default function ExportOrdersButton() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(false);

  function handleExport() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.location.href = `/api/admin/orders/export?${params.toString()}`;
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider border border-brand-gray-700 text-brand-gray-400 hover:border-white hover:text-white transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-brand-gray-900 border border-brand-gray-700 p-4 w-64 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest">Filter Tanggal (opsional)</p>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-brand-gray-500 block mb-1">Dari</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-brand-gray-800 border border-brand-gray-700 px-2 py-1.5 text-xs text-white focus:border-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-brand-gray-500 block mb-1">Sampai</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-brand-gray-800 border border-brand-gray-700 px-2 py-1.5 text-xs text-white focus:border-white outline-none"
              />
            </div>
            <button
              onClick={handleExport}
              className="w-full btn-primary text-xs py-2"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
