"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Crosshair, Loader2, Map, Satellite } from "lucide-react";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

type MapMode = "classic" | "satellite";

const TILES: Record<MapMode, { url: string; maxZoom: number }> = {
  classic: {
    url:     "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
  },
  satellite: {
    url:     "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 20,
  },
};

export default function AdminMapPicker({ lat, lng, onChange }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<any>(null);
  const tileLayerRef  = useRef<any>(null);
  const initialised   = useRef(false);
  const stableChange  = useCallback(onChange, []); // eslint-disable-line

  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [mode, setMode]         = useState<MapMode>("classic");

  // GPS locate
  function locateMe() {
    if (!navigator.geolocation) { setLocError("Browser tidak mendukung GPS"); return; }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        stableChange(latitude, longitude);
        if (mapRef.current) mapRef.current.setView([latitude, longitude], 17, { animate: true });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1)      setLocError("Akses lokasi ditolak. Izinkan browser mengakses GPS.");
        else if (err.code === 2) setLocError("Posisi tidak ditemukan. Coba lagi.");
        else                     setLocError("Gagal mendapatkan lokasi.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Toggle mode klasik ↔ satelit
  function toggleMode() {
    setMode((prev) => {
      const next = prev === "classic" ? "satellite" : "classic";
      if (mapRef.current) {
        import("leaflet").then((L) => {
          // Hapus tile lama
          if (tileLayerRef.current) {
            tileLayerRef.current.remove();
          }
          // Tambah tile baru
          const t = TILES[next];
          tileLayerRef.current = L.tileLayer(t.url, { maxZoom: t.maxZoom }).addTo(mapRef.current);
        });
      }
      return next;
    });
  }

  // Init map
  useEffect(() => {
    if (initialised.current || !containerRef.current) return;
    initialised.current = true;

    import("leaflet").then((L) => {
      if (mapRef.current) return;

      const initLat = lat || -0.5021;
      const initLng = lng || 117.1536;

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

      const t = TILES["classic"];
      tileLayerRef.current = L.tileLayer(t.url, { maxZoom: t.maxZoom }).addTo(map);

      map.on("moveend", () => {
        const c = map.getCenter();
        stableChange(c.lat, c.lng);
      });

      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current      = null;
        tileLayerRef.current = null;
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

  const isSatellite = mode === "satellite";

  return (
    <div className="relative w-full rounded-none overflow-hidden" style={{ height: "340px" }}>
      {/* Peta */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Pin tengah */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 800 }}
      >
        <div style={{ marginBottom: "36px" }}>
          <svg width="38" height="50" viewBox="0 0 38 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <filter id="pin-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
            </filter>
            <path
              d="M19 0C8.51 0 0 8.51 0 19c0 13.25 17.08 30.2 17.83 30.97a1.66 1.66 0 0 0 2.34 0C20.92 49.2 38 32.25 38 19 38 8.51 29.49 0 19 0z"
              fill="white"
              filter="url(#pin-shadow)"
            />
            <circle cx="19" cy="19" r="9" fill="#111" />
            <circle cx="19" cy="19" r="4" fill="white" />
          </svg>
          <div style={{
            width: 16, height: 5, borderRadius: "50%",
            background: "rgba(0,0,0,0.25)", margin: "-4px auto 0",
            filter: "blur(2px)",
          }} />
        </div>
      </div>

      {/* Kontrol kiri atas — toggle mode */}
      <div className="absolute top-3 left-3" style={{ zIndex: 800 }}>
        <div className="flex shadow-md overflow-hidden" style={{ borderRadius: 4 }}>
          <button
            type="button"
            onClick={() => mode === "satellite" && toggleMode()}
            title="Mode Klasik"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-colors ${
              !isSatellite
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            <Map className="w-3 h-3" />
            Klasik
          </button>
          <button
            type="button"
            onClick={() => mode === "classic" && toggleMode()}
            title="Mode Satelit"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-colors border-l ${
              isSatellite
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Satellite className="w-3 h-3" />
            Satelit
          </button>
        </div>
      </div>

      {/* Tombol GPS — kanan atas */}
      <div className="absolute top-3 right-3" style={{ zIndex: 800 }}>
        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          title="Gunakan lokasi saya"
          className="flex items-center gap-1.5 bg-white text-black text-[11px] font-bold px-3 py-1.5 shadow-md hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-wait"
          style={{ borderRadius: 4 }}
        >
          {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
          {locating ? "Mencari..." : "Lokasi Saya"}
        </button>
      </div>

      {/* Error GPS */}
      {locError && (
        <div
          className="absolute right-3 max-w-[220px] bg-red-900/90 text-red-200 text-[10px] px-3 py-2 leading-snug shadow"
          style={{ zIndex: 800, borderRadius: 4, top: "3.2rem" }}
        >
          {locError}
          <button onClick={() => setLocError(null)} className="ml-2 text-red-300 hover:text-white font-bold">✕</button>
        </div>
      )}

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
