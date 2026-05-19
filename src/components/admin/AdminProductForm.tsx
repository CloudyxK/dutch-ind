"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  initialData?: any;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function AdminProductForm({ categories, initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    comparePrice: initialData?.comparePrice || "",
    sku: initialData?.sku || "",
    categoryId: initialData?.categoryId || "",
    weight: initialData?.weight || 300,
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured || false,
    isNewArrival: initialData?.isNewArrival || false,
    isBestSeller: initialData?.isBestSeller || false,
    tags: initialData?.tags?.join(", ") || "",
  });

  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((i: any) => i.url) || [""]
  );

  const [variants, setVariants] = useState<{ size: string; stock: number }[]>(
    initialData?.variants || [{ size: "M", stock: 0 }]
  );

  const [loading, setLoading] = useState(false);

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : slugify(name),
    }));
  };

  const addImage = () => setImages((prev) => [...prev, ""]);
  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));
  const updateImage = (index: number, url: string) =>
    setImages((prev) => prev.map((img, i) => (i === index ? url : img)));

  const addVariant = () => {
    const usedSizes = variants.map((v) => v.size);
    const nextSize = SIZES.find((s) => !usedSizes.includes(s));
    if (nextSize) {
      setVariants((prev) => [...prev, { size: nextSize, stock: 0 }]);
    }
  };

  const removeVariant = (index: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        weight: parseFloat(String(form.weight)),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        images: images.filter(Boolean),
        variants: variants.filter((v) => v.size),
      };

      const url = isEdit ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk");

      toast.success(isEdit ? "Produk diperbarui!" : "Produk ditambahkan!");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main info */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4">Informasi Produk</h2>

          <div>
            <label className="input-label">Nama Produk</label>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input-field"
              placeholder="Nama produk"
              required
            />
          </div>

          <div>
            <label className="input-label">Slug (URL)</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              className="input-field font-mono text-sm"
              placeholder="nama-produk"
              required
            />
          </div>

          <div>
            <label className="input-label">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="input-field resize-none h-32"
              placeholder="Deskripsi produk..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Harga Jual (Rp)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className="input-field"
                placeholder="285000"
                required
              />
            </div>
            <div>
              <label className="input-label">Harga Coret (Rp)</label>
              <input
                type="number"
                value={form.comparePrice}
                onChange={(e) => setForm((p) => ({ ...p, comparePrice: e.target.value }))}
                className="input-field"
                placeholder="350000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">SKU</label>
              <input
                value={form.sku}
                onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                className="input-field"
                placeholder="SW-TS-001"
              />
            </div>
            <div>
              <label className="input-label">Berat (gram)</label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                className="input-field"
                placeholder="300"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Tags (pisahkan dengan koma)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              className="input-field"
              placeholder="hoodie, premium, streetwear"
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest">Gambar Produk</h2>
            <button type="button" onClick={addImage} className="btn-ghost text-xs gap-1">
              <Plus className="w-3 h-3" /> Tambah
            </button>
          </div>
          <div className="space-y-2">
            {images.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={url}
                  onChange={(e) => updateImage(index, e.target.value)}
                  className="input-field flex-1"
                  placeholder={`URL gambar ${index + 1}`}
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-brand-gray-800 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-gray-500 mt-2">Gambar pertama akan jadi gambar utama</p>
        </div>

        {/* Variants */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest">Ukuran & Stok</h2>
            <button
              type="button"
              onClick={addVariant}
              disabled={variants.length >= SIZES.length}
              className="btn-ghost text-xs gap-1 disabled:opacity-30"
            >
              <Plus className="w-3 h-3" /> Tambah Ukuran
            </button>
          </div>
          <div className="space-y-2">
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  value={variant.size}
                  onChange={(e) =>
                    setVariants((prev) =>
                      prev.map((v, i) => (i === index ? { ...v, size: e.target.value } : v))
                    )
                  }
                  className="input-field w-24"
                >
                  {SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) =>
                    setVariants((prev) =>
                      prev.map((v, i) =>
                        i === index ? { ...v, stock: parseInt(e.target.value) || 0 } : v
                      )
                    )
                  }
                  className="input-field flex-1"
                  placeholder="Jumlah stok"
                  min="0"
                />
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-2 bg-brand-gray-800 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest">Pengaturan</h2>

          <div>
            <label className="input-label">Kategori</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {[
              { key: "isActive", label: "Aktif (tampilkan di toko)" },
              { key: "isFeatured", label: "Produk Pilihan" },
              { key: "isNewArrival", label: "New Arrival" },
              { key: "isBestSeller", label: "Best Seller" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                  className={`w-8 h-4 relative transition-colors ${
                    form[key as keyof typeof form] ? "bg-white" : "bg-brand-gray-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 bg-black transition-transform ${
                      form[key as keyof typeof form] ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-xs text-brand-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "Menyimpan..." : isEdit ? "Perbarui Produk" : "Tambah Produk"}
        </button>
      </div>
    </form>
  );
}
