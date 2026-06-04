"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Package, Truck, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from "lucide-react";

interface Notification {
  orderId: string;
  orderNumber: string;
  status: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PROCESSING:  { label: "Pesanan Diproses",   color: "text-blue-400",   bg: "bg-blue-400/10",   icon: Package    },
  SHIPPED:     { label: "Pesanan Dikirim",    color: "text-orange-400", bg: "bg-orange-400/10", icon: Truck      },
  DELIVERED:   { label: "Pesanan Diterima",   color: "text-green-400",  bg: "bg-green-400/10",  icon: CheckCircle2 },
  COMPLETED:   { label: "Pesanan Selesai",    color: "text-green-400",  bg: "bg-green-400/10",  icon: CheckCircle2 },
  CANCELLED:   { label: "Pesanan Dibatalkan", color: "text-red-400",    bg: "bg-red-400/10",    icon: XCircle    },
  REFUNDED:    { label: "Dana Dikembalikan",  color: "text-purple-400", bg: "bg-purple-400/10", icon: RefreshCw  },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(iso));
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchNotifications(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      // Mark as read
      fetch("/api/notifications", { method: "POST" }).catch(() => {});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen py-10">
      <div className="container-main max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/profile" className="inline-flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors mb-3 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali ke Profil
            </Link>
            <h1 className="text-3xl font-display tracking-widest uppercase">Notifikasi</h1>
          </div>
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="p-2 text-brand-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-brand-gray-900 border border-brand-gray-700 p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-sm bg-brand-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-brand-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-brand-gray-800 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-16 text-center">
            <Bell className="w-12 h-12 text-brand-gray-700 mx-auto mb-4" />
            <p className="text-brand-gray-400 text-sm">Belum ada notifikasi dalam 7 hari terakhir</p>
            <Link href="/profile/orders" className="btn-primary mt-6 inline-flex text-sm">
              Lihat Semua Pesanan
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-brand-gray-500 mb-4">{notifications.length} notifikasi · 7 hari terakhir</p>
            {notifications.map((n) => {
              const cfg = STATUS_CONFIG[n.status];
              const Icon = cfg?.icon ?? Bell;
              return (
                <Link
                  key={n.orderId}
                  href={`/profile/orders/${n.orderId}`}
                  className="flex items-start gap-4 p-5 bg-brand-gray-900 border border-brand-gray-700 hover:border-brand-gray-500 transition-colors group"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-sm ${cfg?.bg ?? "bg-brand-gray-800"}`}>
                    <Icon className={`w-5 h-5 ${cfg?.color ?? "text-brand-gray-400"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold group-hover:text-white transition-colors">
                          {cfg?.label ?? n.status}
                        </p>
                        <p className="text-xs text-brand-gray-500 mt-0.5">
                          Pesanan <span className="font-mono font-bold text-brand-gray-400">#{n.orderNumber}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-brand-gray-600 flex-shrink-0 mt-0.5">
                        {timeAgo(n.updatedAt)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-[11px] text-brand-gray-500 group-hover:text-brand-gray-400 transition-colors">
                      <span>Lihat detail pesanan</span>
                      <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
