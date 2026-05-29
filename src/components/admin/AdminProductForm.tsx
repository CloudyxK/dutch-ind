"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, X, ImagePlus, Loader2, Link as LinkIcon, GripVertical } from "lucide-react";
import { slugify } from "@/lib/utils";
import Image from "next/image";

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
    price: initialData?.price != null ? String(initialData.price) : "",
    comparePrice: initialData?.comparePrice != null ? String(initialData.comparePrice) : "",
    sku: initialData?.sku || "",
    categoryId: initialData?.categoryId || "",
    weight: initialData?.weight != null ? String(initialData.weight) : "300",
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured || false,
    isNewArrival: initialData?.isNewArrival || false,
    isBestSeller: initialData?.isBestSeller || false,
    tags: initialData?.tags?.join(", ") || "",
    salePrice: initialData?.salePrice ?? null as number | null,
    saleStartAt: initialData?.saleStartAt ?? null as string | null,
    saleEndAt: initialData?.saleEndAt ?? null as string | null,
    bulkDiscountQty: initialData?.bulkDiscountQty ?? null as number | null,
    bulkDiscountPct: initialData?.bulkDiscountPct ?? null as number | null,
  });

  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((i: any) => i.url) || [""]
  );

  const [variants, setVariants] = useState<{ size: string; stock: number }[]>(
    initialData?.variants || [{ size: "M", stock: 0 }]
  );

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          if (data.error?.includes("dikonfigurasi")) {
            toast.error("Cloudinary belum dikonfigurasi. Gunakan 'Tambah via URL' untuk sementara.", { duration: 5000 });
            setShowUrlInput(true);
          } else {
            toast.error(data.error || "Upload gagal");
          }
          continue;
        }
        uploaded.push(data.url);
      } catch (err: any) {
        toast.error(err.message);
      }
    }
    setUploading(false);
    if (uploaded.length === 0) return;
    setImages((prev) => {
      const cleaned = prev.filter(Boolean);
      return [...cleaned, ...uploaded];
    });
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http")) {
      toast.error("URL gambar harus dimulai dengan http");
      return;
    }
    setImages((prev) => [...prev.filter(Boolean), trimmed]);
    setUrlInput("");
    toast.success("Gambar ditambahkan");
  };

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
        salePrice: form.salePrice,
        saleStartAt: form.saleStartAt,
        saleEndAt: form.saleEndAt,
        bulkDiscountQty: form.bulkDiscountQty,
        bulkDiscountPct: form.bulkDiscountPct,
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

          {/* Sale Schedule */}
          <div className="border border-brand-gray-700 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">Jadwal Diskon</p>
            <div>
              <label className="input-label">Harga Sale (Rp)</label>
              <input type="number" min="0" className="input-field w-full mt-1"
                placeholder="Kosongkan jika tidak ada"
                value={form.salePrice ?? ""}
                onChange={e => setForm(f => ({ ...f, salePrice: e.target.value ? Number(e.target.value) : null }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Mulai</label>
                <input type="datetime-local" className="input-field w-full mt-1"
                  value={form.saleStartAt ? new Date(form.saleStartAt).toISOString().slice(0,16) : ""}
                  onChange={e => setForm(f => ({ ...f, saleStartAt: e.target.value || null }))} />
              </div>
              <div>
                <label className="input-label">Berakhir</label>
                <input type="datetime-local" className="input-field w-full mt-1"
                  value={form.saleEndAt ? new Date(form.saleEndAt).toISOString().slice(0,16) : ""}
                  onChange={e => setForm(f => ({ ...f, saleEndAt: e.target.value || null }))} />
              </div>
            </div>
          </div>

          {/* Bulk Discount */}
          <div className="border border-brand-gray-700 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">Diskon Beli Banyak</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Min. Qty</label>
                <input type="number" min="2" className="input-field w-full mt-1"
                  placeholder="cth: 2"
                  value={form.bulkDiscountQty ?? ""}
                  onChange={e => setForm(f => ({ ...f, bulkDiscountQty: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div>
                <label className="input-label">Diskon (%)</label>
                <input type="number" min="1" max="100" className="input-field w-full mt-1"
                  placeholder="cth: 10"
                  value={form.bulkDiscountPct ?? ""}
                  onChange={e => setForm(f => ({ ...f, bulkDiscountPct: e.target.value ? Number(e.target.value) : null }))} />
              </div>
            </div>
            {form.bulkDiscountQty && form.bulkDiscountPct && (
              <p className="text-[11px] text-green-400">Beli {form.bulkDiscountQty}+ item → hemat {form.bulkDiscountPct}%</p>
            )}
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
            <button
              type="button"
              onClick={() => setShowUrlInput((v) => !v)}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-brand-gray-400 hover:text-white transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              {showUrlInput ? "Tutup URL" : "Tambah via URL"}
            </button>
          </div>

          {/* URL input option */}
          {showUrlInput && (
            <div className="mb-4 flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
                placeholder="https://res.cloudinary.com/... atau URL gambar lainnya"
                className="input-field flex-1 text-sm"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="btn-secondary px-4 text-xs whitespace-nowrap"
              >
                Tambah
              </button>
            </div>
          )}

          {/* Upload area */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-brand-gray-700 hover:border-brand-gray-500 transition-colors p-8 flex flex-col items-center gap-3 group disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-brand-gray-400 animate-spin" />
                <span className="text-sm text-brand-gray-400">Mengupload...</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-8 h-8 text-brand-gray-500 group-hover:text-brand-gray-300 transition-colors" />
                <div className="text-center">
                  <p className="text-sm text-brand-gray-300 group-hover:text-white transition-colors">
                    Klik untuk pilih foto
                  </p>
                  <p className="text-xs text-brand-gray-500 mt-1">
                    Upload ke Cloudinary · maks. 10 MB per foto
                  </p>
                </div>
              </>
            )}
          </button>

          {/* Preview thumbnails */}
          {images.filter(Boolean).length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.filter(Boolean).map((url, index) => (
                <div
                  key={url + index}
                  className={`relative aspect-square group cursor-grab active:cursor-grabbing transition-opacity ${dragIndex === index ? "opacity-50" : "opacity-100"}`}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex === null || dragIndex === index) return;
                    setImages((prev) => {
                      const filtered = prev.filter(Boolean);
                      const reordered = [...filtered];
                      const [moved] = reordered.splice(dragIndex, 1);
                      reordered.splice(index, 0, moved);
                      return reordered;
                    });
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                >
                  <Image
                    src={url}
                    alt={`Gambar ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  {/* Drag handle */}
                  <div className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-5 h-5 bg-black/70 flex items-center justify-center">
                      <GripVertical className="w-3 h-3 text-white/80" />
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[9px] text-center py-0.5 text-brand-gray-300 uppercase tracking-widest">
                      Utama
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/80 hover:bg-red-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-brand-gray-500 mt-3">
            Foto pertama jadi gambar utama · bisa pilih banyak sekaligus
          </p>
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
