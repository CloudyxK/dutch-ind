import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

export default function BestSellers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-brand-gray-900">
      <div className="container-main">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-gray-500 mb-2">
              Paling Diminati
            </p>
            <h2 className="section-title">Best Sellers</h2>
          </div>
          <Link
            href="/products?isBestSeller=true"
            className="text-xs uppercase tracking-widest text-brand-gray-400 hover:text-white transition-colors hidden sm:block"
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <div key={product.id} className="relative">
              <div className="absolute -top-3 -left-1 z-10 w-8 h-8 bg-white text-black flex items-center justify-center text-xs font-bold">
                #{index + 1}
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
