"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  orderId: string;
};

export default function CancelOrderButton({ orderId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCancel() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal membatalkan pesanan");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-red-800 text-red-400 hover:bg-red-900/20 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Batalkan Pesanan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-brand-gray-900 border border-brand-gray-700 w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Batalkan Pesanan?</h3>
            </div>
            <p className="text-sm text-brand-gray-400 mb-5 leading-relaxed">
              Pesanan yang dibatalkan tidak dapat dipulihkan. Stok produk akan dikembalikan secara otomatis.
            </p>

            {error && (
              <p className="text-xs text-red-400 mb-4 bg-red-900/20 border border-red-800 px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setOpen(false); setError(""); }}
                disabled={loading}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest border border-brand-gray-600 text-brand-gray-300 hover:border-white hover:text-white transition-colors disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest bg-red-900/40 border border-red-700 text-red-300 hover:bg-red-900/60 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
