"use client";

import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container-main">
        <div className="flex items-center justify-between mb-8">
          <h1 className="section-title">Wishlist ({wishlistIds.length})</h1>
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
