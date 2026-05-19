"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, X, Check } from "lucide-react";

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

export default function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm });
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
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = editing ? `/api/addresses/${editing.id}` : "/api/addresses";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
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
      const deleted = prev.find((a) => a.id === id);
      if (deleted?.isDefault && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
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
                <button
                  onClick={() => openEdit(addr)}
                  className="p-1.5 text-brand-gray-400 hover:text-white transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 text-brand-gray-400 hover:text-red-400 transition-colors"
                >
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
          <div className="bg-brand-gray-900 border border-brand-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-brand-gray-700">
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
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Provinsi</label>
                  <input
                    className="input-field w-full py-2"
                    value={form.province}
                    onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Kota / Kabupaten</label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Kecamatan</label>
                  <input
                    className="input-field w-full py-2"
                    value={form.district}
                    onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Kode Pos</label>
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
