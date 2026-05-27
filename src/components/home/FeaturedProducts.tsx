import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-10" style={{ background: "#0a0a0c" }}>
      {/* Grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }} aria-hidden>
        <filter id="fp-grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#fp-grain)"/>
      </svg>

      {/* Subtle top vignette */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
           style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)" }}/>

      <div className="container-main relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }}/>
              <span className="text-[10px] uppercase tracking-[0.45em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Pilihan Editor
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-display uppercase tracking-wider text-white">
              Produk Pilihan
            </h2>
          </div>
          <Link href="/products?isFeatured=true"
                className="hidden sm:block text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)" }}>
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
