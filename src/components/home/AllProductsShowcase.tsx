"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface Props {
  products: Product[];
  title?: string;
  label?: string;
  viewAllHref?: string;
}

export default function AllProductsShowcase({
  products,
  title = "Latest Drop",
  label = "Koleksi",
  viewAllHref = "/products",
}: Props) {
  if (products.length === 0) return null;

  return (
    <section className="relative py-10 pb-20" style={{ background: "#060608" }}>
      <div className="container-main relative z-10 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
              <span className="text-[10px] uppercase tracking-[0.45em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                {label}
              </span>
            </div>
            <h2
              className="font-display uppercase text-white"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)", letterSpacing: "0.04em" }}
            >
              {title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:block text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors"
          >
            Lihat Semua →
          </Link>
        </div>
      </div>

      <div className="container-main relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-2.5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
    </section>
  );
}
