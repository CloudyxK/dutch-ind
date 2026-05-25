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
    <section className="relative py-10 pb-20">
      {/* Section header */}
      <div className="container-main mb-8">
        <div className="flex items-end justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-5 h-px bg-white/30" />
              <span className="text-[10px] uppercase tracking-[0.45em] text-white/30">
                {label}
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display uppercase text-white"
              style={{ fontSize: "clamp(1.8rem,4vw,3rem)", letterSpacing: "0.04em" }}
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

      {/* Product grid — full width like Hellstar */}
      <div className="container-main">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
    </section>
  );
}
