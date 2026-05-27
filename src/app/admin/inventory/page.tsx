"use client";

import { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryLog {
  id: string;
  action: string;
  quantity: number;
  prevStock: number;
  newStock: number;
  note: string | null;
  createdAt: string;
  product: { id: string; name: string };
  variant: { id: string; size: string };
}

interface Variant {
  id: string;
  size: string;
  stock: number;
  product: { name: string };
}

export default function AdminInventoryPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showAdjust, setShowAdjust] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [form, setForm] = useState({ variantId: "", action: "ADD", quantity: "1", note: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchLogs(); }, [page]);

  async function fetchLogs() {
    setLoading(true);
    const res = await fetch(`/api/admin/inventory?page=${page}`);
    const json = await res.json();
    setLogs(json.data || []);
    setTotal(json.total || 0);
    setPages(json.pages || 1);
    setLoading(false);
  }

  async function openAdjust() {
    const res = await fetch("/api/admin/products?limit=200");
    const json = await res.json();
    const allVariants: Variant[] = [];
    (json.data || []).forEach((p: any) => {
      p.variants?.forEach((v: any) => {
        allVariants.push({ id: v.id, size: v.size, stock: v.stock, product: { name: p.name } });
      });
    });
    setVariants(allVariants);
    setForm({ variantId: allVariants[0]?.id || "", action: "ADD", quantity: "1", note: "" });
    setError("");
    setShowAdjust(true);
  }

  async function handleAdjust() {
    if (!form.variantId) { setError("Pilih varian terlebih dahulu"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); return; }
      setShowAdjust(false);
      setPage(1);
      fetchLogs();
    } finally {
      setSaving(false);
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
            <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.28)" }}>Admin</span>
          </div>
          <h1 className="text-3xl font-display tracking-widest uppercase text-white">Inventori</h1>
        </div>
        <button onClick={openAdjust} className="btn-primary text-sm gap-2 flex items-center">
          <Plus className="w-4 h-4" />
          Adjust Stok
        </button>
      </div>

      <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-gray-700 bg-brand-gray-800">
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Produk</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Aksi</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Qty</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden sm:table-cell">Sebelum</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden sm:table-cell">Sesudah</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden md:table-cell">Catatan</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden lg:table-cell">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-800">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-brand-gray-500 text-sm">Memuat...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-brand-gray-500 text-sm">Belum ada riwayat inventori</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-brand-gray-800/40 transition-colors">
                <td className="p-4">
                  <p className="text-sm text-white">{log.product.name}</p>
                  <p className="text-xs text-brand-gray-500">Size {log.variant.size}</p>
                </td>
                <td className="p-4">
                  <div className={cn("flex items-center gap-1 text-xs font-medium uppercase tracking-wider",
                    log.action === "ADD" ? "text-green-400" : "text-red-400")}>
                    {log.action === "ADD" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {log.action === "ADD" ? "Masuk" : "Keluar"}
                  </div>
                </td>
                <td className="p-4">
                  <span className={cn("text-sm font-bold", log.action === "ADD" ? "text-green-400" : "text-red-400")}>
                    {log.action === "ADD" ? "+" : "-"}{log.quantity}
                  </span>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <span className="text-sm text-brand-gray-400">{log.prevStock}</span>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <span className="text-sm text-white font-medium">{log.newStock}</span>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-xs text-brand-gray-500">{log.note || "—"}</span>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <span className="text-xs text-brand-gray-500">{formatDate(log.createdAt)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-brand-gray-700 text-brand-gray-400 hover:border-white hover:text-white disabled:opacity-30 transition-colors">
            ← Sebelumnya
          </button>
          <span className="text-xs text-brand-gray-500">{page} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 text-xs border border-brand-gray-700 text-brand-gray-400 hover:border-white hover:text-white disabled:opacity-30 transition-colors">
            Berikutnya →
          </button>
        </div>
      )}

      {/* Adjust modal */}
      {showAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="bg-brand-gray-900 border border-brand-gray-700 w-full max-w-md p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest">Adjust Stok</h2>
            {error && <p className="text-xs text-red-400 border border-red-400/20 px-3 py-2">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-brand-gray-400 block mb-1">Produk & Ukuran *</label>
                <select
                  value={form.variantId}
                  onChange={(e) => setForm({ ...form, variantId: e.target.value })}
                  className="w-full bg-brand-gray-800 border border-brand-gray-700 px-3 py-2 text-sm text-white focus:border-white outline-none"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.product.name} — Size {v.size} (stok: {v.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-brand-gray-400 block mb-1">Tipe Adjustment</label>
                <div className="flex gap-2">
                  {["ADD","REMOVE"].map((a) => (
                    <button
                      key={a}
                      onClick={() => setForm({ ...form, action: a })}
                      className={cn("flex-1 py-2 text-xs uppercase tracking-wider border-2 transition-colors",
                        form.action === a ? "border-white bg-white text-black" : "border-brand-gray-700 text-brand-gray-400 hover:border-white"
                      )}
                    >
                      {a === "ADD" ? "Tambah Stok" : "Kurangi Stok"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-brand-gray-400 block mb-1">Jumlah *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full bg-brand-gray-800 border border-brand-gray-700 px-3 py-2 text-sm text-white focus:border-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-brand-gray-400 block mb-1">Catatan</label>
                <input
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full bg-brand-gray-800 border border-brand-gray-700 px-3 py-2 text-sm text-white focus:border-white outline-none"
                  placeholder="Contoh: Restock dari supplier"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdjust(false)} className="flex-1 border border-brand-gray-700 py-2 text-xs uppercase tracking-wider text-brand-gray-400 hover:text-white hover:border-brand-gray-500 transition-colors">
                Batal
              </button>
              <button onClick={handleAdjust} disabled={saving} className="flex-1 btn-primary text-xs disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
