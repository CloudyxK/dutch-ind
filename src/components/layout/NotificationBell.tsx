"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Notification {
  orderId: string;
  orderNumber: string;
  status: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Terkirim",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
};

const STATUS_COLORS: Record<string, string> = {
  PROCESSING: "text-yellow-400",
  SHIPPED: "text-orange-400",
  DELIVERED: "text-green-400",
  CANCELLED: "text-red-400",
  REFUNDED: "text-blue-400",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

const POLL_INTERVAL_MS = 60_000; // 60 seconds

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.count ?? 0);
      setNotifications(data.notifications ?? []);
    } catch {
      // silently ignore network errors
    }
  }

  async function markAsRead() {
    try {
      await fetch("/api/notifications", { method: "POST" });
      setCount(0);
    } catch {
      // silently ignore
    }
  }

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next && count > 0) {
        markAsRead();
      }
      return next;
    });
  }

  return (
    <div className="relative hidden sm:block" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-3 hover:bg-white/[0.06] transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="w-[18px] h-[18px]" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key="notif-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full"
            >
              {count > 9 ? "9+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-1 w-72 bg-brand-black border border-white/[0.08] z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-brand-gray-500 font-semibold">
                Notifikasi Pesanan
              </span>
              {notifications.length > 0 && (
                <Link
                  href="/profile/orders"
                  onClick={() => setOpen(false)}
                  className="text-[10px] text-brand-gray-400 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Lihat Semua
                </Link>
              )}
            </div>

            {/* Body */}
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-brand-gray-700 mx-auto mb-2" />
                <p className="text-xs text-brand-gray-500">
                  Tidak ada notifikasi baru
                </p>
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                {notifications.map((n) => (
                  <li key={n.orderId}>
                    <Link
                      href={`/profile/orders/${n.orderId}`}
                      onClick={() => setOpen(false)}
                      className="flex flex-col gap-0.5 px-4 py-3 hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          #{n.orderNumber}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider flex-shrink-0",
                            STATUS_COLORS[n.status] ?? "text-brand-gray-400"
                          )}
                        >
                          {STATUS_LABELS[n.status] ?? n.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-brand-gray-500">
                        {timeAgo(n.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
