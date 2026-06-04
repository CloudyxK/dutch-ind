"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gray-500 mb-4">Error</p>
          <h1 className="text-4xl font-display tracking-widest uppercase mb-3">Terjadi Kesalahan</h1>
          <p className="text-sm text-brand-gray-400 mb-8">Sesuatu tidak berjalan dengan baik. Coba muat ulang halaman.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="btn-primary px-6 py-2.5 text-sm">Coba Lagi</button>
            <Link href="/" className="px-6 py-2.5 text-sm border border-brand-gray-700 hover:border-white transition-colors">Beranda</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
