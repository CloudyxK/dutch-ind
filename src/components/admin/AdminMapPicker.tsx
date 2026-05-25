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
  const markerRef    = useRef<any>(null);

  const stableOnChange = useCallback(onChange, []); // eslint-disable-line

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import — leaflet tidak bisa SSR
    import("leaflet").then((L) => {
      // Fix ikon default leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [lat || -6.2088, lng || 106.8456],
        zoom:   13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Marker awal
      const marker = L.marker([lat || -6.2088, lng || 106.8456], {
        draggable: true,
        title: "Lokasi Toko",
      }).addTo(map);

      marker.bindPopup("<b>Lokasi Toko</b><br>Drag atau klik peta untuk pindahkan").openPopup();

      // Drag marker
      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        stableOnChange(pos.lat, pos.lng);
      });

      // Klik peta → pindah marker
      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        stableOnChange(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current    = map;
      markerRef.current = marker;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current    = null;
        markerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker saat lat/lng berubah dari luar (misal dari geocode)
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return;
    if (!lat || !lng) return;
    const newLatLng = [lat, lng] as [number, number];
    markerRef.current.setLatLng(newLatLng);
    mapRef.current.setView(newLatLng, mapRef.current.getZoom());
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="w-full h-72 border border-brand-gray-700 z-0"
      style={{ background: "#1a1a1a" }}
    />
  );
}
