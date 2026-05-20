import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

interface Props {
  categories: (Category & { _count: { products: number } })[];
}

export default function CategorySection({ categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-20" style={{ background: "#080808" }}>
      {/* Grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }} aria-hidden>
        <filter id="cs-grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#cs-grain)"/>
      </svg>

      <div className="container-main relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }}/>
              <span className="text-[10px] uppercase tracking-[0.45em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Shop by
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-wider text-white">
              Kategori
            </h2>
          </div>
          <Link href="/products"
                className="text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)" }}>
            Semua →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Background image or placeholder */}
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="(max-width:640px) 50vw, 20vw"/>
                ) : (
                  <div style={{ background: `hsl(${210 + i * 18},8%,${8 + i * 2}%)`, width: "100%", height: "100%" }}/>
                )}
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 transition-opacity duration-500"
                   style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)" }}/>

              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ background: "rgba(0,0,0,0.25)" }}/>

              {/* Top-left index */}
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white leading-tight">
                  {cat.name}
                </p>
                <p className="text-[10px] mt-1 transition-all duration-300"
                   style={{ color: "rgba(255,255,255,0.4)" }}>
                  {cat._count.products} produk
                </p>
              </div>

              {/* Bottom border reveal */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                   style={{ background: "rgba(255,255,255,0.5)" }}/>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
