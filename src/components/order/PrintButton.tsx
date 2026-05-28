"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-brand-gray-200 transition-colors flex items-center gap-2"
    >
      <Printer className="w-3.5 h-3.5" />
      Cetak / Simpan PDF
    </button>
  );
}
