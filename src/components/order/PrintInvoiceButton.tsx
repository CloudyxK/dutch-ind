"use client";
import { Printer } from "lucide-react";
export default function PrintInvoiceButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
    >
      <Printer className="w-4 h-4" />
      Cetak / Simpan PDF
    </button>
  );
}
