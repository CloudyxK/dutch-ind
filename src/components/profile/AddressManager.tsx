"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Plus, Pencil, Trash2, Star, X, Check, ChevronDown, ChevronUp } from "lucide-react";

const MapPicker = dynamic(() => import("@/components/admin/AdminMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-brand-gray-800 border border-brand-gray-700 flex items-center justify-center text-brand-gray-500 text-xs" style={{ height: 260 }}>
      Memuat peta...
    </div>
  ),
});

type Address = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  street: string;
  isDefault: boolean;
};

const LABELS = ["Rumah", "Alamat Utama", "Kantor"];

const emptyForm = {
  label: "Rumah",
  recipientName: "",
  phone: "",
  province: "",
  city: "",
  district: "",
  postalCode: "",
  street: "",
  isDefault: false,
};

// Parse Nominatim address fields → form fields
function parseAddress(addr: Record<string, string>) {
  return {
    province:   addr.state       || addr.province      || "",
    city:       addr.city        || addr.regency        || addr.county         || addr.city_district || "",
    district:   addr.suburb      || addr.village        || addr.municipality   || addr.neighbourhood  || addr.district || "",
    postalCode: addr.postcode    || "",
    road:       addr.road        || addr.pedestrian     || addr.footway        || addr.path           || "",
  };
}

