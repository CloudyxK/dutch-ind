"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface Props {
  originCoords: [number, number];
  destCoords: [number, number];
  originLabel?: string;
  destLabel?: string;
}

/** Quadratic Bezier arc in lat/lng space */
function buildArc(p1: [number, number], p2: [number, number], steps = 80): [number, number][] {
  const dlat = Math.abs(p2[0] - p1[0]);
  const dlng = Math.abs(p2[1] - p1[1]);
  const lift = Math.max(dlat, dlng) * 0.45 + 0.4;
  const ctrl: [number, number] = [(p1[0] + p2[0]) / 2 + lift, (p1[1] + p2[1]) / 2];
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const u = 1 - t;
    return [u * u * p1[0] + 2 * u * t * ctrl[0] + t * t * p2[0],
            u * u * p1[1] + 2 * u * t * ctrl[1] + t * t * p2[1]] as [number, number];
  });
}

export default function ShippingMap({ originCoords, destCoords, originLabel, destLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef   = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current || cleanupRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      // Fix webpack asset path
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        keyboard: false,
        tap: false,
        touchZoom: false,
      });

      /* ── Satellite base tiles (ESRI — free, no key) ── */
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18, attribution: "© Esri" }
      ).addTo(map);

      /* ── Dark label overlay (CartoDB) ── */
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 18 }
      ).addTo(map);

      /* ── Dashed arc ── */
      const arc = buildArc(originCoords, destCoords);
      L.polyline(arc, {
        color: "rgba(255,255,255,0.7)",
        weight: 2,
        dashArray: "8 7",
        lineCap: "round",
      }).addTo(map);

      /* ── Origin marker ── */
      const mkOrigin = L.divIcon({
        html: `<div style="
          width:12px;height:12px;background:white;border-radius:50%;
          box-shadow:0 0 0 3px rgba(255,255,255,0.22),
                     0 0 18px rgba(255,255,255,0.55);
        "></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      L.marker(originCoords, { icon: mkOrigin }).addTo(map)
        .bindTooltip(originLabel || "Pengirim", {
          permanent: true, direction: "top",
          offset: [0, -9], className: "ship-label",
        });

      /* ── Destination marker (pulsing) ── */
      const mkDest = L.divIcon({
        html: `<div style="position:relative;width:18px;height:18px">
          <div style="position:absolute;inset:0;border-radius:50%;border:2px solid white;
               animation:dest-pulse 2.2s ease-out infinite;"></div>
          <div style="position:absolute;inset:4px;border-radius:50%;background:white;"></div>
        </div>`,
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker(destCoords, { icon: mkDest }).addTo(map)
        .bindTooltip(destLabel || "Tujuan", {
          permanent: true, direction: "top",
          offset: [0, -12], className: "ship-label",
        });

      /* ── Animated plane marker ── */
      const mkPlane = (deg: number) => L.divIcon({
        html: `<div style="font-size:17px;line-height:1;transform:rotate(${deg}deg);
               filter:drop-shadow(0 0 6px rgba(255,255,255,0.85));
               transform-origin:center;">✈</div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const planeMarker = L.marker(arc[0], { icon: mkPlane(0), zIndexOffset: 1000 }).addTo(map);

      let idx = 0;
      const timer = setInterval(() => {
        idx = (idx + 1) % arc.length;
        planeMarker.setLatLng(arc[idx]);

        // Rotate plane in direction of travel
        if (idx < arc.length - 1) {
          const [lat1, lng1] = arc[idx];
          const [lat2, lng2] = arc[Math.min(idx + 3, arc.length - 1)];
          const angle = Math.atan2(lng2 - lng1, lat2 - lat1) * (180 / Math.PI) - 45;
          planeMarker.setIcon(mkPlane(angle));
        }
      }, 55);

      /* ── Fit bounds ── */
      map.fitBounds(L.latLngBounds([originCoords, destCoords]), { padding: [52, 52] });

      cleanupRef.current = () => {
        clearInterval(timer);
        map.remove();
        cleanupRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div ref={containerRef} style={{ height: "340px" }} className="w-full" />
      <style>{`
        /* Tooltip label */
        .ship-label {
          background: rgba(0,0,0,0.82) !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          color: white !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
          padding: 3px 8px !important;
          border-radius: 2px !important;
          box-shadow: none !important;
          white-space: nowrap !important;
        }
        .ship-label::before { display: none !important; }

        /* Attribution */
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.55) !important;
          color: rgba(255,255,255,0.3) !important;
          font-size: 9px !important;
          padding: 1px 5px !important;
        }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.4) !important; }
        .leaflet-attribution-flag { display: none !important; }

        /* Dest marker pulse */
        @keyframes dest-pulse {
          0%   { transform: scale(1);  opacity: 1; }
          100% { transform: scale(3.2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
