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

const labelStyle = {
  color: "rgba(255,255,255,0.22)",
  fontSize: "9px",
  letterSpacing: "0.45em",
} as const;

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
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-150"
        style={{ background: "transparent" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.02)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background = "transparent")
        }
      >
        {/* Order number */}
        <div className="w-28 flex-shrink-0">
          <Link
            href="/admin/orders"
            className="font-mono text-xs font-bold text-white/70 hover:text-white transition-colors"
          >
            #{order.orderNumber}
          </Link>
          <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* Buyer */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">{order.user.name}</p>
          <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
            {order.user.email}
          </p>
        </div>

        {/* Total */}
        <div className="text-right flex-shrink-0 w-24">
          <p className="text-xs font-bold text-white tabular-nums">{formatPrice(order.total)}</p>
          <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            {order.items.length} item
          </p>
        </div>

        {/* Payment badge */}
        <div className="flex-shrink-0 w-16">
          {order.payment && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider"
              style={{
                background:
                  order.payment.status === "SUCCESS"
                    ? "rgba(34,197,94,0.1)"
                    : order.payment.status === "FAILED"
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(234,179,8,0.1)",
                color:
                  order.payment.status === "SUCCESS"
                    ? "rgba(74,222,128,0.9)"
                    : order.payment.status === "FAILED"
                    ? "rgba(248,113,113,0.9)"
                    : "rgba(234,179,8,0.9)",
              }}
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
          <span className={`text-[9px] font-bold px-1.5 py-0.5 ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </span>
        </div>

        {/* Quick Proses button */}
        <div className="flex-shrink-0 w-16">
          {isPending && (
            <button
              onClick={setToProcessing}
              disabled={loading}
              className="text-[9px] font-black px-2 py-1.5 bg-white text-black hover:bg-white/90 disabled:opacity-50 flex items-center gap-1 w-full justify-center uppercase tracking-wider transition-colors"
            >
              {loading && <Loader2 className="w-2 h-2 animate-spin" />}
              Proses
            </button>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 transition-colors duration-150"
          style={{ color: "rgba(255,255,255,0.25)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)")
          }
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded: address detail */}
      {expanded && (
        <div
          className="px-5 pb-4"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div>
              <p
                className="text-[8px] uppercase tracking-[0.45em] mb-2"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Alamat Pengiriman
              </p>
              <p className="text-xs font-semibold text-white">{order.address.recipientName}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                {order.address.phone}
              </p>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {order.address.street}, {order.address.district},{" "}
                {order.address.city}, {order.address.province}{" "}
                {order.address.postalCode}
              </p>
            </div>
            <div className="flex items-end">
              <Link
                href="/admin/orders"
                className="text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.9)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)")
                }
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
    <div
      style={{
        background: "#0a0a0c",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">
          Pesanan Terbaru
        </h2>
        <Link
          href="/admin/orders"
          className="text-[9px] uppercase tracking-[0.35em] transition-colors"
          style={{ color: "rgba(255,255,255,0.3)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.8)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)")
          }
        >
          Lihat semua →
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="p-6 text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
          Belum ada pesanan
        </p>
      ) : (
        <div>
          {/* Column headers */}
          <div
            className="flex items-center gap-3 px-5 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}
          >
            <div className="w-28 flex-shrink-0" style={labelStyle}>No. Pesanan</div>
            <div className="flex-1" style={labelStyle}>Pembeli</div>
            <div className="w-24 flex-shrink-0 text-right" style={labelStyle}>Total</div>
            <div className="w-16 flex-shrink-0" style={labelStyle}>Bayar</div>
            <div className="w-20 flex-shrink-0" style={labelStyle}>Status</div>
            <div className="w-16 flex-shrink-0" />
            <div className="w-3.5 flex-shrink-0" />
          </div>

          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
