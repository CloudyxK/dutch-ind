"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Package2 } from "lucide-react";

type BundleProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: { url: string; alt?: string | null }[];
};

type BundleItem = {
  id: string;
  product: BundleProduct;
};

type Bundle = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  discount: number;
  items: BundleItem[];
};

export default function BundleSection() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bundles")
      .then((r) => r.json())
      .then(({ data }) => setBundles(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || bundles.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container-main">
        {/* Section header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-px bg-white/30" />
            <span className="text-[9px] uppercase tracking-[0.5em] text-white/28">Paket Outfit</span>
          </div>
          <h2 className="section-title">Bundle Outfit</h2>
          <p className="mt-2 text-sm text-brand-gray-400">Kombinasi outfit pilihan dengan harga spesial.</p>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
          {bundles.map((bundle) => {
            const totalOriginal = bundle.items.reduce((s, item) => s + item.product.price, 0);
            const discountedTotal = totalOriginal * (1 - bundle.discount / 100);
            const thumbs = bundle.items.slice(0, 4);

            return (
              <div
                key={bundle.id}
                className="flex-shrink-0 w-72 sm:w-auto bg-brand-gray-900 border border-brand-gray-700 hover:border-white transition-colors group"
              >
                {/* Product thumbnails grid */}
                <div className="relative grid grid-cols-2 gap-px bg-brand-gray-800 aspect-square overflow-hidden">
                  {thumbs.map((item, idx) => (
                    <div key={item.id} className="relative bg-brand-gray-950 overflow-hidden">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 144px, 200px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package2 className="w-6 h-6 text-brand-gray-700" />
                        </div>
                      )}
                      {/* Fill empty grid slots */}
                      {idx === thumbs.length - 1 && thumbs.length < 4 && (
                        <div className="absolute inset-0 bg-brand-gray-900/60" />
                      )}
                    </div>
                  ))}
                  {/* Fill remaining grid slots */}
                  {Array.from({ length: Math.max(0, 4 - thumbs.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-brand-gray-900" />
                  ))}

                  {/* Discount badge */}
                  {bundle.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      Hemat {bundle.discount}%
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">{bundle.name}</h3>
                    {bundle.description && (
                      <p className="text-xs text-brand-gray-400 mt-1 line-clamp-2">{bundle.description}</p>
                    )}
                    <p className="text-xs text-brand-gray-500 mt-1">
                      {bundle.items.length} item
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-end gap-2">
                    {bundle.discount > 0 ? (
                      <>
                        <p className="font-bold text-base">{formatPrice(Math.round(discountedTotal))}</p>
                        <p className="text-xs text-brand-gray-500 line-through">{formatPrice(Math.round(totalOriginal))}</p>
                      </>
                    ) : (
                      <p className="font-bold text-base">{formatPrice(Math.round(totalOriginal))}</p>
                    )}
                  </div>

                  {/* Product names */}
                  <div className="flex flex-wrap gap-1">
                    {bundle.items.slice(0, 3).map((item) => (
                      <span key={item.id} className="text-[10px] bg-brand-gray-800 text-brand-gray-400 px-2 py-0.5">
                        {item.product.name}
                      </span>
                    ))}
                    {bundle.items.length > 3 && (
                      <span className="text-[10px] bg-brand-gray-800 text-brand-gray-500 px-2 py-0.5">
                        +{bundle.items.length - 3} lagi
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/products?bundle=${bundle.slug}`}
                    className="block w-full text-center py-2.5 text-xs font-bold uppercase tracking-widest border border-white text-white hover:bg-white hover:text-black transition-colors"
                  >
                    Lihat Bundle
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
