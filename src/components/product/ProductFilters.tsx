"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductFilters({ categories }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const [search, setSearch] = useState(sp.get("search") || "");
  const [category, setCategory] = useState(sp.get("category") || "");
  const [sort, setSort] = useState(sp.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(sp.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") || "");
  const [sizes, setSizes] = useState<string[]>(sp.get("sizes")?.split(",").filter(Boolean) || []);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  function buildParams() {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (category) p.set("category", category);
    if (sort && sort !== "newest") p.set("sort", sort);
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    if (sizes.length) p.set("sizes", sizes.join(","));
    return p.toString();
  }

  function applyFilters() {
    router.push(`/products?${buildParams()}`);
    setShowMobileFilter(false);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters();
  }

  function toggleSize(s: string) {
    setSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function clearAll() {
    setSearch("");
    setCategory("");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setSizes([]);
    router.push("/products");
  }

  const hasActive = !!(search || category || (sort && sort !== "newest") || minPrice || maxPrice || sizes.length);

  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "popular", label: "Terpopuler" },
    { value: "price_asc", label: "Harga ↑" },
    { value: "price_desc", label: "Harga ↓" },
  ];

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full bg-brand-gray-800 border border-brand-gray-700 pl-9 pr-3 py-2 text-sm text-white placeholder-brand-gray-600 focus:border-white outline-none"
          />
        </div>
      </form>

      {/* Category */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-brand-gray-400">Kategori</h3>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => setCategory("")}
              className={cn("block w-full text-left text-sm py-1.5 px-2 transition-colors",
                !category ? "text-white bg-white/5 font-semibold" : "text-brand-gray-400 hover:text-white hover:bg-white/3"
              )}
            >
              Semua Produk
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setCategory(cat.slug)}
                className={cn("block w-full text-left text-sm py-1.5 px-2 transition-colors",
                  category === cat.slug ? "text-white bg-white/5 font-semibold" : "text-brand-gray-400 hover:text-white hover:bg-white/3"
                )}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Size */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-brand-gray-400">Ukuran</h3>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={cn(
                "w-10 h-8 text-xs border-2 font-medium transition-all",
                sizes.includes(s)
                  ? "border-white bg-white text-black"
                  : "border-brand-gray-700 text-brand-gray-400 hover:border-white hover:text-white"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-brand-gray-400">Harga (Rp)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-brand-gray-800 border border-brand-gray-700 px-2 py-1.5 text-xs text-white placeholder-brand-gray-600 focus:border-white outline-none"
            min="0"
          />
          <span className="text-brand-gray-600 text-xs">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-brand-gray-800 border border-brand-gray-700 px-2 py-1.5 text-xs text-white placeholder-brand-gray-600 focus:border-white outline-none"
            min="0"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-brand-gray-400">Urutkan</h3>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={cn("block w-full text-left text-sm py-1.5 px-2 transition-colors",
                sort === opt.value ? "text-white bg-white/5 font-semibold" : "text-brand-gray-400 hover:text-white hover:bg-white/3"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-brand-gray-800">
        <button
          onClick={applyFilters}
          className="w-full btn-primary text-xs py-2.5"
        >
          Terapkan Filter
        </button>
        {hasActive && (
          <button
            onClick={clearAll}
            className="w-full text-xs py-2 text-brand-gray-500 hover:text-white transition-colors underline"
          >
            Reset semua filter
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <FilterPanel />
      </aside>

      {/* Mobile: toggle button + drawer */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilter(true)}
          className="flex items-center gap-2 px-3 py-2 border border-brand-gray-700 text-xs uppercase tracking-wider text-brand-gray-400 hover:border-white hover:text-white transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter & Urutkan
          {hasActive && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-white" />}
        </button>

        {showMobileFilter && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/60" onClick={() => setShowMobileFilter(false)} />
            <div className="w-72 bg-brand-gray-900 border-l border-brand-gray-700 overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
                <button onClick={() => setShowMobileFilter(false)} className="text-brand-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
