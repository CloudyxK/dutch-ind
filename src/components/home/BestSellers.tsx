import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

export default function BestSellers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden py-10"
      style={{ background: "#0a0a0c" }}
    >
      {/* Grain */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.05 }}
        aria-hidden
      >
        <filter id="bs-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#bs-grain)" />
      </svg>

      {/* Off-center ambient glow */}
      <div
        className="absolute pointer-events-none"
        aria-hidden
        style={{
          top: "0", left: "50%",
          transform: "translateX(-50%)",
          width: "80%", height: "100%",
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.025) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />

      <div className="container-main relative z-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-5 h-px"
                style={{ background: "rgba(255,255,255,0.3)" }}
              />
              <span
                className="text-[10px] uppercase tracking-[0.45em]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Paling Diminati
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-display uppercase tracking-wider text-white">
              Terlaris
            </h2>
          </div>
          <Link
            href="/products?isBestSeller=true"
            className="hidden sm:block text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {products.map((product, i) => (
            <div key={product.id} className="relative group">
              {/* Ghost rank number — large editorial background text */}
              <div
                className="absolute -top-4 -left-1 z-10 font-display font-black select-none pointer-events-none"
                aria-hidden
                style={{
                  fontSize: "clamp(3.5rem,7vw,5.5rem)",
                  color: "rgba(255,255,255,0.045)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              {/* Small readable rank — top left corner */}
              <div className="absolute top-3 left-3 z-20">
                <span
                  className="text-[9px] font-mono"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
