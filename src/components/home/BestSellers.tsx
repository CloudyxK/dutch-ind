import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

export default function BestSellers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-20" style={{ background: "#0a0a0c" }}>
      {/* Grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }} aria-hidden>
        <filter id="bs-grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#bs-grain)"/>
      </svg>

      <div className="container-main relative z-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }}/>
              <span className="text-[10px] uppercase tracking-[0.45em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Paling Diminati
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-wider text-white">
              Terlaris
            </h2>
          </div>
          <Link href="/products?isBestSeller=true"
                className="hidden sm:block text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)" }}>
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {products.map((product, i) => (
            <div key={product.id} className="relative group">
              {/* Rank badge — cinematic number */}
              <div className="absolute -top-2 -left-2 z-10 w-7 h-7 flex items-center justify-center
                              text-[10px] font-mono font-bold text-white transition-all duration-300
                              group-hover:scale-110"
                   style={{
                     background: "rgba(255,255,255,0.08)",
                     border: "1px solid rgba(255,255,255,0.15)",
                   }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
