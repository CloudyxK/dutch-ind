"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Eye, Loader2, X } from "lucide-react";

type Props = {
  orderId:       string;
  proofImageUrl: string | null;
  paymentStatus: string;
  paymentMethod?: string;
  orderStatus?:   string;
};

export default function AdminManualPaymentActions({ orderId, proofImageUrl, paymentStatus, paymentMethod, orderStatus }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [rejecting,  setRejecting]  = useState(false);
  const [showProof,  setShowProof]  = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason,     setReason]     = useState("");

  const confirm = async () => {
    if (!confirm) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm-payment`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Gagal konfirmasi"); return; }
      toast.success("Pembayaran dikonfirmasi — pesanan diproses");
      router.refresh();
    } finally {
      setConfirming(false);
    }
  };

  const reject = async () => {
    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject-payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Bukti transfer tidak valid" }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Gagal menolak"); return; }
      toast.success("Pembayaran ditolak");
      setShowReject(false);
      setReason("");
      router.refresh();
    } finally {
      setRejecting(false);
    }
  };

  const [confirmingCod, setConfirmingCod] = useState(false);

  const confirmCod = async () => {
    setConfirmingCod(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm-cod`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Gagal konfirmasi COD"); return; }
      toast.success("COD lunas — pesanan selesai");
      router.refresh();
    } finally {
      setConfirmingCod(false);
    }
  };

  // COD payment display
  if (paymentMethod === "COD") {
    const isPaid = paymentStatus === "SUCCESS";
    const canConfirm = !isPaid && ["DELIVERED", "SHIPPED"].includes(orderStatus || "");
    return (
      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">COD</p>
        {isPaid ? (
          <p className="text-[10px] text-green-400">✓ Lunas diterima</p>
        ) : canConfirm ? (
          <button onClick={confirmCod} disabled={confirmingCod}
                  className="flex items-center gap-1 text-[10px] bg-amber-900/40 text-amber-400 hover:bg-amber-900/60 border border-amber-800 px-2 py-1 transition-colors disabled:opacity-50">
            {confirmingCod ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Konfirmasi COD Lunas
          </button>
        ) : (
          <p className="text-[10px] text-brand-gray-600">Menunggu pengiriman…</p>
        )}
      </div>
    );
  }

  const hasProof = !!proofImageUrl;

  return (
    <>
      <div className="flex flex-col gap-1">
        {/* View proof */}
        {hasProof && (
          <button onClick={() => setShowProof(true)}
                  className="flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
            <Eye className="w-3 h-3" /> Lihat Bukti Transfer
          </button>
        )}
        {!hasProof && (
          <p className="text-[10px] text-brand-gray-600 italic">Menunggu bukti dari pembeli…</p>
        )}

        {/* Actions — only when proof uploaded */}
        {hasProof && paymentStatus === "WAITING_CONFIRMATION" && (
          <div className="flex gap-1 mt-0.5">
            <button onClick={confirm} disabled={confirming}
                    className="flex items-center gap-1 text-[10px] bg-green-900/40 text-green-400 hover:bg-green-900/60 border border-green-800 px-2 py-1 transition-colors disabled:opacity-50">
              {confirming ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Konfirmasi
            </button>
            <button onClick={() => setShowReject(true)}
                    className="flex items-center gap-1 text-[10px] bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-800 px-2 py-1 transition-colors">
              <XCircle className="w-3 h-3" /> Tolak
            </button>
          </div>
        )}
      </div>

      {/* Proof image modal */}
      {showProof && proofImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
             onClick={() => setShowProof(false)}>
          <div className="relative max-w-lg w-full bg-brand-gray-900 border border-brand-gray-700 p-4"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold uppercase tracking-widest">Bukti Transfer</p>
              <button onClick={() => setShowProof(false)} className="text-brand-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proofImageUrl} alt="Bukti Transfer" className="w-full max-h-[70vh] object-contain" />
            <div className="flex gap-2 mt-4">
              <button onClick={confirm} disabled={confirming}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-900/40 text-green-400 hover:bg-green-800/40 border border-green-800 py-2 text-sm transition-colors disabled:opacity-50">
                {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Konfirmasi Pembayaran
              </button>
              <button onClick={() => { setShowProof(false); setShowReject(true); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-900/40 text-red-400 hover:bg-red-800/40 border border-red-800 py-2 text-sm transition-colors">
                <XCircle className="w-4 h-4" /> Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
             onClick={() => setShowReject(false)}>
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 max-w-sm w-full space-y-4"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-bold uppercase tracking-widest text-sm">Tolak Pembayaran</p>
              <button onClick={() => setShowReject(false)} className="text-brand-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="input-label">Alasan penolakan (opsional)</label>
              <textarea value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="input-field resize-none h-20"
                        placeholder="Contoh: Bukti transfer tidak terbaca / nominal tidak sesuai" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowReject(false)}
                      className="flex-1 py-2 border border-brand-gray-600 text-sm hover:border-white transition-colors">
                Batal
              </button>
              <button onClick={reject} disabled={rejecting}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-900/40 text-red-400 border border-red-800 py-2 text-sm hover:bg-red-800/40 transition-colors disabled:opacity-50">
                {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
