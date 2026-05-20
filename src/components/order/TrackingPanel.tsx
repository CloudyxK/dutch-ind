"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { RefreshCw, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import toast from "react-hot-toast";
import { CARRIER_OPTIONS } from "@/lib/tracking";
import FlightAnimation from "./FlightAnimation";

/* Leaflet map — client only (no SSR) */
const ShippingMap = dynamic(() => import("./ShippingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full animate-pulse" style={{ height: "340px", background: "#0a0a0f" }} />
  ),
});

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
  orderStatus: string;
  initialTracking: TrackingData | null;
  initialUpdatedAt: string | null;
  /* Map props — optional */
  originCity?: string;
  destCity?: string;
  originCoords?: [number, number] | null;
  destCoords?: [number, number] | null;
}

export default function TrackingPanel({
  orderId,
  trackingNumber,
  trackingCarrier,
  orderStatus,
  initialTracking,
  initialUpdatedAt,
  originCity = "Pengirim",
  destCity = "Tujuan",
  originCoords,
  destCoords,
}: Props) {
  const [tracking, setTracking]   = useState<TrackingData | null>(initialTracking);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [loading, setLoading]     = useState(false);
  const [showMap, setShowMap]     = useState(false);

  const carrierLabel =
    CARRIER_OPTIONS.find((c) => c.code === trackingCarrier)?.label ?? trackingCarrier ?? null;

  const isInTransit  = orderStatus === "SHIPPED";
  const isDelivered  = orderStatus === "DELIVERED" || orderStatus === "COMPLETED";
  const showFlight   = isInTransit || isDelivered;
  const hasMap       = !!(originCoords && destCoords);

  const lastEvent = tracking?.history?.[0]?.desc ?? tracking?.summary ?? null;

  const refresh = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/orders/${orderId}/track`);
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Gagal memuat tracking"); return; }
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

  return (
    <div className="overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* ── Flight / Delivered animation ── */}
      {showFlight && (
        <FlightAnimation
          originCity={originCity}
          destCity={destCity}
          carrierLabel={carrierLabel}
          trackingNumber={trackingNumber}
          orderStatus={orderStatus}
          lastEvent={lastEvent}
        />
      )}

      {/* ── Satellite map toggle ── */}
      {hasMap && isInTransit && (
        <button
          onClick={() => setShowMap((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] text-brand-gray-500 hover:text-white transition-colors uppercase tracking-widest"
          style={{ background: "#060609", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          {showMap ? "Tutup Peta" : "Lihat di Peta Satelit"}
        </button>
      )}

      {/* ── Leaflet map ── */}
      {hasMap && showMap && isInTransit && (
        <ShippingMap
          originCoords={originCoords!}
          destCoords={destCoords!}
          originLabel={originCity}
          destLabel={destCity}
        />
      )}

      {/* ── Tracking detail panel ── */}
      <div className="bg-brand-gray-900 p-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[9px] text-brand-gray-600 uppercase tracking-wider">Nomor Resi</p>
              <p className="font-mono font-bold text-base leading-tight">{trackingNumber}</p>
            </div>
            {carrierLabel && (
              <div className="pl-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[9px] text-brand-gray-600 uppercase tracking-wider">Ekspedisi</p>
                <p className="text-sm font-semibold">{carrierLabel}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {updatedAt && (
              <p className="text-[9px] text-brand-gray-700 text-right hidden sm:block">
                Update:<br/>
                {new Date(updatedAt).toLocaleString("id-ID", {
                  day: "2-digit", month: "short",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1.5 text-[10px] text-brand-gray-500 hover:text-white transition-colors disabled:opacity-40 uppercase tracking-wider"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Perbarui
            </button>
          </div>
        </div>

        {/* Result */}
        {!tracking ? (
          <div className="text-center py-5 border border-dashed border-brand-gray-800">
            <p className="text-xs text-brand-gray-600">
              Klik "Perbarui" untuk melihat status terkini
            </p>
          </div>
        ) : tracking.noApi ? (
          <div className="flex items-start gap-3 p-3 bg-brand-gray-800 text-sm text-brand-gray-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-yellow-400 mt-0.5" />
            <span>{tracking.summary ?? "Layanan same-day tidak memiliki tracking otomatis"}</span>
          </div>
        ) : !tracking.success ? (
          <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-900/40 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{tracking.error ?? "Data tracking tidak tersedia"}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status summary */}
            {(tracking.status || tracking.summary) && (
              <div className="p-3 bg-brand-gray-800">
                {tracking.status && (
                  <p className={`font-bold text-xs uppercase tracking-wider ${
                    tracking.status.toUpperCase() === "DELIVERED"
                      ? "text-green-400"
                      : tracking.status.toUpperCase().includes("DELIVERY")
                      ? "text-blue-400"
                      : "text-yellow-400"
                  }`}>
                    {tracking.status}
                  </p>
                )}
                {tracking.summary && (
                  <p className="text-xs text-brand-gray-400 mt-0.5">{tracking.summary}</p>
                )}
                {(tracking.origin || tracking.destination) && (
                  <p className="text-[10px] text-brand-gray-600 mt-1.5">
                    {tracking.origin && `Dari: ${tracking.origin}`}
                    {tracking.origin && tracking.destination && " → "}
                    {tracking.destination && `${tracking.destination}`}
                  </p>
                )}
              </div>
            )}

            {/* History timeline */}
            {tracking.history.length > 0 && (
              <div>
                <p className="text-[10px] text-brand-gray-600 uppercase tracking-wider mb-3">
                  Riwayat Perjalanan
                </p>
                <div>
                  {tracking.history.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {i === 0 ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-brand-gray-700 flex-shrink-0 mt-0.5" />
                        )}
                        {i < tracking.history.length - 1 && (
                          <div className="w-px flex-1 bg-brand-gray-800 my-1 min-h-[12px]" />
                        )}
                      </div>
                      <div className="pb-3 flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${i === 0 ? "text-white font-medium" : "text-brand-gray-400"}`}>
                          {h.desc}
                        </p>
                        <p className="text-[9px] text-brand-gray-700 mt-0.5">{h.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
