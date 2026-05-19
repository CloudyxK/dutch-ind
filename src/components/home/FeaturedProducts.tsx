import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-brand-gray-900">
      <div className="container-main">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-gray-500 mb-2">
              Pilihan Editor
            </p>
            <h2 className="section-title">Produk Pilihan</h2>
          </div>
          <Link
            href="/products?isFeatured=true"
            className="text-xs uppercase tracking-widest text-brand-gray-400 hover:text-white transition-colors hidden sm:block"
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
