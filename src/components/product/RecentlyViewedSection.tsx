"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useRecentlyViewed, type RecentProduct } from "@/hooks/useRecentlyViewed";

interface Props {
  currentProductId: string;
  current: RecentProduct; // the product being viewed right now — add it on mount
}

export default function RecentlyViewedSection({ currentProductId, current }: Props) {
  const { items, addProduct } = useRecentlyViewed();

  useEffect(() => {
    addProduct(current);
  }, [currentProductId]); // eslint-disable-line

  const others = items.filter((p) => p.id !== currentProductId);
  if (others.length === 0) return null;

  return (
    <section className="border-t border-brand-gray-800 mt-16 pt-10">
      <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-brand-gray-500 mb-6">
        Baru Kamu Lihat
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {others.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="flex-none w-32 group"
          >
            <div className="relative aspect-[3/4] bg-brand-gray-900 overflow-hidden mb-2">
              <Image src={p.imageUrl} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="128px" />
            </div>
            <p className="text-[10px] font-semibold truncate group-hover:text-brand-gray-300 transition-colors">{p.name}</p>
            <p className="text-[10px] text-brand-gray-500 mt-0.5">{formatPrice(p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
