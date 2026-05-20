"use client";

import { useState } from "react";
import { Truck, RefreshCw, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { CARRIER_OPTIONS } from "@/lib/tracking";

type TrackingHistory = { date: string; desc: string };

type TrackingData = {
  success: boolean;
  noApi?: boolean;
  status: string | null;
  summary: string | null;
  origin: string | null;
  destination: string | null;
  history: TrackingHistory[];
  error?: string;
};

interface Props {
  orderId: string;
  trackingNumber: string;
  trackingCarrier?: string | null;
  initialTracking: TrackingData | null;
  initialUpdatedAt: string | null;
}

export default function TrackingPanel({
  orderId,
  trackingNumber,
  trackingCarrier,
  initialTracking,
  initialUpdatedAt,
}: Props) {
  const [tracking, setTracking] = useState<TrackingData | null>(initialTracking);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [loading, setLoading] = useState(false);

  const carrierLabel =
    CARRIER_OPTIONS.find((c) => c.code === trackingCarrier)?.label ?? trackingCarrier ?? null;

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/track`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal memuat tracking");
        return;
      }
      setTracking(json.data);
      setUpdatedAt(json.updatedAt);
      if (json.data?.noApi) {
        toast("Layanan same-day tidak memiliki tracking otomatis", { icon: "ℹ️" });
      } else if (json.data?.success) {
        toast.success("Data tracking diperbarui");
      } else {
        toast.error(json.data?.error || "Resi tidak ditemukan");
      }
    } catch {
      toast.error("Gagal memuat tracking");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string | null) => {
    if (!status) return "text-brand-gray-400";
    const s = status.toUpperCase();
    if (s === "DELIVERED") return "text-green-400";
    if (s.includes("DELIVERY") || s.includes("ON DELIVERY")) return "text-blue-400";
    if (s.includes("PROCESS") || s.includes("TRANSIT")) return "text-yellow-400";
    return "text-brand-gray-400";
  };

  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Truck className="w-4 h-4" /> Lacak Pengiriman
        </h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-brand-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Perbarui
        </button>
      </div>

      {/* Resi + carrier info */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-[10px] text-brand-gray-500 uppercase tracking-wider">Nomor Resi</p>
          <p className="font-mono font-bold text-lg leading-tight">{trackingNumber}</p>
        </div>
        {carrierLabel && (
          <div>
            <p className="text-[10px] text-brand-gray-500 uppercase tracking-wider">Ekspedisi</p>
            <p className="text-sm font-semibold">{carrierLabel}</p>
          </div>
        )}
        {updatedAt && (
          <div className="ml-auto">
            <p className="text-[10px] text-brand-gray-600 text-right">
              Diperbarui:{" "}
              {new Date(updatedAt).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </div>

      {/* Tracking result */}
      {!tracking ? (
        <div className="text-center py-6">
          <p className="text-sm text-brand-gray-500">Klik "Perbarui" untuk melihat status terkini</p>
        </div>
      ) : tracking.noApi ? (
        <div className="flex items-center gap-2 p-3 bg-brand-gray-800 text-sm text-brand-gray-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-yellow-400" />
          <span>{tracking.summary ?? "Layanan same-day tidak memiliki tracking otomatis"}</span>
        </div>
      ) : !tracking.success ? (
        <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-900/40 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{tracking.error ?? "Data tracking tidak tersedia"}</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status + summary */}
          <div className="flex items-start gap-3 p-3 bg-brand-gray-800">
            <div className="flex-1">
              {tracking.status && (
                <p className={`font-bold text-sm uppercase ${statusColor(tracking.status)}`}>
                  {tracking.status}
                </p>
              )}
              {tracking.summary && (
                <p className="text-xs text-brand-gray-400 mt-0.5">{tracking.summary}</p>
              )}
              {(tracking.origin || tracking.destination) && (
                <p className="text-xs text-brand-gray-500 mt-1">
                  {tracking.origin && `Dari: ${tracking.origin}`}
                  {tracking.origin && tracking.destination && "  →  "}
                  {tracking.destination && `Ke: ${tracking.destination}`}
                </p>
              )}
            </div>
          </div>

          {/* History timeline */}
          {tracking.history && tracking.history.length > 0 && (
            <div>
              <p className="text-[10px] text-brand-gray-500 uppercase tracking-wider mb-3">
                Riwayat Perjalanan
              </p>
              <div className="space-y-0">
                {tracking.history.map((h, i) => (
                  <div key={i} className="flex gap-3">
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center">
                      {i === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-brand-gray-700 flex-shrink-0 mt-0.5" />
                      )}
                      {i < tracking.history.length - 1 && (
                        <div className="w-px flex-1 bg-brand-gray-800 my-1" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-3 flex-1 min-w-0">
                      <p className={`text-xs ${i === 0 ? "text-white font-medium" : "text-brand-gray-400"}`}>
                        {h.desc}
                      </p>
                      <p className="text-[10px] text-brand-gray-600 mt-0.5">{h.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
