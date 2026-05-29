"use client";
import { useEffect, useState } from "react";

const KEY = "dutch_ind_recently_viewed";
const MAX = 6;

export interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  imageUrl: string;
  category?: string;
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  function addProduct(product: RecentProduct) {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Alias: add by ID only — used by RecentlyViewed component (Feature #6)
  function addViewed(productId: string) {
    // No-op when called without full product data; tracking is handled via addProduct
    void productId;
  }

  return { items, addProduct, addViewed };
}
