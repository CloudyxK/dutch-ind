"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { formatPrice, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";

type OrderRow = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
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

function OrderRow({ order }: { order: OrderRow }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const setToProcessing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PROCESSING" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status diubah ke Diproses");
      router.refresh();
    } catch {
      toast.error("Gagal mengubah status");
    } finally {
      setLoading(false);
    }
  };

  const isPending =
    order.status === "AWAITING_PAYMENT" || order.status === "PAID";

  return (
    <div className="border-b border-brand-gray-800 last:border-0">
      {/* Main row */}
      <div className="flex items-center gap-3 p-4 hover:bg-brand-gray-800/30 transition-colors">
        {/* Order number */}
        <div className="w-28 flex-shrink-0">
          <Link
            href="/admin/orders"
            className="font-mono text-xs font-bold hover:text-brand-gray-300 transition-colors"
          >
            #{order.orderNumber}
          </Link>
          <p className="text-[10px] text-brand-gray-600 mt-0.5">
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* Buyer */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{order.user.name}</p>
          <p className="text-[10px] text-brand-gray-500 truncate">{order.user.email}</p>
        </div>

        {/* Total + items */}
        <div className="text-right flex-shrink-0 w-24">
          <p className="text-sm font-bold">{formatPrice(order.total)}</p>
          <p className="text-[10px] text-brand-gray-600">{order.items.length} item</p>
        </div>

        {/* Payment badge */}
        <div className="flex-shrink-0 w-14">
          {order.payment && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 ${
                order.payment.status === "SUCCESS"
                  ? "bg-green-900/40 text-green-400"
                  : order.payment.status === "FAILED"
                  ? "bg-red-900/40 text-red-400"
                  : "bg-yellow-900/40 text-yellow-400"
              }`}
            >
              {order.payment.status === "SUCCESS"
                ? "Lunas"
                : order.payment.status === "FAILED"
                ? "Gagal"
                : "Pending"}
            </span>
          )}
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0 w-20">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </span>
        </div>

        {/* Quick Proses button */}
        <div className="flex-shrink-0 w-20">
          {isPending && (
            <button
              onClick={setToProcessing}
              disabled={loading}
              className="text-[10px] font-bold px-2 py-1 bg-white text-black hover:bg-brand-gray-200 disabled:opacity-50 flex items-center gap-1 w-full justify-center"
            >
              {loading && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
              Proses
            </button>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 text-brand-gray-500 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded: address detail */}
      {expanded && (
        <div className="px-4 pb-4 bg-brand-gray-800/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-brand-gray-800 pt-3">
            <div>
              <p className="text-brand-gray-500 uppercase tracking-wider mb-1">Alamat Pengiriman</p>
              <p className="font-semibold">{order.address.recipientName}</p>
              <p className="text-brand-gray-400">{order.address.phone}</p>
              <p className="text-brand-gray-400 mt-1 leading-relaxed">
                {order.address.street}, {order.address.district},{" "}
                {order.address.city}, {order.address.province}{" "}
                {order.address.postalCode}
              </p>
            </div>
            <div className="flex items-end">
              <Link
                href="/admin/orders"
                className="text-brand-gray-400 hover:text-white underline underline-offset-2 transition-colors"
              >
                Kelola pesanan ini →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecentOrdersWidget({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700">
      <div className="p-5 border-b border-brand-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest">Pesanan Terbaru</h2>
        <Link
          href="/admin/orders"
          className="text-xs text-brand-gray-500 hover:text-white transition-colors"
        >
          Lihat semua →
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="p-6 text-sm text-brand-gray-500 text-center">Belum ada pesanan</p>
      ) : (
        <div>
          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-2 bg-brand-gray-800/50 border-b border-brand-gray-800">
            <div className="w-28 flex-shrink-0 text-[10px] text-brand-gray-500 uppercase tracking-wider">
              No. Pesanan
            </div>
            <div className="flex-1 text-[10px] text-brand-gray-500 uppercase tracking-wider">
              Pembeli
            </div>
            <div className="w-24 flex-shrink-0 text-[10px] text-brand-gray-500 uppercase tracking-wider text-right">
              Total
            </div>
            <div className="w-14 flex-shrink-0 text-[10px] text-brand-gray-500 uppercase tracking-wider">
              Bayar
            </div>
            <div className="w-20 flex-shrink-0 text-[10px] text-brand-gray-500 uppercase tracking-wider">
              Status
            </div>
            <div className="w-20 flex-shrink-0" />
            <div className="w-4 flex-shrink-0" />
          </div>

          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
