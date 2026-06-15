"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search, Sparkles, ExternalLink, Plus, Trash2,
  ShoppingBag, Package, Loader2, ChevronDown, ChevronUp, BookmarkPlus,
  TrendingDown, Clock, Globe, CheckCircle2, X, Filter, SlidersHorizontal,
  ImageOff, AlertCircle, Star, MapPin, Store, ShoppingCart,
  Calculator, Bookmark, BookmarkCheck, TrendingUp, RefreshCw, PackagePlus, Minus,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  keyword: string;
  links: Record<string, string>;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  totalStock: number;
  image: string | null;
}

interface SearchData {
  query: string;
  category: string;
  estimate: { min: number; max: number; unit: string };
  keywords: string[];
  results: SearchResult[];
  aiNotes: string | null;
  relatedProducts: RelatedProduct[];
  platforms: string[];
  priceMin?: number;
  priceMax?: number;
}

interface Source {
  id: string;
  name: string;
  platform: string;
  url: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  minOrder: number | null;
  quality: number;
  notes: string | null;
  isActive: boolean;
  lastChecked: string | null;
  createdAt: string;
}

interface SearchHistory {
  id: string;
  query: string;
  category: string;
  createdAt: string;
  aiNotes: string | null;
}

interface ProductResult {
  id:             string;
  name:           string;
  price:          number;
  priceFormatted: string;
  priceOriginal:  number | null;
  image:          string;
  url:            string;
  rating:         number | null;
  ratingCount:    number | null;
  sold:           string | null;
  shop:           string | null;
  platform:       "shopee" | "tokopedia";
  location:       string | null;
}

interface ProductSearchState {
  products:       ProductResult[];
  count:          number;
  query:          string;
  priceMin?:      number;
  priceMax?:      number;
  platformStatus: Record<string, { count: number; error: string | null }>;
  errors?:        string[];
}

interface BookmarkItem {
  id:           string;
  name:         string;
  price:        number;          // harga saat disimpan
  lastPrice:    number;          // harga terakhir dicek
  image:        string | null;
  url:          string;
  platform:     string;
  platformId:   string;
  shop:         string | null;
  location:     string | null;
  rating:       number | null;
  sold:         string | null;
  notes:        string | null;
  priceHistory: string;          // JSON
  isTracking:   boolean;
  createdAt:    string;
  updatedAt:    string;
}

interface ProductHistoryItem {
  id:        string;
  query:     string;
  priceMin:  number | null;
  priceMax:  number | null;
  platforms: string;
  count:     number;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "hoodie",   label: "Hoodie / Sweater",  emoji: "🧥" },
  { value: "kaos",     label: "Kaos / T-Shirt",    emoji: "👕" },
  { value: "celana",   label: "Celana / Pants",     emoji: "👖" },
  { value: "jacket",   label: "Jacket / Outer",     emoji: "🥼" },
  { value: "topi",     label: "Topi / Hat",         emoji: "🧢" },
  { value: "tas",      label: "Tas / Bag",           emoji: "👜" },
  { value: "aksesori", label: "Aksesori",            emoji: "⌚" },
  { value: "sepatu",   label: "Sepatu / Footwear",  emoji: "👟" },
  { value: "general",  label: "Umum",               emoji: "📦" },
];