export default function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Address | null>(null);
  const [form, setForm]           = useState({ ...emptyForm });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // Map state
  const [showMap, setShowMap]     = useState(true);
  const [mapLat, setMapLat]       = useState(-0.5021);
  const [mapLng, setMapLng]       = useState(117.1536);
  const [mapFilling, setMapFilling] = useState(false);
  const revTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMapChange = useCallback((lat: number, lng: number) => {
    setMapLat(lat);
    setMapLng(lng);
    if (revTimer.current) clearTimeout(revTimer.current);
    revTimer.current = setTimeout(async () => {
      setMapFilling(true);
      try {
        const res  = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
        const data = await res.json();
        if (data?.address) {
          const parsed = parseAddress(data.address);
          setForm((prev) => ({
            ...prev,
            province:   parsed.province   || prev.province,
            city:       parsed.city       || prev.city,
            district:   parsed.district   || prev.district,
            postalCode: parsed.postalCode || prev.postalCode,
            // Hanya isi street jika masih kosong
            street: prev.street || parsed.road || prev.street,
          }));
        }
      } catch {}
      finally { setMapFilling(false); }
    }, 800);
  }, []);

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm });
    setMapLat(-0.5021);
    setMapLng(117.1536);
    setShowMap(true);
    setError("");
    setShowForm(true);
  }

  function openEdit(addr: Address) {
    setEditing(addr);
    setForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      postalCode: addr.postalCode,
      street: addr.street,
      isDefault: addr.isDefault,
    });
    setMapLat(-0.5021);
    setMapLng(117.1536);
    setShowMap(false); // collapsed by default saat edit (sudah ada data)
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    if (revTimer.current) clearTimeout(revTimer.current);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url    = editing ? `/api/addresses/${editing.id}` : "/api/addresses";
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); return; }

      if (editing) {
        setAddresses((prev) =>
          prev.map((a) => {
            if (form.isDefault && a.id !== editing.id) return { ...a, isDefault: false };
            if (a.id === editing.id) return json.data;
            return a;
          })
        );
      } else {
        setAddresses((prev) => {
          const updated = json.data.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
          return [json.data, ...updated].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
        });
      }
      closeForm();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus alamat ini?")) return;
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      const deleted   = prev.find((a) => a.id === id);
      if (deleted?.isDefault && remaining.length > 0) remaining[0] = { ...remaining[0], isDefault: true };
      return remaining;
    });
  }

  async function handleSetDefault(id: string) {
    const res = await fetch(`/api/addresses/${id}`, { method: "PATCH" });
    if (!res.ok) return;
    setAddresses((prev) =>
      prev
        .map((a) => ({ ...a, isDefault: a.id === id }))
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold uppercase tracking-widest">Alamat Tersimpan</h2>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Alamat
        </button>
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-16 border border-dashed border-brand-gray-700">
          <MapPin className="w-10 h-10 mx-auto mb-3 text-brand-gray-600" />
          <p className="text-brand-gray-400 text-sm">Belum ada alamat tersimpan</p>
          <button onClick={openAdd} className="mt-4 text-sm underline text-brand-gray-300 hover:text-white">
            Tambah alamat pertama
          </button>
        </div>
      )}

      {/* Address list */}
      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`border p-4 transition-colors ${addr.isDefault ? "border-white bg-brand-gray-900" : "border-brand-gray-700 bg-brand-gray-900"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-gray-700">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-white text-black flex items-center gap-1">
                      <Star className="w-3 h-3" /> Utama
                    </span>
                  )}
                </div>
                <p className="font-semibold text-sm">{addr.recipientName}</p>
                <p className="text-sm text-brand-gray-400">{addr.phone}</p>
                <p className="text-sm text-brand-gray-400 mt-0.5">
                  {addr.street}, {addr.district}, {addr.city}, {addr.province} {addr.postalCode}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    title="Jadikan alamat utama"
                    className="p-1.5 text-brand-gray-400 hover:text-white transition-colors"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => openEdit(addr)} className="p-1.5 text-brand-gray-400 hover:text-white transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-brand-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-brand-gray-900 border border-brand-gray-700 w-full max-w-2xl max-h-[92vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-brand-gray-700 sticky top-0 bg-brand-gray-900 z-10">
              <h3 className="font-bold uppercase tracking-widest text-sm">
                {editing ? "Edit Alamat" : "Tambah Alamat Baru"}
              </h3>
              <button onClick={closeForm} className="p-1 text-brand-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              {/* Label */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Label Alamat</label>
                <div className="flex gap-2">
                  {LABELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, label: l }))}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                        form.label === l ? "bg-white text-black border-white" : "border-brand-gray-600 hover:border-white"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Peta Pilih Lokasi ── */}
              <div className="border border-brand-gray-700 overflow-hidden">
                {/* Toggle header */}
                <button
                  type="button"
                  onClick={() => setShowMap((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-brand-gray-800 hover:bg-brand-gray-700 transition-colors text-left"
                >
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <MapPin className="w-3.5 h-3.5" />
                    Pilih Lokasi dari Peta
                    {mapFilling && (
                      <span className="text-[10px] text-brand-gray-400 font-normal normal-case tracking-normal animate-pulse">
                        mengisi alamat...
                      </span>
                    )}
                  </span>
                  {showMap
                    ? <ChevronUp className="w-4 h-4 text-brand-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-brand-gray-400" />}
                </button>

                {showMap && (
                  <div>
                    <MapPicker
                      lat={mapLat}
                      lng={mapLng}
                      onChange={handleMapChange}
                    />
                    <p className="text-[10px] text-brand-gray-500 px-4 py-2 bg-brand-gray-800 border-t border-brand-gray-700">
                      Geser peta untuk auto-isi Provinsi, Kota, Kecamatan &amp; Kode Pos di bawah.
                    </p>
                  </div>
                )}
              </div>

              {/* Recipient */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Nama Penerima</label>
                  <input
                    className="input-field w-full py-2"
                    value={form.recipientName}
                    onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">No. Telepon</label>
                  <input
                    className="input-field w-full py-2"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Province & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Provinsi
                    {mapFilling && <span className="ml-1 text-brand-gray-500 text-[10px] font-normal normal-case">↻</span>}
                  </label>
                  <input
                    className="input-field w-full py-2"
                    value={form.province}
                    onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Kota / Kabupaten
                    {mapFilling && <span className="ml-1 text-brand-gray-500 text-[10px] font-normal normal-case">↻</span>}
                  </label>
                  <input
                    className="input-field w-full py-2"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* District & Postal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Kecamatan
                    {mapFilling && <span className="ml-1 text-brand-gray-500 text-[10px] font-normal normal-case">↻</span>}
                  </label>
                  <input
                    className="input-field w-full py-2"
                    value={form.district}
                    onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Kode Pos
                    {mapFilling && <span className="ml-1 text-brand-gray-500 text-[10px] font-normal normal-case">↻</span>}
                  </label>
                  <input
                    className="input-field w-full py-2"
                    value={form.postalCode}
                    onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Street */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Alamat Lengkap</label>
                <textarea
                  className="input-field w-full py-2 resize-none"
                  rows={2}
                  placeholder="Nama jalan, nomor rumah, RT/RW, dll."
                  value={form.street}
                  onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                  required
                />
              </div>

              {/* Default */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
                  className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                    form.isDefault ? "bg-white border-white" : "border-brand-gray-600"
                  }`}
                >
                  {form.isDefault && <Check className="w-3 h-3 text-black" />}
                </div>
                <span className="text-sm">Jadikan alamat utama</span>
              </label>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 btn-secondary py-2 text-sm">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-2 text-sm">
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
