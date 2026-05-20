"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, User, Phone, Package, Truck, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { formatPrice, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import toast from "react-hot-toast";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  shippingMethod: string | null;
  createdAt: string;
  user: { name: string; email: string };
  address: {
    recipientName: string;
    phone: string;
    street: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: { id: string }[];
  payment: { status: string } | null;
};

const STATUS_OPTIONS = [
  { value: "AWAITING_PAYMENT", label: "Menunggu Bayar" },
  { value: "PAID", label: "Dibayar" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DELIVERED", label: "Terkirim" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

function OrderCard({ order: initial }: { order: Order }) {
  const [order, setOrder] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function updateStatus(status: string) {
    if (status === order.status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setOrder((o) => ({ ...o, status }));
      toast.success(`Status → ${getOrderStatusLabel(status)}`);
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setUpdating(false);
    }
  }

  const canProcess = order.status === "AWAITING_PAYMENT" || order.status === "PAID";

  return (
    <div className="border border-brand-gray-700 bg-brand-gray-950 rounded-sm overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-brand-gray-800/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="font-mono font-bold text-sm">#{order.orderNumber}</p>
            <p className="text-[10px] text-brand-gray-500">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <p className="text-sm font-bold">{formatPrice(order.total)}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </span>
          {expanded ? <ChevronUp className="w-3 h-3 text-brand-gray-500" /> : <ChevronDown className="w-3 h-3 text-brand-gray-500" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-brand-gray-800 px-4 pb-4 pt-3 space-y-4">
          {/* Buyer + Address info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pembeli */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500 mb-2">Data Pembeli</p>
              <div className="flex items-start gap-2">
                <User className="w-3.5 h-3.5 text-brand-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{order.user.name}</p>
                  <p className="text-xs text-brand-gray-400">{order.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-gray-500 flex-shrink-0" />
                <p className="text-xs text-brand-gray-400">{order.address.phone}</p>
              </div>
              <div className="flex items-start gap-2">
                <Package className="w-3.5 h-3.5 text-brand-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-brand-gray-400">
                  {order.items.length} produk
                  {order.shippingMethod && ` · ${order.shippingMethod}`}
                </p>
              </div>
            </div>

            {/* Alamat pengiriman */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500 mb-2">Alamat Pengiriman</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{order.address.recipientName}</p>
                  <p className="text-xs text-brand-gray-400 leading-relaxed">
                    {order.address.street},<br />
                    {order.address.district}, {order.address.city},<br />
                    {order.address.province} {order.address.postalCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1 border-t border-brand-gray-800">
            {/* Quick process button */}
            {canProcess && (
              <button
                onClick={() => updateStatus("PROCESSING")}
                disabled={updating}
                className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-4 py-2 hover:bg-brand-gray-200 disabled:opacity-50 transition-colors"
              >
                {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3" />}
                Proses Sekarang
              </button>
            )}

            {/* Status dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updating}
                className="bg-brand-gray-800 border border-brand-gray-600 text-xs px-2 py-1.5 text-white focus:outline-none focus:border-white disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {updating && <Loader2 className="w-3 h-3 animate-spin text-brand-gray-400" />}
            </div>

            <Link
              href={`/admin/orders`}
              className="ml-auto text-xs text-brand-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Truck className="w-3 h-3" />
              Detail lengkap
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecentOrdersWidget({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold uppercase tracking-widest">Pesanan Terbaru</h2>
        <Link href="/admin/orders" className="text-xs text-brand-gray-400 hover:text-white transition-colors">
          Lihat Semua →
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-brand-gray-500">Belum ada pesanan</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