const PLATFORM_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  shopee:    { label: "Shopee",     color: "text-orange-400 border-orange-700/40 bg-orange-900/20",  icon: "🛍️" },
  tokopedia: { label: "Tokopedia",  color: "text-green-400  border-green-700/40  bg-green-900/20",   icon: "🟢" },
  lazada:    { label: "Lazada",     color: "text-blue-400   border-blue-700/40   bg-blue-900/20",    icon: "🔵" },
  facebook:  { label: "Facebook",   color: "text-blue-300   border-blue-600/40   bg-blue-950/30",    icon: "👥" },
  tiktok:    { label: "TikTok Shop",color: "text-pink-400   border-pink-700/40   bg-pink-900/20",    icon: "🎵" },
  blibli:    { label: "Blibli",     color: "text-cyan-400   border-cyan-700/40   bg-cyan-900/20",    icon: "🛒" },
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}h lalu`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StockFinderPage() {
  const router = useRouter();

  // Search state
  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState("hoodie");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [searching, setSearching] = useState(false);
  const [result,   setResult]   = useState<SearchData | null>(null);
  const [expandedKw, setExpandedKw] = useState<string | null>(null);
  const [activePlatforms, setActivePlatforms] = useState<Set<string>>(
    new Set(["shopee", "tokopedia", "lazada", "facebook", "tiktok"])
  );

  // Product-search state (Shopee / Tokopedia live results)
  const [pQuery,          setPQuery]          = useState("");
  const [pPriceMin,       setPPriceMin]       = useState("");
  const [pPriceMax,       setPPriceMax]       = useState("");
  const [pPlatforms,      setPPlatforms]      = useState<Set<string>>(new Set(["shopee", "tokopedia"]));
  const [pSearching,      setPSearching]      = useState(false);
  const [pResult,         setPResult]         = useState<ProductSearchState | null>(null);
  const [pSortBy,         setPSortBy]         = useState<"price" | "rating" | "sold">("price");

  // Margin calculator — per-product expanded panel + intended sell price
  const [marginOpenId, setMarginOpenId] = useState<string | null>(null);
  const [marginSell,   setMarginSell]   = useState<Record<string, string>>({});

  // Bookmark / price-tracking state
  const [bookmarks,        setBookmarks]        = useState<BookmarkItem[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [checkingId,       setCheckingId]       = useState<string | null>(null);
  const [savingBookmarkId, setSavingBookmarkId] = useState<string | null>(null);
  const [productHistory,   setProductHistory]   = useState<ProductHistoryItem[]>([]);

  // Sources state
  const [sources,        setSources]        = useState<Source[]>([]);
  const [history,        setHistory]        = useState<SearchHistory[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [filterCat,      setFilterCat]      = useState("all");
  const [activeTab,      setActiveTab]      = useState<"search" | "products" | "bookmarks" | "sources" | "history">("search");

  // Add source form
  const [newSource, setNewSource] = useState({
    name: "", platform: "shopee", url: "", category: "hoodie",
    priceMin: "", priceMax: "", minOrder: "", quality: "3", notes: "",
  });

  useEffect(() => {
    fetchSources();
    fetchHistory();
    fetchBookmarks();
    fetchProductHistory();
  }, []);

  async function fetchSources() {
    setLoadingSources(true);
    try {
      const r = await fetch("/api/admin/stock-finder/sources");
      const d = await r.json();
      setSources(d.data ?? []);
    } finally {
      setLoadingSources(false);
    }
  }

  async function fetchHistory() {
    try {
      const r = await fetch("/api/admin/stock-finder/search");
      const d = await r.json();
      setHistory(d.data ?? []);
    } catch {}
  }

  async function doSearch() {
    if (!query.trim()) { toast.error("Masukkan kata kunci pencarian"); return; }
    setSearching(true);
    setResult(null);
    try {
      const r = await fetch("/api/admin/stock-finder/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query:    query.trim(),
          category,
          priceMin: priceMin ? Number(priceMin) : undefined,
          priceMax: priceMax ? Number(priceMax) : undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResult(d.data);
      fetchHistory();
      toast.success("Pencarian selesai!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSearching(false);
    }
  }

  function openAll(kw: string) {
    if (!result) return;
    const res = result.results.find(r => r.keyword === kw);
    if (!res) return;
    let count = 0;
    Object.entries(res.links).forEach(([platform, url]) => {
      if (activePlatforms.has(platform)) {
        setTimeout(() => window.open(url, "_blank", "noopener"), count * 300);
        count++;
      }
    });
    toast.success(`Membuka ${count} tab marketplace...`);
  }

  function openSingle(url: string) {
    window.open(url, "_blank", "noopener");
  }

  async function saveSource() {
    if (!newSource.name.trim() || !newSource.url.trim()) {
      toast.error("Nama dan URL wajib diisi"); return;
    }
    try {
      const r = await fetch("/api/admin/stock-finder/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSource,
          priceMin: newSource.priceMin ? Number(newSource.priceMin) : null,
          priceMax: newSource.priceMax ? Number(newSource.priceMax) : null,
          minOrder: newSource.minOrder ? Number(newSource.minOrder) : null,
          quality:  Number(newSource.quality),
        }),
      });
      if (!r.ok) throw new Error();
      toast.success("Supplier disimpan!");
      setShowAddForm(false);
      setNewSource({ name: "", platform: "shopee", url: "", category: "hoodie", priceMin: "", priceMax: "", minOrder: "", quality: "3", notes: "" });
      fetchSources();
    } catch { toast.error("Gagal menyimpan supplier"); }
  }

  async function deleteSource(id: string) {
    if (!confirm("Hapus supplier ini?")) return;
    try {
      await fetch(`/api/admin/stock-finder/sources/${id}`, { method: "DELETE" });
      setSources(prev => prev.filter(s => s.id !== id));
      toast.success("Dihapus");
    } catch { toast.error("Gagal menghapus"); }
  }

  async function toggleQuality(id: string, quality: number) {
    try {
      await fetch(`/api/admin/stock-finder/sources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quality }),
      });
      setSources(prev => prev.map(s => s.id === id ? { ...s, quality } : s));
    } catch {}
  }

  async function doProductSearch() {
    if (!pQuery.trim()) { toast.error("Masukkan nama produk"); return; }
    setPSearching(true);
    setPResult(null);
    try {
      const params = new URLSearchParams({ q: pQuery.trim() });
      if (pPriceMin) params.set("priceMin", pPriceMin);
      if (pPriceMax) params.set("priceMax", pPriceMax);
      params.set("platforms", [...pPlatforms].join(","));

      const r = await fetch(`/api/admin/stock-finder/products?${params}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPResult(d.data);
      fetchProductHistory();
    } catch (e: any) {
      toast.error(e.message ?? "Gagal mencari produk");
    } finally {
      setPSearching(false);
    }
  }

  function sortedProducts(products: ProductResult[]) {
    return [...products].sort((a, b) => {
      if (pSortBy === "rating")  return (b.rating ?? 0) - (a.rating ?? 0);
      if (pSortBy === "sold") {
        const numA = parseInt(a.sold ?? "0");
        const numB = parseInt(b.sold ?? "0");
        return numB - numA;
      }
      return a.price - b.price; // default: harga termurah dulu
    });
  }

  // ─── Bookmarks (#2) + Price tracking (#3) ───────────────────────────────────
  async function fetchBookmarks() {
    setLoadingBookmarks(true);
    try {
      const r = await fetch("/api/admin/stock-finder/bookmarks");
      const d = await r.json();
      setBookmarks(d.data ?? []);
    } catch {} finally {
      setLoadingBookmarks(false);
    }
  }

  async function fetchProductHistory() {
    try {
      const r = await fetch("/api/admin/stock-finder/product-history");
      const d = await r.json();
      setProductHistory(d.data ?? []);
    } catch {}
  }

  const bookmarkedIds = new Set(bookmarks.map(b => b.platformId));

  async function saveBookmark(p: ProductResult) {
    if (bookmarkedIds.has(p.id)) { toast("Produk ini sudah dibookmark", { icon: "🔖" }); return; }
    setSavingBookmarkId(p.id);
    try {
      const r = await fetch("/api/admin/stock-finder/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id, name: p.name, price: p.price, image: p.image,
          url: p.url, platform: p.platform, shop: p.shop,
          location: p.location, rating: p.rating, sold: p.sold,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setBookmarks(prev => [d.data, ...prev]);
      toast.success("Produk dibookmark — harga akan dipantau");
    } catch (e: any) {
      toast.error(e.message ?? "Gagal menyimpan bookmark");
    } finally {
      setSavingBookmarkId(null);
    }
  }

  async function deleteBookmark(id: string) {
    if (!confirm("Hapus bookmark ini?")) return;
    try {
      await fetch(`/api/admin/stock-finder/bookmarks/${id}`, { method: "DELETE" });
      setBookmarks(prev => prev.filter(b => b.id !== id));
      toast.success("Bookmark dihapus");
    } catch { toast.error("Gagal menghapus"); }
  }

  async function checkBookmarkPrice(id: string) {
    setCheckingId(id);
    try {
      const r = await fetch(`/api/admin/stock-finder/bookmarks/${id}`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setBookmarks(prev => prev.map(b => b.id === id ? d.data : b));
      const { change, changePct } = d.meta;
      if (change === 0)      toast("Harga tidak berubah", { icon: "➖" });
      else if (change > 0)   toast.error(`Harga NAIK ${changePct}% (+${formatPrice(change)})`);
      else                   toast.success(`Harga TURUN ${Math.abs(changePct)}% (${formatPrice(change)})`);
    } catch (e: any) {
      toast.error(e.message ?? "Gagal cek harga");
    } finally {
      setCheckingId(null);
    }
  }

  // ─── Add to store (#7) — prefill new-product form via sessionStorage ─────────
  function addToStore(p: { name: string; price: number; image: string | null }) {
    try {
      sessionStorage.setItem("stockfinder_prefill", JSON.stringify({
        name:  p.name,
        cost:  p.price,
        image: p.image ?? "",
      }));
      toast.success("Membuka form produk baru...");
      router.push("/admin/products/new?from=stockfinder");
    } catch {
      toast.error("Gagal membuka form produk");
    }
  }

  const filteredSources = filterCat === "all" ? sources : sources.filter(s => s.category === filterCat);
  const catEmoji = (c: string) => CATEGORIES.find(x => x.value === c)?.emoji ?? "📦";

  // Bookmarks with detected price changes (for tab badge)
  const bookmarksWithChange = bookmarks.filter(b => b.lastPrice !== b.price).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-5 h-px bg-white/30" />
          <span className="text-[9px] uppercase tracking-[0.5em] text-white/28">Admin · Sourcing Tool</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display tracking-widest uppercase text-white flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-amber-400" /> Stock Finder
            </h1>
            <p className="text-xs text-brand-gray-500 mt-1">
              Cari stok grosir dari Shopee, Tokopedia, Lazada, Facebook & TikTok Shop dengan AI
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {sources.length} supplier tersimpan
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-gray-700">
        {[
          { key: "search",    label: "🔍 Cari Stok Grosir",  count: null },
          { key: "products",  label: "🛒 Cari Produk Nyata",  count: pResult?.count ?? null },
          { key: "bookmarks", label: "🔖 Produk Disimpan",    count: bookmarks.length },
          { key: "sources",   label: "📋 Supplier",           count: sources.length },
          { key: "history",   label: "🕐 Histori",            count: history.length + productHistory.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-white text-white"
                : "border-transparent text-brand-gray-500 hover:text-white"
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="bg-brand-gray-700 text-brand-gray-300 text-[10px] px-1.5 py-0.5 rounded-sm">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Search ────────────────────────────────────────────────────────── */}
      {activeTab === "search" && (
        <div className="space-y-6">
          {/* Search form */}
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-500" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doSearch()}
                  placeholder="Contoh: hoodie oversize fleece tebal, kaos polos streetwear..."
                  className="input-field pl-10 w-full text-sm"
                />
              </div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="bg-brand-gray-800 border border-brand-gray-600 text-sm text-white px-3 py-2 focus:outline-none focus:border-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>

            {/* Price filter */}
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-2 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3" /> Filter Harga Grosir (Rp):
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-gray-500">Min</span>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    placeholder="Contoh: 30000"
                    className="input-field pl-10 w-full text-sm"
                    min={0}
                  />
                </div>
                <span className="text-brand-gray-600 text-sm flex-shrink-0">–</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-gray-500">Max</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    placeholder="Contoh: 120000"
                    className="input-field pl-10 w-full text-sm"
                    min={0}
                  />
                </div>
                {(priceMin || priceMax) && (
                  <button
                    onClick={() => { setPriceMin(""); setPriceMax(""); }}
                    className="p-2 text-brand-gray-500 hover:text-white transition-colors flex-shrink-0"
                    title="Reset filter harga"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {(priceMin || priceMax) && (
                <p className="text-[10px] text-amber-400/80 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Filter harga akan diterapkan ke URL Shopee, Tokopedia, Lazada &amp; Blibli
                </p>
              )}
            </div>

            {/* Platform filter */}
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-2">Cari di Platform:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setActivePlatforms(prev => {
                      const next = new Set(prev);
                      next.has(key) ? next.delete(key) : next.add(key);
                      return next;
                    })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-sm transition-all ${
                      activePlatforms.has(key)
                        ? cfg.color
                        : "border-brand-gray-700 text-brand-gray-600"
                    }`}
                  >
                    <span>{cfg.icon}</span> {cfg.label}
                    {activePlatforms.has(key) && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={doSearch}
              disabled={searching || !query.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {searching
                ? <><Loader2 className="w-4 h-4 animate-spin" /> AI sedang mencari...</>
                : <><Sparkles className="w-4 h-4 text-amber-400" /> Cari Stok Grosir</>}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="bg-amber-900/20 border border-amber-700/40 px-5 py-4 flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Estimasi Harga Grosir</p>
                  <p className="text-xl font-bold text-white">
                    {formatPrice(result.estimate.min)} – {formatPrice(result.estimate.max)}
                    <span className="text-sm text-brand-gray-400 ml-2 font-normal">{result.estimate.unit}</span>
                  </p>
                </div>
                <div className="flex-1" />
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs text-amber-300/70">
                    {result.keywords.length} variasi kata kunci · {activePlatforms.size} platform aktif
                  </div>
                  {(result.priceMin || result.priceMax) && (
                    <div className="text-[10px] text-amber-400 flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3" />
                      Filter: {result.priceMin ? formatPrice(result.priceMin) : "?"} – {result.priceMax ? formatPrice(result.priceMax) : "?"}
                    </div>
                  )}
                </div>
              </div>

              {/* Related products from our store */}
              {result.relatedProducts && result.relatedProducts.length > 0 && (
                <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Produk di Tokomu yang Terkait
                    <span className="text-brand-gray-600 font-normal normal-case tracking-normal">— perlu restock?</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {result.relatedProducts.map(p => (
                      <a
                        key={p.id}
                        href={`/admin/products`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col bg-brand-gray-800 border border-brand-gray-700 hover:border-brand-gray-500 transition-colors overflow-hidden"
                      >
                        {/* Image */}
                        <div className="relative w-full aspect-square bg-brand-gray-700 overflow-hidden">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <ImageOff className="w-6 h-6 text-brand-gray-600" />
                            </div>
                          )}
                          {/* Stock badge */}
                          <div className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                            p.totalStock === 0
                              ? "bg-red-900/90 text-red-300"
                              : p.totalStock <= 5
                              ? "bg-amber-900/90 text-amber-300"
                              : "bg-green-900/90 text-green-300"
                          }`}>
                            {p.totalStock === 0 ? "Habis" : `${p.totalStock} pcs`}
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-2 flex-1 flex flex-col gap-0.5">
                          <p className="text-[10px] font-medium leading-tight line-clamp-2 text-white/80 group-hover:text-white transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-green-400 font-bold mt-auto">
                            {formatPrice(p.price)}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                  {result.relatedProducts.some(p => p.totalStock === 0) && (
                    <p className="text-[10px] text-red-400/70 mt-3 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" />
                      Ada produk yang stoknya habis — prioritaskan restock item tersebut
                    </p>
                  )}
                </div>
              )}

              {/* AI Notes */}
              {result.aiNotes && (
                <div className="bg-blue-950/30 border border-blue-700/40 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Insight dari AI
                  </p>
                  <p className="text-sm text-blue-100/80 leading-relaxed whitespace-pre-line">{result.aiNotes}</p>
                </div>
              )}

              {/* Keywords + marketplace links */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-500">
                  Kata Kunci & Link Marketplace
                </p>
                {result.results.map((r, i) => (
                  <div key={i} className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
                    {/* Keyword header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-brand-gray-800/50 transition-colors"
                      onClick={() => setExpandedKw(expandedKw === r.keyword ? null : r.keyword)}
                    >
                      <Search className="w-4 h-4 text-brand-gray-500 flex-shrink-0" />
                      <span className="flex-1 text-sm font-medium">{r.keyword}</span>
                      <button
                        onClick={e => { e.stopPropagation(); openAll(r.keyword); }}
                        className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 border border-amber-700/50 text-amber-400 hover:bg-amber-900/20 transition-colors flex-shrink-0"
                      >
                        <Globe className="w-3 h-3" /> Buka Semua
                      </button>
                      {expandedKw === r.keyword
                        ? <ChevronUp className="w-4 h-4 text-brand-gray-500" />
                        : <ChevronDown className="w-4 h-4 text-brand-gray-500" />}
                    </div>

                    {/* Platform links */}
                    {expandedKw === r.keyword && (
                      <div className="border-t border-brand-gray-800 px-4 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(r.links).map(([platform, url]) => {
                            const cfg = PLATFORM_CONFIG[platform];
                            if (!cfg || !activePlatforms.has(platform)) return null;
                            return (
                              <button
                                key={platform}
                                onClick={() => openSingle(url)}
                                className={`flex items-center gap-2 px-3 py-2 border text-xs font-medium transition-all hover:opacity-80 ${cfg.color}`}
                              >
                                <span>{cfg.icon}</span>
                                <span className="flex-1 text-left">{cfg.label}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </button>
                            );
                          })}
                        </div>

                        {/* Save as source shortcut */}
                        <button
                          onClick={() => {
                            setNewSource(prev => ({
                              ...prev,
                              name: r.keyword,
                              category,
                              url: Object.values(r.links)[0] ?? "",
                            }));
                            setShowAddForm(true);
                            setActiveTab("sources");
                          }}
                          className="mt-3 flex items-center gap-1.5 text-[10px] text-brand-gray-400 hover:text-white transition-colors"
                        >
                          <BookmarkPlus className="w-3 h-3" /> Simpan sebagai supplier
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> Tips Nego Harga Grosir
                </p>
                <ul className="space-y-2 text-xs text-brand-gray-400">
                  {[
                    "Tanyakan harga per kodi (12 pcs) — biasanya lebih murah 20-30% dari harga ecer",
                    "Minta sampel dulu sebelum order besar — jangan percaya foto saja",
                    "Cek rating toko minimal 4.5★ dan lihat ulasan foto pembeli",
                    "Bandingkan minimal 5 supplier sebelum memutuskan",
                    "Tanya apakah bisa custom label/tag untuk brand kamu",
                    "Nego via chat, jangan di kolom komentar produk",
                    "Waktu terbaik order: akhir bulan (supplier perlu cash flow)",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 flex-shrink-0">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!result && !searching && (
            <div className="text-center py-16 text-brand-gray-600">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-400/30" />
              <p className="text-sm">Masukkan kata kunci dan klik "Cari Stok Grosir"</p>
              <p className="text-xs mt-1">AI akan generate variasi keyword optimal untuk tiap marketplace</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Cari Produk Nyata ────────────────────────────────────────────── */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Search form */}
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white mb-1">Cari Produk Spesifik</p>
              <p className="text-[11px] text-brand-gray-500">
                Masukkan nama produk yang kamu mau — sistem akan mencari langsung di Shopee &amp; Tokopedia dan menampilkan foto, harga, serta link produknya.
              </p>
            </div>

            {/* Query */}
            <div className="relative">
              <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-500" />
              <input
                value={pQuery}
                onChange={e => setPQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doProductSearch()}
                placeholder="Contoh: rucas ultra stitch, kaos polos boxy, hoodie oversize fleece..."
                className="input-field pl-10 w-full text-sm"
              />
            </div>

            {/* Price filter */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-2 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3" /> Filter Harga (Rp):
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-brand-gray-500">Min</span>
                  <input type="number" value={pPriceMin} onChange={e => setPPriceMin(e.target.value)}
                    placeholder="700000" className="input-field pl-10 w-full text-sm" min={0} />
                </div>
                <span className="text-brand-gray-600 flex-shrink-0">–</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-brand-gray-500">Max</span>
                  <input type="number" value={pPriceMax} onChange={e => setPPriceMax(e.target.value)}
                    placeholder="1000000" className="input-field pl-10 w-full text-sm" min={0} />
                </div>
                {(pPriceMin || pPriceMax) && (
                  <button onClick={() => { setPPriceMin(""); setPPriceMax(""); }}
                    className="p-2 text-brand-gray-500 hover:text-white transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Platform selector */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-2">Cari di:</p>
              <div className="flex gap-2">
                {(["shopee", "tokopedia"] as const).map(key => {
                  const cfg = PLATFORM_CONFIG[key];
                  const active = pPlatforms.has(key);
                  return (
                    <button key={key}
                      onClick={() => setPPlatforms(prev => {
                        const next = new Set(prev);
                        next.has(key) ? next.delete(key) : next.add(key);
                        return next;
                      })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-sm transition-all ${
                        active ? cfg.color : "border-brand-gray-700 text-brand-gray-600"
                      }`}>
                      <span>{cfg.icon}</span> {cfg.label}
                      {active && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={doProductSearch} disabled={pSearching || !pQuery.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {pSearching
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Mencari produk...</>
                : <><Search className="w-4 h-4" /> Cari Produk</>}
            </button>
          </div>

          {/* Results */}
          {pResult && (
            <div className="space-y-4">
              {/* Summary + sort */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {pResult.count} produk ditemukan
                    <span className="text-brand-gray-500 font-normal ml-2 text-xs">
                      untuk &quot;{pResult.query}&quot;
                      {(pResult.priceMin || pResult.priceMax) && (
                        <> · {pResult.priceMin ? formatPrice(pResult.priceMin) : "?"} – {pResult.priceMax ? formatPrice(pResult.priceMax) : "?"}</>
                      )}
                    </span>
                  </p>
                  {/* Platform status */}
                  <div className="flex items-center gap-3 mt-1">
                    {Object.entries(pResult.platformStatus).map(([plt, st]) => (
                      <span key={plt} className={`text-[10px] flex items-center gap-1 ${st.error ? "text-red-400" : "text-brand-gray-500"}`}>
                        {PLATFORM_CONFIG[plt]?.icon} {st.error ? `Gagal (${st.error})` : `${st.count} hasil`}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-brand-gray-500 uppercase tracking-wider">Urutkan:</span>
                  {([
                    { v: "price",  l: "Harga Termurah" },
                    { v: "rating", l: "Rating Tertinggi" },
                    { v: "sold",   l: "Terlaris" },
                  ] as const).map(opt => (
                    <button key={opt.v} onClick={() => setPSortBy(opt.v)}
                      className={`text-[10px] px-2.5 py-1 border transition-colors ${
                        pSortBy === opt.v
                          ? "border-white text-white bg-white/10"
                          : "border-brand-gray-700 text-brand-gray-500 hover:text-white"
                      }`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* API errors notice */}
              {pResult.errors && pResult.errors.length > 0 && (
                <div className="bg-red-950/30 border border-red-700/40 px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-400">Beberapa platform tidak dapat dijangkau</p>
                    <p className="text-[11px] text-red-300/70 mt-0.5">
                      {pResult.errors.join(" · ")}
                    </p>
                  </div>
                </div>
              )}

              {pResult.count === 0 ? (
                <div className="text-center py-16 text-brand-gray-600">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Tidak ada produk ditemukan</p>
                  <p className="text-xs mt-1">Coba kata kunci lain atau perlebar rentang harga</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sortedProducts(pResult.products).map(p => {
                    const platCfg = PLATFORM_CONFIG[p.platform];
                    const discount = p.priceOriginal
                      ? Math.round((1 - p.price / p.priceOriginal) * 100)
                      : null;
                    const isBookmarked = bookmarkedIds.has(p.id);
                    const marginOpen   = marginOpenId === p.id;
                    const sellVal      = Number(marginSell[p.id] ?? "");
                    const profit       = sellVal > 0 ? sellVal - p.price : 0;
                    const marginPct    = sellVal > 0 ? Math.round((profit / sellVal) * 100) : 0;
                    const markupPct    = p.price > 0 && sellVal > 0 ? Math.round((profit / p.price) * 100) : 0;
                    return (
                      <div
                        key={p.id}
                        className="group flex flex-col bg-brand-gray-900 border border-brand-gray-700 hover:border-brand-gray-400 transition-all duration-200 overflow-hidden"
                      >
                        {/* Image (clickable → opens product) */}
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative w-full aspect-square bg-brand-gray-800 overflow-hidden flex-shrink-0 block"
                        >
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              unoptimized
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <ImageOff className="w-8 h-8 text-brand-gray-600" />
                            </div>
                          )}
                          {/* Platform badge */}
                          <div className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 border ${platCfg.color}`}>
                            {platCfg.icon}
                          </div>
                          {/* Discount badge */}
                          {discount && (
                            <div className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5">
                              -{discount}%
                            </div>
                          )}
                          {/* Open link overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold px-2 py-1 flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> Lihat
                            </div>
                          </div>
                        </a>

                        {/* Info */}
                        <div className="p-2.5 flex flex-col gap-1 flex-1">
                          <a href={p.url} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] leading-tight line-clamp-2 text-white/80 hover:text-white transition-colors">
                            {p.name}
                          </a>

                          {/* Price */}
                          <div className="mt-auto pt-1">
                            <p className="text-sm font-bold text-white">{p.priceFormatted}</p>
                            {p.priceOriginal && (
                              <p className="text-[10px] text-brand-gray-500 line-through">
                                {formatPrice(p.priceOriginal)}
                              </p>
                            )}
                          </div>

                          {/* Rating + Sold */}
                          {(p.rating || p.sold) && (
                            <div className="flex items-center gap-2 text-[10px] text-brand-gray-500">
                              {p.rating && (
                                <span className="flex items-center gap-0.5 text-amber-400">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  {p.rating.toFixed(1)}
                                </span>
                              )}
                              {p.sold && <span>{p.sold}</span>}
                            </div>
                          )}

                          {/* Shop + Location */}
                          {(p.shop || p.location) && (
                            <div className="text-[10px] text-brand-gray-600 truncate">
                              {p.shop && <span className="flex items-center gap-0.5"><Store className="w-2.5 h-2.5 inline" /> {p.shop}</span>}
                              {p.location && <span className="flex items-center gap-0.5 mt-0.5"><MapPin className="w-2.5 h-2.5 inline" /> {p.location}</span>}
                            </div>
                          )}

                          {/* ── Margin calculator (#1) ── */}
                          {marginOpen && (
                            <div className="mt-2 pt-2 border-t border-brand-gray-700 space-y-1.5">
                              <p className="text-[9px] uppercase tracking-wider text-brand-gray-500 flex items-center gap-1">
                                <Calculator className="w-3 h-3" /> Hitung Margin
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-brand-gray-400">
                                <span>Modal</span>
                                <span className="font-bold text-white">{p.priceFormatted}</span>
                              </div>
                              <div>
                                <label className="text-[9px] text-brand-gray-500">Harga jual rencanamu</label>
                                <input
                                  type="number"
                                  value={marginSell[p.id] ?? ""}
                                  onChange={e => setMarginSell(prev => ({ ...prev, [p.id]: e.target.value }))}
                                  placeholder="Contoh: 250000"
                                  className="input-field text-xs w-full mt-0.5 py-1"
                                  min={0}
                                />
                              </div>
                              {sellVal > 0 && (
                                <div className={`text-[10px] space-y-0.5 p-1.5 ${profit >= 0 ? "bg-green-950/40" : "bg-red-950/40"}`}>
                                  <div className="flex justify-between">
                                    <span className="text-brand-gray-400">Profit/pcs</span>
                                    <span className={`font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                                      {formatPrice(profit)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-brand-gray-400">Margin</span>
                                    <span className={`font-bold ${marginPct >= 0 ? "text-green-400" : "text-red-400"}`}>{marginPct}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-brand-gray-400">Markup</span>
                                    <span className="text-brand-gray-300">{markupPct}%</span>
                                  </div>
                                  <div className="flex justify-between pt-0.5 border-t border-white/10">
                                    <span className="text-brand-gray-400">Profit 12 pcs</span>
                                    <span className={`font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                                      {formatPrice(profit * 12)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Action buttons ── */}
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-brand-gray-800">
                            <button
                              onClick={() => saveBookmark(p)}
                              disabled={isBookmarked || savingBookmarkId === p.id}
                              title={isBookmarked ? "Sudah dibookmark" : "Bookmark & pantau harga"}
                              className={`p-1.5 border transition-colors ${
                                isBookmarked
                                  ? "border-amber-700/50 text-amber-400 bg-amber-900/20"
                                  : "border-brand-gray-700 text-brand-gray-400 hover:text-white hover:border-brand-gray-500"
                              }`}
                            >
                              {savingBookmarkId === p.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : isBookmarked ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => setMarginOpenId(marginOpen ? null : p.id)}
                              title="Hitung margin"
                              className={`p-1.5 border transition-colors ${
                                marginOpen
                                  ? "border-white text-white bg-white/10"
                                  : "border-brand-gray-700 text-brand-gray-400 hover:text-white hover:border-brand-gray-500"
                              }`}
                            >
                              <Calculator className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => addToStore(p)}
                              title="Tambah ke toko"
                              className="flex-1 p-1.5 border border-brand-gray-700 text-brand-gray-400 hover:text-white hover:border-brand-gray-500 transition-colors flex items-center justify-center gap-1 text-[10px] font-bold"
                            >
                              <PackagePlus className="w-3 h-3" /> Ke Toko
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!pResult && !pSearching && (
            <div className="text-center py-16 text-brand-gray-600">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Cari produk spesifik dari Shopee &amp; Tokopedia</p>
              <p className="text-xs mt-1">Contoh: &quot;rucas ultra stitch&quot;, &quot;rucas tailor&quot;, &quot;visvim&quot;</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Bookmarked Products (#2 + #3) ─────────────────────────────────── */}
      {activeTab === "bookmarks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" /> Produk Disimpan
              </p>
              <p className="text-[11px] text-brand-gray-500 mt-0.5">
                Produk dari marketplace yang kamu pantau harganya. Klik "Cek Harga" untuk update harga terbaru.
              </p>
            </div>
            {bookmarksWithChange > 0 && (
              <span className="text-[10px] text-amber-400 flex items-center gap-1 border border-amber-700/40 bg-amber-900/20 px-2 py-1">
                <AlertCircle className="w-3 h-3" /> {bookmarksWithChange} produk berubah harga
              </span>
            )}
          </div>

          {loadingBookmarks ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand-gray-500" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-16 text-brand-gray-600">
              <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Belum ada produk disimpan</p>
              <p className="text-xs mt-1">Cari produk di tab "Cari Produk Nyata" lalu klik ikon bookmark</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map(b => {
                const platCfg = PLATFORM_CONFIG[b.platform] ?? { label: b.platform, color: "text-white border-brand-gray-700", icon: "🔗" };
                const change    = b.lastPrice - b.price;
                const changePct = b.price > 0 ? Math.round((change / b.price) * 100) : 0;
                const history: { price: number; checkedAt: string }[] = (() => {
                  try { return JSON.parse(b.priceHistory); } catch { return []; }
                })();
                const prices  = history.map(h => h.price);
                const lowest  = prices.length ? Math.min(...prices) : b.lastPrice;
                const highest = prices.length ? Math.max(...prices) : b.lastPrice;
                return (
                  <div key={b.id} className="bg-brand-gray-900 border border-brand-gray-700 p-3 flex gap-3">
                    {/* Image */}
                    <a href={b.url} target="_blank" rel="noopener noreferrer"
                      className="relative w-20 h-20 bg-brand-gray-800 flex-shrink-0 overflow-hidden">
                      {b.image ? (
                        <Image src={b.image} alt={b.name} fill className="object-cover" sizes="80px" unoptimized />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full"><ImageOff className="w-6 h-6 text-brand-gray-600" /></div>
                      )}
                      <div className={`absolute bottom-0 left-0 text-[8px] font-bold px-1 ${platCfg.color}`}>{platCfg.icon}</div>
                    </a>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <a href={b.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium line-clamp-2 text-white/90 hover:text-white">{b.name}</a>

                      {/* Current price + change */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-white">{formatPrice(b.lastPrice)}</span>
                        {change !== 0 && (
                          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${change > 0 ? "text-red-400" : "text-green-400"}`}>
                            {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {change > 0 ? "+" : ""}{changePct}%
                          </span>
                        )}
                      </div>

                      {/* Price range since tracking */}
                      {prices.length > 1 && (
                        <p className="text-[10px] text-brand-gray-500 mt-0.5">
                          Terendah {formatPrice(lowest)} · Tertinggi {formatPrice(highest)} · {prices.length}× dicek
                        </p>
                      )}
                      <p className="text-[10px] text-brand-gray-600 mt-0.5">
                        Disimpan {timeAgo(b.createdAt)}{b.shop ? ` · ${b.shop}` : ""}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          onClick={() => checkBookmarkPrice(b.id)}
                          disabled={checkingId === b.id}
                          className="text-[10px] flex items-center gap-1 px-2 py-1 border border-brand-gray-700 text-brand-gray-300 hover:text-white hover:border-brand-gray-500 transition-colors disabled:opacity-50"
                        >
                          {checkingId === b.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <RefreshCw className="w-3 h-3" />}
                          Cek Harga
                        </button>
                        <button
                          onClick={() => addToStore({ name: b.name, price: b.lastPrice, image: b.image })}
                          className="text-[10px] flex items-center gap-1 px-2 py-1 border border-brand-gray-700 text-brand-gray-300 hover:text-white hover:border-brand-gray-500 transition-colors"
                        >
                          <PackagePlus className="w-3 h-3" /> Ke Toko
                        </button>
                        <button
                          onClick={() => deleteBookmark(b.id)}
                          className="text-[10px] p-1 text-brand-gray-600 hover:text-red-400 transition-colors ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Saved Sources ────────────────────────────────────────────────── */}
      {activeTab === "sources" && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-gray-500" />
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                className="bg-brand-gray-800 border border-brand-gray-600 text-xs text-white px-2 py-1.5 focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Supplier
            </button>
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="bg-brand-gray-900 border border-white/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest">Tambah Supplier Baru</p>
                <button onClick={() => setShowAddForm(false)}><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Nama Toko / Supplier *</label>
                  <input value={newSource.name} onChange={e => setNewSource(p => ({ ...p, name: e.target.value }))}
                    className="input-field text-sm" placeholder="Toko Grosir Hoodie Bandung" />
                </div>
                <div>
                  <label className="input-label">Platform *</label>
                  <select value={newSource.platform} onChange={e => setNewSource(p => ({ ...p, platform: e.target.value }))}
                    className="input-field text-sm">
                    {Object.entries(PLATFORM_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                    <option value="offline">🏪 Offline</option>
                    <option value="other">🔗 Lainnya</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="input-label">URL / Link Toko *</label>
                  <input value={newSource.url} onChange={e => setNewSource(p => ({ ...p, url: e.target.value }))}
                    className="input-field text-sm" placeholder="https://shopee.co.id/namatoko" />
                </div>
                <div>
                  <label className="input-label">Kategori</label>
                  <select value={newSource.category} onChange={e => setNewSource(p => ({ ...p, category: e.target.value }))}
                    className="input-field text-sm">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Rating Kualitas</label>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button"
                        onClick={() => setNewSource(p => ({ ...p, quality: String(n) }))}
                        className={`w-8 h-8 text-lg ${Number(newSource.quality) >= n ? "text-amber-400" : "text-brand-gray-700"}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="input-label">Harga Min (Rp)</label>
                  <input type="number" value={newSource.priceMin} onChange={e => setNewSource(p => ({ ...p, priceMin: e.target.value }))}
                    className="input-field text-sm" placeholder="45000" />
                </div>
                <div>
                  <label className="input-label">Harga Max (Rp)</label>
                  <input type="number" value={newSource.priceMax} onChange={e => setNewSource(p => ({ ...p, priceMax: e.target.value }))}
                    className="input-field text-sm" placeholder="120000" />
                </div>
                <div>
                  <label className="input-label">Min. Order (pcs)</label>
                  <input type="number" value={newSource.minOrder} onChange={e => setNewSource(p => ({ ...p, minOrder: e.target.value }))}
                    className="input-field text-sm" placeholder="12" />
                </div>
                <div className="sm:col-span-2">
                  <label className="input-label">Catatan</label>
                  <textarea value={newSource.notes} onChange={e => setNewSource(p => ({ ...p, notes: e.target.value }))}
                    className="input-field text-sm resize-none h-16" placeholder="Kualitas bagus, fast response, bisa custom label..." />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveSource} className="btn-primary flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Simpan Supplier
                </button>
                <button onClick={() => setShowAddForm(false)} className="btn-secondary text-sm">Batal</button>
              </div>
            </div>
          )}

          {/* Sources list */}
          {loadingSources ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand-gray-500" />
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="text-center py-16 text-brand-gray-600">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada supplier tersimpan</p>
              <p className="text-xs mt-1">Cari stok di tab "Cari Stok" lalu simpan supplier terbaik</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSources.map(s => {
                const platCfg = PLATFORM_CONFIG[s.platform] ?? { label: s.platform, color: "text-white border-brand-gray-700 bg-transparent", icon: "🔗" };
                return (
                  <div key={s.id} className={`bg-brand-gray-900 border p-4 space-y-3 ${s.isActive ? "border-brand-gray-700" : "border-brand-gray-800 opacity-60"}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${platCfg.color}`}>
                            {platCfg.icon} {platCfg.label}
                          </span>
                          <span className="text-[10px] text-brand-gray-500">{catEmoji(s.category)} {s.category}</span>
                        </div>
                        <p className="font-semibold mt-1 truncate">{s.name}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-brand-gray-400 hover:text-white transition-colors border border-brand-gray-700 hover:border-white">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button onClick={() => deleteSource(s.id)}
                          className="p-1.5 text-brand-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => toggleQuality(s.id, n)}
                          className={`text-base transition-colors ${s.quality >= n ? "text-amber-400" : "text-brand-gray-700 hover:text-amber-700"}`}>
                          ★
                        </button>
                      ))}
                      <span className="text-xs text-brand-gray-500 ml-1">({s.quality}/5)</span>
                    </div>

                    {/* Price + MOQ */}
                    {(s.priceMin || s.priceMax || s.minOrder) && (
                      <div className="flex gap-4 text-xs">
                        {(s.priceMin || s.priceMax) && (
                          <div>
                            <span className="text-brand-gray-500">Harga</span>
                            <p className="font-bold text-green-400">
                              {s.priceMin ? formatPrice(s.priceMin) : "?"} – {s.priceMax ? formatPrice(s.priceMax) : "?"}
                            </p>
                          </div>
                        )}
                        {s.minOrder && (
                          <div>
                            <span className="text-brand-gray-500">Min. Order</span>
                            <p className="font-bold">{s.minOrder} pcs</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {s.notes && <p className="text-xs text-brand-gray-400 line-clamp-2">{s.notes}</p>}

                    {/* Last checked */}
                    {s.lastChecked && (
                      <p className="text-[10px] text-brand-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Dicek {timeAgo(s.lastChecked)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: History ──────────────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {history.length === 0 && productHistory.length === 0 && (
            <div className="text-center py-16 text-brand-gray-600">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada histori pencarian</p>
            </div>
          )}

          {/* Product search history (#6) */}
          {productHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-500 flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5" /> Pencarian Produk Nyata
              </p>
              {productHistory.map(h => (
                <div key={h.id}
                  className="bg-brand-gray-900 border border-brand-gray-700 p-3 flex items-center gap-3 cursor-pointer hover:border-brand-gray-500 transition-colors"
                  onClick={() => {
                    setPQuery(h.query);
                    setPPriceMin(h.priceMin ? String(h.priceMin) : "");
                    setPPriceMax(h.priceMax ? String(h.priceMax) : "");
                    setPPlatforms(new Set(h.platforms.split(",")));
                    setActiveTab("products");
                  }}>
                  <ShoppingCart className="w-4 h-4 text-brand-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{h.query}</p>
                    <p className="text-[10px] text-brand-gray-500">
                      {h.count} hasil
                      {(h.priceMin || h.priceMax) && (
                        <> · {h.priceMin ? formatPrice(h.priceMin) : "?"} – {h.priceMax ? formatPrice(h.priceMax) : "?"}</>
                      )}
                      {" · "}{timeAgo(h.createdAt)}
                    </p>
                  </div>
                  <Search className="w-4 h-4 text-brand-gray-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Grosir keyword search history */}
          {history.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-500 flex items-center gap-2">
                <Search className="w-3.5 h-3.5" /> Pencarian Stok Grosir
              </p>
              {history.map(h => (
                <div key={h.id}
                  className="bg-brand-gray-900 border border-brand-gray-700 p-3 flex items-center gap-3 cursor-pointer hover:border-brand-gray-500 transition-colors"
                  onClick={() => { setQuery(h.query); setCategory(h.category); setActiveTab("search"); }}>
                  <Clock className="w-4 h-4 text-brand-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{h.query}</p>
                    <p className="text-[10px] text-brand-gray-500">
                      {catEmoji(h.category)} {h.category} · {timeAgo(h.createdAt)}
                    </p>
                  </div>
                  <Search className="w-4 h-4 text-brand-gray-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
