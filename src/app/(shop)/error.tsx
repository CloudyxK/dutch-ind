"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft } from "lucide-react";

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[ShopError]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
      <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gray-500 mb-4">Terjadi Kesalahan</p>
      <h2 className="text-2xl font-display tracking-widest uppercase mb-3">Halaman Tidak Bisa Dimuat</h2>
      <p className="text-sm text-brand-gray-400 text-center max-w-sm mb-8">
        Sesuatu tidak berjalan seperti yang diharapkan. Coba muat ulang atau kembali ke beranda.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          <RefreshCw className="w-4 h-4" /> Coba Lagi
        </button>
        <Link href="/" className="flex items-center gap-2 px-5 py-2.5 text-sm border border-brand-gray-700 hover:border-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Beranda
        </Link>
      </div>
    </div>
  );
}
