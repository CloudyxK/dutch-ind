"use client";
import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default function RecentlyViewed({ currentProductId }: { currentProductId?: string }) {
  const { items } = useRecentlyViewed();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const display = currentProductId
    ? items.filter((p) => p.id !== currentProductId)
    : items;

  if (display.length === 0) return null;

  return (
    <section className="py-12 border-t border-brand-gray-800">
      <div className="container-main">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-gray-400 mb-6">
          Baru Kamu Lihat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {display.slice(0, 8).map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="group block">
              <div className="relative aspect-square bg-brand-gray-800 overflow-hidden mb-2">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-gray-700" />
                )}
              </div>
              <p className="text-xs font-semibold truncate group-hover:text-brand-gray-300 transition-colors">
                {p.name}
              </p>
              <p className="text-xs text-brand-gray-400 mt-0.5">{formatPrice(p.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
