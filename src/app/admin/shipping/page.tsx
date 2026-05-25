"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Save, RefreshCw, Info } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

const AdminMapPicker = dynamic(() => import("@/components/admin/AdminMapPicker"), {
  ssr: false,
  loading: () => <div className="w-full h-72 border border-brand-gray-700 bg-brand-gray-800 flex items-center justify-center text-brand-gray-500 text-sm">Memuat peta...</div>,
});

type Cfg = {
  "store.lat": string;
  "store.lng": string;
  "store.address": string;
  "shipping.reguler.base": string;
  "shipping.reguler.freeAbove": string;
  "shipping.ekspres.base": string;
  "shipping.sameday.base": string;
  "shipping.sameday.perKm": string;
  "shipping.sameday.maxKm": string;
};

const DEFAULTS: Cfg = {
  "store.lat": "-6.2088",
  "store.lng": "106.8456",
  "store.address": "Jakarta",
  "shipping.reguler.base": "15000",
  "shipping.reguler.freeAbove": "500000",
  "shipping.ekspres.base": "25000",
  "shipping.sameday.base": "10000",
  "shipping.sameday.perKm": "3000",
  "shipping.sameday.maxKm": "30",
};

export default function AdminShippingPage() {
  const [cfg, setCfg] = useState<Cfg>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings?keys=" + Object.keys(DEFAULTS).join(","))
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) setCfg((prev) => ({ ...prev, ...data }));
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (!res.ok) throw new Error();
      toast.success("Konfigurasi pengiriman disimpan");
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function geocodeAddress() {
    if (!cfg["store.address"]) return;
    setGeocoding(true);
    try {
      const q = encodeURIComponent(cfg["store.address"] + " Indonesia");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=id`
      );
      const data = await res.json();
      if (data.length) {
        setCfg((prev) => ({
          ...prev,
          "store.lat": parseFloat(data[0].lat).toFixed(6),
          "store.lng": parseFloat(data[0].lon).toFixed(6),
        }));
        toast.success("Koordinat ditemukan");
      } else {
        toast.error("Alamat tidak ditemukan, coba lebih spesifik");
      }
    } catch {
      toast.error("Gagal mencari koordinat");
    } finally {
      setGeocoding(false);
    }
  }

  // Live preview of sameday pricing
  const base = parseFloat(cfg["shipping.sameday.base"]) || 0;
  const perKm = parseFloat(cfg["shipping.sameday.perKm"]) || 0;
  const maxKm = parseFloat(cfg["shipping.sameday.maxKm"]) || 30;
  const previewKms = [1, 3, 5, 10, 15, 20];

  function field(
    key: keyof Cfg,
    label: string,
    opts?: { type?: string; step?: string; hint?: string; suffix?: string }
  ) {
    return (
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1">{label}</label>
        {opts?.hint && <p className="text-xs text-brand-gray-500 mb-1">{opts.hint}</p>}
        <div className="flex items-center gap-2">
          <input
            type={opts?.type ?? "text"}
            step={opts?.step}
            value={cfg[key]}
            onChange={(e) => setCfg((prev) => ({ ...prev, [key]: e.target.value }))}
            className="input-field w-full py-2"
          />
          {opts?.suffix && (
            <span className="text-xs text-brand-gray-400 flex-shrink-0">{opts.suffix}</span>
          )}
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-brand-gray-400 text-sm p-6">Memuat...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display tracking-widest uppercase">Konfigurasi Ongkir</h1>
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-5 py-2 text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {/* Store location */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Lokasi Toko
        </h2>
        <p className="text-xs text-brand-gray-500">
          Koordinat toko digunakan untuk menghitung jarak ke alamat pembeli.
          Cari alamat lalu klik <strong>Cari di Peta</strong>, atau langsung klik/drag marker di peta.
        </p>

        {/* Search box */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1">Cari Alamat / Area</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cfg["store.address"]}
              onChange={(e) => setCfg((prev) => ({ ...prev, "store.address": e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && geocodeAddress()}
              className="input-field flex-1 py-2"
              placeholder="Contoh: Jl. Kebon Jeruk No.10, Jakarta Barat"
            />
            <button
              type="button"
              onClick={geocodeAddress}
              disabled={geocoding}
              className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 flex-shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${geocoding ? "animate-spin" : ""}`} />
              {geocoding ? "Mencari..." : "Cari di Peta"}
            </button>
          </div>
        </div>

        {/* Interactive map */}
        <div className="space-y-2">
          <p className="text-[10px] text-brand-gray-500 uppercase tracking-widest font-bold">
            Klik peta atau drag marker untuk set lokasi
          </p>
          <AdminMapPicker
            lat={parseFloat(cfg["store.lat"]) || -6.2088}
            lng={parseFloat(cfg["store.lng"]) || 106.8456}
            onChange={(lat, lng) =>
              setCfg((prev) => ({
                ...prev,
                "store.lat": lat.toFixed(6),
                "store.lng": lng.toFixed(6),
              }))
            }
          />
        </div>

        {/* Koordinat manual */}
        <div className="grid grid-cols-2 gap-4">
          {field("store.lat", "Latitude", { type: "number", step: "0.000001" })}
          {field("store.lng", "Longitude", { type: "number", step: "0.000001" })}
        </div>

        {cfg["store.lat"] && cfg["store.lng"] && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-brand-gray-500">
              📍 {parseFloat(cfg["store.lat"]).toFixed(5)}, {parseFloat(cfg["store.lng"]).toFixed(5)}
            </span>
            <a
              href={`https://www.google.com/maps?q=${cfg["store.lat"]},${cfg["store.lng"]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Buka di Google Maps ↗
            </a>
          </div>
        )}
      </div>

      {/* Reguler & Ekspres */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest">Harga Tetap</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {field("shipping.reguler.base", "Ongkir Reguler (Rp)", { type: "number" })}
          {field("shipping.reguler.freeAbove", "Gratis Reguler jika belanja ≥ (Rp)", { type: "number" })}
          {field("shipping.ekspres.base", "Ongkir Ekspres (Rp)", { type: "number" })}
        </div>
      </div>

      {/* Same Day */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest">Same Day — Harga per Jarak</h2>
        <div className="flex items-start gap-2 p-3 bg-brand-gray-800 border border-brand-gray-700 text-xs text-brand-gray-400">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Formula: <strong className="text-white">Biaya Dasar + (Jarak × Harga per km)</strong>.
            Jika jarak melebihi Radius Maks, Same Day tidak tersedia untuk pembeli tersebut.
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {field("shipping.sameday.base", "Biaya Dasar (Rp)", { type: "number", hint: "Biaya minimum / ongkir 0 km" })}
          {field("shipping.sameday.perKm", "Harga per km (Rp)", { type: "number" })}
          {field("shipping.sameday.maxKm", "Radius Maks (km)", { type: "number", hint: "Di luar radius = Same Day tidak tersedia" })}
        </div>

        {/* Live preview table */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2 text-brand-gray-400">Preview Tarif</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-gray-700">
                  <th className="text-left py-2 pr-4 text-xs text-brand-gray-500">Jarak</th>
                  <th className="text-left py-2 text-xs text-brand-gray-500">Ongkir Same Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-800">
                {previewKms.map((km) => {
                  const fare = base + km * perKm;
                  const rounded = Math.round(fare / 500) * 500;
                  const outOfRange = km > maxKm;
                  return (
                    <tr key={km}>
                      <td className="py-2 pr-4 text-brand-gray-300">{km} km</td>
                      <td className={`py-2 font-semibold ${outOfRange ? "text-red-400" : "text-white"}`}>
                        {outOfRange ? "Di luar jangkauan" : formatPrice(rounded)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
