"use client";

import { Heart, ShoppingBag, ArrowLeft, Share2, Copy, Check, X } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import { useWishlistStore, useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { items: wishlistIds } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingAll, setAddingAll] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateShareLink() {
    setShareLoading(true);
    try {
      const r = await fetch("/api/wishlist/share", { method: "POST" });
      const d = await r.json();
      setShareToken(d.token);
    } finally { setShareLoading(false); }
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/wishlist/shared/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function deleteShareLink() {
    await fetch("/api/wishlist/share", { method: "DELETE" });
    setShareToken(null);
  }

  async function addAllToCart() {
    if (products.length === 0) return;
    setAddingAll(true);
    let added = 0;
    for (const product of products) {
      const variant = product.variants?.find((v) => v.stock > 0);
      if (variant) {
        addItem(product, variant, 1);
        added++;
      }
    }
    setAddingAll(false);
    if (added > 0) {
      toast.success(`${added} produk ditambahkan ke keranjang`);
    } else {
      toast.error("Semua produk sedang habis stok");
    }
  }

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const promises = wishlistIds.map((id) =>
          fetch(`/api/products/${id}`).then((r) => r.json())
        );
        const results = await Promise.all(promises);
        setProducts(results.filter((r) => r.success).map((r) => r.data));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="min-h-screen py-10">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <div className="animate-pulse bg-brand-gray-800 h-6 w-40 rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container-main">
        <Link href="/products" className="inline-flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Lanjut Belanja
        </Link>
        <div className="flex items-center justify-between mb-4">
          <h1 className="section-title">Wishlist ({wishlistIds.length})</h1>
          <div className="flex items-center gap-2">
            {products.length > 0 && (
              <button
                onClick={generateShareLink}
                disabled={shareLoading}
                className="flex items-center gap-2 text-xs border border-brand-gray-700 hover:border-white px-3 py-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                {shareLoading ? "..." : "Bagikan Wishlist"}
              </button>
            )}
            {products.length > 0 && (
              <button
                onClick={addAllToCart}
                disabled={addingAll}
                className="btn-secondary flex items-center gap-2 text-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {addingAll ? "Menambahkan..." : "Tambah Semua ke Keranjang"}
              </button>
            )}
          </div>
        </div>

        {shareToken && (
          <div className="mb-6 p-3 bg-brand-gray-900 border border-brand-gray-700 flex items-center gap-2">
            <input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/wishlist/shared/${shareToken}`} className="flex-1 text-xs bg-transparent text-brand-gray-400 outline-none truncate" />
            <button onClick={copyShareLink} className="text-xs font-bold text-white hover:text-brand-gray-300 flex items-center gap-1.5">
              {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Disalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
            </button>
            <button onClick={deleteShareLink} title="Hapus link" className="text-brand-gray-600 hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-brand-gray-700 mx-auto mb-4" />
            <p className="text-brand-gray-400 text-sm">Wishlist kamu kosong</p>
            <Link href="/products" className="btn-primary mt-4 inline-flex">
              Jelajahi Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
