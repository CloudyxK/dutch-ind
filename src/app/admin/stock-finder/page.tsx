"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search, Sparkles, ExternalLink, Plus, Trash2, Star, RefreshCw,
  ShoppingBag, Package, Loader2, ChevronDown, ChevronUp, BookmarkPlus,
  TrendingDown, Clock, Globe, CheckCircle2, X, Filter, SlidersHorizontal,
  ImageOff, AlertCircle,
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

  // Sources state
  const [sources,        setSources]        = useState<Source[]>([]);
  const [history,        setHistory]        = useState<SearchHistory[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [filterCat,      setFilterCat]      = useState("all");
  const [activeTab,      setActiveTab]      = useState<"search" | "sources" | "history">("search");

  // Add source form
  const [newSource, setNewSource] = useState({
    name: "", platform: "shopee", url: "", category: "hoodie",
    priceMin: "", priceMax: "", minOrder: "", quality: "3", notes: "",
  });

  useEffect(() => {
    fetchSources();
    fetchHistory();
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

  const filteredSources = filterCat === "all" ? sources : sources.filter(s => s.category === filterCat);
  const catEmoji = (c: string) => CATEGORIES.find(x => x.value === c)?.emoji ?? "📦";

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
          { key: "search",  label: "🔍 Cari Stok", count: null },
          { key: "sources", label: "📋 Supplier Tersimpan", count: sources.length },
          { key: "history", label: "🕐 Histori Pencarian", count: history.length },
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
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-brand-gray-600">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada histori pencarian</p>
            </div>
          ) : (
            history.map(h => (
              <div key={h.id}
                className="bg-brand-gray-900 border border-brand-gray-700 p-4 flex items-center gap-4 cursor-pointer hover:border-brand-gray-500 transition-colors"
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
