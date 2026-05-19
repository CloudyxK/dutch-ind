"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { Loader2, Truck } from "lucide-react";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.data || []))
      .finally(() => setLoading(false));
  }, [status]);

  const handlePay = async (orderId: string) => {
    setPayingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat pembayaran");

      const snap = (window as any).snap;
      if (!snap) {
        toast.error("Midtrans belum siap, coba lagi");
        return;
      }

      snap.pay(data.data.snapToken, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil!");
          router.push(`/order-success?orderId=${orderId}`);
        },
        onPending: () => {
          toast("Pembayaran pending");
          router.refresh();
        },
        onError: () => toast.error("Pembayaran gagal"),
        onClose: () => toast("Pembayaran ditutup"),
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPayingOrderId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-gray-400" />
      </div>
    );
  }

  return (
    <>
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="afterInteractive"
      />

      <div className="min-h-screen py-10">
        <div className="container-main max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/profile" className="text-brand-gray-400 hover:text-white text-sm">
              ← Profil
            </Link>
            <span className="text-brand-gray-700">/</span>
            <h1 className="text-2xl font-display tracking-widest uppercase">Pesanan Saya</h1>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-brand-gray-400">Belum ada pesanan</p>
              <Link href="/products" className="btn-primary mt-4 inline-flex">
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-brand-gray-900 border border-brand-gray-700">
                  {/* Header */}
                  <div className="flex items-start justify-between p-4 border-b border-brand-gray-700">
                    <div>
                      <p className="font-mono font-bold text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-brand-gray-500 mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                      <p className="text-sm font-bold mt-1">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="p-4 flex gap-3 flex-wrap">
                    {order.items.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        className="relative w-12 h-14 bg-brand-gray-800 flex-shrink-0 overflow-hidden"
                      >
                        {item.product?.images?.[0] && (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-14 bg-brand-gray-800 flex items-center justify-center text-xs text-brand-gray-400">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Tracking number */}
                  {order.trackingNumber && (
                    <div className="px-4 pb-4 border-t border-brand-gray-800 pt-3 flex items-center gap-3">
                      <Truck className="w-4 h-4 text-brand-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-brand-gray-500 uppercase tracking-wider">Nomor Resi</p>
                        <p className="font-mono font-bold text-sm">{order.trackingNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment actions */}
                  {order.payment?.status === "PENDING" && order.status === "AWAITING_PAYMENT" && (
                    <div className="px-4 pb-4 border-t border-brand-gray-800 pt-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-yellow-400 font-semibold">Menunggu Pembayaran</p>
                        <p className="text-[10px] text-brand-gray-500 mt-0.5">
                          Selesaikan pembayaran untuk memproses pesanan
                        </p>
                      </div>
                      <button
                        onClick={() => handlePay(order.id)}
                        disabled={payingOrderId === order.id}
                        className="btn-primary text-xs py-2 px-5 flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                      >
                        {payingOrderId === order.id ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Memuat...</>
                        ) : (
                          "Bayar Sekarang"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
