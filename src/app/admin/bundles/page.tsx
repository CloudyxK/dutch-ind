"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Trash2, Package2, Search, X, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type ProductOption = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
};

type BundleItem = {
  id: string;
  product: ProductOption;
};

type Bundle = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  discount: number;
  isActive: boolean;
  sortOrder: number;
  items: BundleItem[];
};

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("0");
  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ProductOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBundles();
  }, []);

  async function fetchBundles() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bundles");
      const json = await res.json();
      if (json.success) setBundles(json.data);
    } catch {
      toast.error("Gagal memuat bundle");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!productSearch.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(productSearch)}&limit=10`);
        const json = await res.json();
        if (json.success) {
          setSearchResults(
            (json.data || []).filter(
              (p: ProductOption) => !selectedProducts.find((s) => s.id === p.id)
            )
          );
        }
      } catch {} finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [productSearch, selectedProducts]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Nama bundle wajib diisi"); return; }
    if (selectedProducts.length < 2) { toast.error("Pilih minimal 2 produk"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          discount: parseFloat(discount) || 0,
          productIds: selectedProducts.map((p) => p.id),
        }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Gagal membuat bundle"); return; }
      toast.success("Bundle berhasil dibuat!");
      setShowForm(false);
      resetForm();
      fetchBundles();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus bundle ini?")) return;
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Gagal menghapus bundle"); return; }
      toast.success("Bundle dihapus");
      setBundles((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error("Gagal menghapus bundle");
    }
  }

  async function handleToggleActive(bundle: Bundle) {
    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !bundle.isActive }),
      });
      if (!res.ok) { toast.error("Gagal memperbarui bundle"); return; }
      setBundles((prev) =>
        prev.map((b) => (b.id === bundle.id ? { ...b, isActive: !b.isActive } : b))
      );
    } catch {
      toast.error("Gagal memperbarui bundle");
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setDiscount("0");
    setSelectedProducts([]);
    setProductSearch("");
    setSearchResults([]);
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
          <h1 className="text-3xl font-display tracking-widest uppercase text-white">Bundle Outfit</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); resetForm(); }}
          className="btn-primary text-sm gap-2 flex items-center"
        >
          <Plus className="w-4 h-4" />
          Buat Bundle
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest">Bundle Baru</h2>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-brand-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 block mb-1">Nama Bundle *</label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="e.g. Street Combo Pack"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 block mb-1">Diskon (%)</label>
                <input
                  type="number"
                  className="input-field w-full"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 block mb-1">Deskripsi</label>
              <textarea
                className="input-field w-full resize-none"
                rows={2}
                placeholder="Deskripsi singkat bundle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Product search */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 block mb-1">
                Pilih Produk * (min. 2)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-500" />
                <input
                  type="text"
                  className="input-field w-full pl-9"
                  placeholder="Cari produk..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-brand-gray-500" />
                )}
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mt-1 bg-brand-gray-800 border border-brand-gray-700 divide-y divide-brand-gray-700 max-h-48 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedProducts((prev) => [...prev, product]);
                        setProductSearch("");
                        setSearchResults([]);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-brand-gray-700 text-left transition-colors"
                    >
                      <div className="relative w-8 h-10 bg-brand-gray-700 flex-shrink-0 overflow-hidden">
                        {product.images[0] && (
                          <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="32px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-brand-gray-400">{formatPrice(product.price)}</p>
                      </div>
                      <Plus className="w-4 h-4 text-brand-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Selected products */}
              {selectedProducts.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-brand-gray-500">{selectedProducts.length} produk dipilih</p>
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 bg-brand-gray-800 p-2">
                      <div className="relative w-8 h-10 bg-brand-gray-700 flex-shrink-0 overflow-hidden">
                        {product.images[0] && (
                          <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="32px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-brand-gray-400">{formatPrice(product.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id))}
                        className="text-brand-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? "Menyimpan..." : "Buat Bundle"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 text-sm border border-brand-gray-600 text-brand-gray-400 hover:text-white hover:border-white transition-colors">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bundle list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-brand-gray-500" />
        </div>
      ) : bundles.length === 0 ? (
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-12 text-center">
          <Package2 className="w-10 h-10 mx-auto mb-3 text-brand-gray-700" />
          <p className="text-brand-gray-500 text-sm">Belum ada bundle. Buat bundle pertamamu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bundles.map((bundle) => {
            const totalOriginal = bundle.items.reduce((s, item) => s + item.product.price, 0);
            const discountedTotal = totalOriginal * (1 - bundle.discount / 100);

            return (
              <div key={bundle.id} className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
                {/* Thumbnail grid */}
                <div className="grid grid-cols-4 gap-px bg-brand-gray-800 h-20">
                  {bundle.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="relative bg-brand-gray-950 overflow-hidden">
                      {item.product.images[0] ? (
                        <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" sizes="60px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package2 className="w-4 h-4 text-brand-gray-700" />
                        </div>
                      )}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - bundle.items.length) }).map((_, i) => (
                    <div key={`e-${i}`} className="bg-brand-gray-900" />
                  ))}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">{bundle.name}</h3>
                      {bundle.description && (
                        <p className="text-xs text-brand-gray-400 mt-0.5 line-clamp-1">{bundle.description}</p>
                      )}
                      <p className="text-xs text-brand-gray-500 mt-0.5">{bundle.items.length} produk</p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(bundle)}
                      className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 border transition-colors ${bundle.isActive ? "border-green-700 text-green-400 hover:bg-red-900/20 hover:border-red-700 hover:text-red-400" : "border-brand-gray-600 text-brand-gray-500 hover:border-green-700 hover:text-green-400"}`}
                    >
                      {bundle.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {bundle.discount > 0 ? (
                      <>
                        <span className="font-bold text-sm">{formatPrice(Math.round(discountedTotal))}</span>
                        <span className="text-xs text-brand-gray-500 line-through">{formatPrice(Math.round(totalOriginal))}</span>
                        <span className="text-[10px] bg-white text-black px-1.5 py-0.5 font-bold">-{bundle.discount}%</span>
                      </>
                    ) : (
                      <span className="font-bold text-sm">{formatPrice(Math.round(totalOriginal))}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(bundle.id)}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Bundle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
