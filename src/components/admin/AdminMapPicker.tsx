"use client";

import { useEffect, useRef, useCallback } from "react";

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

export default function AdminMapPicker({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const stableChange = useCallback(onChange, []); // eslint-disable-line

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      const initLat = lat || -0.5021;   // default: Samarinda
      const initLng = lng || 117.1536;

      const map = L.map(containerRef.current!, {
        center: [initLat, initLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Update koordinat setiap kali peta berhenti bergerak
      map.on("moveend", () => {
        const c = map.getCenter();
        stableChange(c.lat, c.lng);
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Saat koordinat berubah dari luar (geocode search), pan peta ke sana
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const current = mapRef.current.getCenter();
    // Hanya pan jika perbedaan signifikan (bukan update dari moveend)
    if (Math.abs(current.lat - lat) > 0.0001 || Math.abs(current.lng - lng) > 0.0001) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: true });
    }
  }, [lat, lng]);

  return (
    <div className="relative w-full" style={{ height: "320px" }}>
      {/* Peta */}
      <div ref={containerRef} className="w-full h-full border border-brand-gray-700" />

      {/* Pin tengah — style Gojek/Maxim */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
        <div className="flex flex-col items-center" style={{ marginTop: "-28px" }}>
          {/* Bayangan pin */}
          <div
            className="absolute rounded-full bg-black/30 blur-sm"
            style={{ width: 20, height: 6, bottom: -3 }}
          />
          {/* Pin body */}
          <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
            <path
              d="M18 0C8.06 0 0 8.06 0 18c0 12.77 16.11 29.08 17.16 30.16a1.2 1.2 0 0 0 1.68 0C19.89 47.08 36 30.77 36 18 36 8.06 27.94 0 18 0z"
              fill="#ffffff"
            />
            <circle cx="18" cy="18" r="8" fill="#111111" />
          </svg>
        </div>
      </div>

      {/* Label "Geser peta untuk pindah pin" */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="bg-black/70 text-white text-[10px] px-3 py-1 rounded-full font-medium tracking-wide whitespace-nowrap">
          Geser peta untuk memilih lokasi
        </div>
      </div>
    </div>
  );
}
