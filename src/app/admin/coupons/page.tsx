"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
};

const empty = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => setCoupons(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Gagal membuat kupon"); return; }
      setCoupons((prev) => [json.data, ...prev]);
      setForm({ ...empty });
      setShowForm(false);
      toast.success("Kupon berhasil dibuat");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    if (!res.ok) { toast.error("Gagal mengubah status"); return; }
    setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
    toast.success(`Kupon ${coupon.isActive ? "dinonaktifkan" : "diaktifkan"}`);
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Hapus kupon ini?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Gagal menghapus"); return; }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Kupon dihapus");
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  const field = (key: string, label: string, props?: any) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-1">{label}</label>
      <input
        className="input-field w-full py-2"
        value={(form as any)[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        {...props}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display tracking-widest uppercase">Kupon</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" />
          Buat Kupon
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-5">Kupon Baru</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("code", "Kode Kupon *", { required: true, placeholder: "DUTCH10", className: "input-field w-full py-2 uppercase" })}
              {field("description", "Deskripsi", { placeholder: "Diskon 10% untuk semua produk" })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Tipe Diskon *</label>
                <select
                  className="input-field w-full py-2"
                  value={form.discountType}
                  onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                >
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED">Nominal (Rp)</option>
                </select>
              </div>
              {field("discountValue", `Nilai Diskon * ${form.discountType === "PERCENTAGE" ? "(%)" : "(Rp)"}`, {
                required: true, type: "number", min: 1, placeholder: form.discountType === "PERCENTAGE" ? "10" : "50000",
              })}
              {field("minOrderAmount", "Min. Pembelian (Rp)", { type: "number", min: 0, placeholder: "0" })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {form.discountType === "PERCENTAGE" && field("maxDiscount", "Maks. Diskon (Rp)", { type: "number", min: 0, placeholder: "Tidak terbatas" })}
              {field("usageLimit", "Batas Penggunaan", { type: "number", min: 1, placeholder: "Tidak terbatas" })}
              {field("startDate", "Tanggal Mulai *", { type: "date", required: true })}
              {field("endDate", "Tanggal Berakhir", { type: "date" })}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2 text-sm">Batal</button>
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm">
                {saving ? "Menyimpan..." : "Simpan Kupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-brand-gray-500 text-sm">Memuat...</div>
        ) : coupons.length === 0 ? (
          <div className="p-10 text-center text-brand-gray-500 text-sm">Belum ada kupon</div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-brand-gray-700 bg-brand-gray-800">
                {["Kode", "Diskon", "Min. Order", "Pemakaian", "Berlaku", "Status", ""].map((h) => (
                  <th key={h} className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-800">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-brand-gray-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{c.code}</span>
                      <button onClick={() => copyCode(c.code)} className="text-brand-gray-500 hover:text-white transition-colors">
                        {copied === c.code ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    {c.description && <p className="text-xs text-brand-gray-500 mt-0.5">{c.description}</p>}
                  </td>
                  <td className="p-4 text-sm font-semibold">
                    {c.discountType === "PERCENTAGE"
                      ? `${c.discountValue}%${c.maxDiscount ? ` (maks. ${formatPrice(c.maxDiscount)})` : ""}`
                      : formatPrice(c.discountValue)}
                  </td>
                  <td className="p-4 text-sm text-brand-gray-400">
                    {c.minOrderAmount > 0 ? formatPrice(c.minOrderAmount) : "—"}
                  </td>
                  <td className="p-4 text-sm text-brand-gray-400">
                    {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}
                  </td>
                  <td className="p-4 text-xs text-brand-gray-400">
                    <p>{formatDate(c.startDate)}</p>
                    {c.endDate && <p>s/d {formatDate(c.endDate)}</p>}
                    {!c.endDate && <p className="text-brand-gray-600">Tanpa batas</p>}
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(c)} className="flex items-center gap-1.5 text-xs">
                      {c.isActive
                        ? <><ToggleRight className="w-5 h-5 text-green-400" /><span className="text-green-400">Aktif</span></>
                        : <><ToggleLeft className="w-5 h-5 text-brand-gray-500" /><span className="text-brand-gray-500">Nonaktif</span></>}
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => deleteCoupon(c.id)} className="p-1.5 text-brand-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
