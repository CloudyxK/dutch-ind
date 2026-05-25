import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

export default function NewArrivals({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-20" style={{ background: "#080808" }}>
      {/* Grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }} aria-hidden>
        <filter id="na-grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#na-grain)"/>
      </svg>

      <div className="container-main relative z-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }}/>
              <span className="text-[10px] uppercase tracking-[0.45em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Koleksi Terbaru
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-wider text-white">
              Koleksi Terbaru
            </h2>
          </div>
          <Link href="/products?isNewArrival=true"
                className="hidden sm:block text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)" }}>
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
