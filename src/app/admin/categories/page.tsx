"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Package, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
}

const emptyForm = { name: "", description: "", image: "", sortOrder: "0" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    setCategories(json.data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
      sortOrder: String(cat.sortOrder),
    });
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Nama kategori wajib diisi"); return; }
    setSaving(true);
    setError("");
    try {
      const method = editing ? "PATCH" : "POST";
      const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); return; }
      await fetchCategories();
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) { alert(json.error || "Gagal menghapus"); return; }
      await fetchCategories();
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(cat: Category) {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    fetchCategories();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
            <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.28)" }}>Admin</span>
          </div>
          <h1 className="text-3xl font-display tracking-widest uppercase text-white">Kategori</h1>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm gap-2 flex items-center">
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      </div>

      {/* Table */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-gray-700 bg-brand-gray-800">
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Nama</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden sm:table-cell">Slug</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Produk</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden md:table-cell">Urutan</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Status</th>
              <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-brand-gray-500 text-sm">Memuat...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-brand-gray-500 text-sm">Belum ada kategori</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-brand-gray-800/40 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img src={cat.image} alt="" className="w-8 h-8 object-cover bg-brand-gray-800" />
                    ) : (
                      <div className="w-8 h-8 bg-brand-gray-800 flex items-center justify-center">
                        <Package className="w-3.5 h-3.5 text-brand-gray-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-white">{cat.name}</span>
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <span className="text-xs text-brand-gray-500 font-mono">{cat.slug}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-brand-gray-400">{cat._count.products}</span>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-sm text-brand-gray-400">{cat.sortOrder}</span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(cat)}
                    className={cn(
                      "text-[10px] uppercase tracking-wider px-2 py-1 border transition-colors",
                      cat.isActive
                        ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                        : "border-brand-gray-700 text-brand-gray-500 hover:bg-brand-gray-800"
                    )}
                  >
                    {cat.isActive ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
                <td className="p-4 text-right">
                  {confirmDeleteId === cat.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-brand-gray-400">Hapus?</span>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-brand-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 hover:bg-brand-gray-700 transition-colors text-brand-gray-400 hover:text-white"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(cat.id)}
                        className="p-1.5 hover:bg-red-500/10 transition-colors text-brand-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="bg-brand-gray-900 border border-brand-gray-700 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase tracking-widest">
                {editing ? "Edit Kategori" : "Tambah Kategori"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-brand-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && <p className="text-xs text-red-400 border border-red-400/20 px-3 py-2">{error}</p>}

            <div className="space-y-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-brand-gray-400 block mb-1">Nama *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-brand-gray-800 border border-brand-gray-700 px-3 py-2 text-sm text-white focus:border-white outline-none"
                  placeholder="Contoh: T-Shirt"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-brand-gray-400 block mb-1">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full bg-brand-gray-800 border border-brand-gray-700 px-3 py-2 text-sm text-white focus:border-white outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-brand-gray-400 block mb-1">URL Gambar</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full bg-brand-gray-800 border border-brand-gray-700 px-3 py-2 text-sm text-white focus:border-white outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-brand-gray-400 block mb-1">Urutan Tampil</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full bg-brand-gray-800 border border-brand-gray-700 px-3 py-2 text-sm text-white focus:border-white outline-none"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-brand-gray-700 py-2 text-xs uppercase tracking-wider text-brand-gray-400 hover:text-white hover:border-brand-gray-500 transition-colors">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary text-xs disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Kategori"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
