"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";
import { motion } from "framer-motion";

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
      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
        }}
      />

      {/* Section header */}
      <div className="container-main relative z-10 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
              <span
                className="text-[10px] uppercase tracking-[0.45em]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {label}
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display uppercase text-white"
              style={{
                fontSize: "clamp(1.9rem, 4vw, 3.2rem)",
                letterSpacing: "0.04em",
              }}
            >
              {title}
            </motion.h2>
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:block text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors"
          >
            Lihat Semua →
          </Link>
        </div>
      </div>

      {/* Product grid */}
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
