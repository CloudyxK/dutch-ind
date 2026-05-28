"use client";

import { useState } from "react";
import { RotateCcw, Loader2, CheckCircle } from "lucide-react";

const REASONS = [
  "Produk cacat / rusak saat diterima",
  "Ukuran tidak sesuai",
  "Warna / produk berbeda dari foto",
  "Produk tidak sesuai deskripsi",
  "Lainnya",
];

type ExistingReturn = {
  status: string;
  reason: string;
  adminNote?: string | null;
};

type Props = {
  orderId: string;
  existingReturn?: ExistingReturn | null;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:  "Menunggu Review Admin",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  RESOLVED: "Selesai",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:  "text-yellow-400",
  APPROVED: "text-green-400",
  REJECTED: "text-red-400",
  RESOLVED: "text-blue-400",
};

export default function ReturnRequestButton({ orderId, existingReturn }: Props) {
  const [open, setOpen]         = useState(false);
  const [reason, setReason]     = useState(REASONS[0]);
  const [detail, setDetail]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (existingReturn) {
    return (
      <div className="border border-brand-gray-700 p-4 text-sm">
        <p className="text-xs font-bold uppercase tracking-widest mb-2 text-brand-gray-400">
          Permintaan Return
        </p>
        <p className={`font-semibold ${STATUS_COLOR[existingReturn.status] ?? "text-white"}`}>
          {STATUS_LABEL[existingReturn.status] ?? existingReturn.status}
        </p>
        <p className="text-xs text-brand-gray-400 mt-1">{existingReturn.reason}</p>
        {existingReturn.adminNote && (
          <p className="text-xs text-brand-gray-300 mt-2 border-t border-brand-gray-700 pt-2">
            Catatan admin: {existingReturn.adminNote}
          </p>
        )}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <CheckCircle className="w-4 h-4" />
        Permintaan return berhasil dikirim. Admin akan menghubungi kamu dalam 1×24 jam.
      </div>
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, detail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal mengirim permintaan"); return; }
      setOpen(false);
      setSubmitted(true);
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
        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-brand-gray-600 text-brand-gray-300 hover:border-white hover:text-white transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Ajukan Return
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-brand-gray-900 border border-brand-gray-700 w-full max-w-md p-6">
            <h3 className="font-bold uppercase tracking-wider text-sm mb-1">Ajukan Return / Pengembalian</h3>
            <p className="text-xs text-brand-gray-400 mb-5">
              Pengembalian dapat dilakukan dalam 14 hari setelah barang diterima.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-brand-gray-400">
                  Alasan Return
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-white"
                >
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-brand-gray-400">
                  Detail (opsional)
                </label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Jelaskan lebih detail kondisi produk atau masalah yang dialami..."
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-white resize-none placeholder:text-brand-gray-600"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 mt-3 bg-red-900/20 border border-red-800 px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setOpen(false); setError(""); }}
                disabled={loading}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest border border-brand-gray-600 text-brand-gray-300 hover:border-white hover:text-white transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-brand-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Kirim Permintaan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
