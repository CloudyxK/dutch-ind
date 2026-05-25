"use client";

import { useEffect, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

export default function AdminMapPicker({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const initialised  = useRef(false);
  const stableChange = useCallback(onChange, []); // eslint-disable-line

  useEffect(() => {
    if (initialised.current || !containerRef.current) return;
    initialised.current = true;

    import("leaflet").then((L) => {
      if (mapRef.current) return; // guard double-mount (StrictMode)

      const initLat = lat || -0.5021;
      const initLng = lng || 117.1536;

      // Fix ikon default Leaflet (CDN)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [initLat, initLng],
        zoom:   15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Update koordinat saat peta berhenti bergerak
      map.on("moveend", () => {
        const c = map.getCenter();
        stableChange(c.lat, c.lng);
      });

      mapRef.current = map;

      // Fix ukuran tile setelah render
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current   = null;
        initialised.current = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan peta saat koordinat berubah dari luar (geocode)
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const c = mapRef.current.getCenter();
    if (Math.abs(c.lat - lat) > 0.0001 || Math.abs(c.lng - lng) > 0.0001) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: true });
    }
  }, [lat, lng]);

  return (
    <div className="relative w-full rounded-none overflow-hidden" style={{ height: "340px" }}>
      {/* Peta */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Pin tengah — fixed, tidak ikut scroll peta */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 800 }}
      >
        <div style={{ marginBottom: "36px" }}>
          <svg width="38" height="50" viewBox="0 0 38 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
            </filter>
            <path
              d="M19 0C8.51 0 0 8.51 0 19c0 13.25 17.08 30.2 17.83 30.97a1.66 1.66 0 0 0 2.34 0C20.92 49.2 38 32.25 38 19 38 8.51 29.49 0 19 0z"
              fill="white"
              filter="url(#shadow)"
            />
            <circle cx="19" cy="19" r="9" fill="#111" />
            <circle cx="19" cy="19" r="4" fill="white" />
          </svg>
          {/* Bayangan bawah pin */}
          <div style={{
            width: 16, height: 5, borderRadius: "50%",
            background: "rgba(0,0,0,0.25)", margin: "-4px auto 0",
            filter: "blur(2px)",
          }} />
        </div>
      </div>

      {/* Label bawah */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap"
        style={{ zIndex: 800 }}
      >
        <span className="bg-black/65 text-white text-[11px] font-medium px-3 py-1 rounded-full tracking-wide">
          Geser peta untuk memilih lokasi
        </span>
      </div>
    </div>
  );
}
