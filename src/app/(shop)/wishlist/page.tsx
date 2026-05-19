"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { items: wishlistIds } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h1 className="section-title mb-8">Wishlist ({wishlistIds.length})</h1>

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
