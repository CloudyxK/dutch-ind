"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Loader2, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  amount: number;
}

export default function MidtransPayButton({ orderId, amount }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  const handlePay = async () => {
    if (!snapReady) {
      toast.error("Midtrans belum siap, tunggu sebentar lalu coba lagi");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat pembayaran");

      const snap = (window as any).snap;
      snap.pay(data.data.snapToken, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil!");
          router.push(`/order-success?orderId=${orderId}`);
        },
        onPending: () => {
          toast("Pembayaran pending — cek email kamu");
          router.refresh();
        },
        onError: () => toast.error("Pembayaran gagal, coba lagi"),
        onClose: () => toast("Popup pembayaran ditutup"),
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const snapSrc =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <>
      <Script
        src={snapSrc}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="afterInteractive"
        onLoad={() => setSnapReady(true)}
      />

      <div className="bg-brand-gray-900 border border-brand-gray-700 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-gray-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">
            Selesaikan Pembayaran
          </p>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-gray-400">Total tagihan</span>
            <span className="font-bold text-white">
              Rp {amount.toLocaleString("id-ID")}
            </span>
          </div>
          <p className="text-[11px] text-brand-gray-500">
            Klik tombol di bawah untuk membuka halaman pembayaran Midtrans.
            Tersedia: GoPay, OVO, DANA, ShopeePay, transfer bank, kartu kredit, dan lainnya.
          </p>
        </div>

        <button
          onClick={handlePay}
          disabled={loading || !snapReady}
          className="w-full py-3.5 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-brand-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Membuka pembayaran...
            </>
          ) : !snapReady ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Bayar Sekarang
            </>
          )}
        </button>

        <p className="text-[10px] text-brand-gray-600 text-center">
          Pembayaran diproses aman oleh Midtrans · SSL Encrypted
        </p>
      </div>
    </>
  );
}
