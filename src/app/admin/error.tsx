"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
      <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gray-500 mb-3">Admin Error</p>
      <h2 className="text-2xl font-display tracking-widest uppercase mb-3">Gagal Memuat Data</h2>
      <p className="text-sm text-brand-gray-400 mb-6 text-center max-w-sm">
        Terjadi kesalahan saat memuat halaman admin. Coba refresh atau periksa koneksi database.
      </p>
      <button onClick={reset} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>
    </div>
  );
}
