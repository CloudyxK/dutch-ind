import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

interface Props {
  categories: (Category & { _count: { products: number } })[];
}

/* Picsum seeds per slot so placeholders look real */
const PICSUM_SEEDS = ["urban", "street", "dark", "night", "minimal"];

export default function CategorySection({ categories }: Props) {
  if (categories.length === 0) return null;

  const [hero, ...rest] = categories;

  return (
    <section
      className="relative overflow-hidden py-20"
      style={{ background: "#080808" }}
    >
      {/* Grain */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.05 }}
        aria-hidden
      >
        <filter id="cs-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cs-grain)" />
      </svg>

      <div className="container-main relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
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
                Belanja Berdasarkan
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-wider text-white">
              Kategori
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Semua →
          </Link>
        </div>

        {/* Asymmetric grid — hero card (col-span-2) + smaller cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
          {/* Hero card */}
          {hero && (
            <Link
              href={`/products?category=${hero.slug}`}
              className="group relative overflow-hidden col-span-2 lg:col-span-2"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Background */}
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                {hero.image ? (
                  <Image
                    src={hero.image}
                    alt={hero.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />
                ) : (
                  <Image
                    src={`https://picsum.photos/seed/${PICSUM_SEEDS[0]}/800/1200`}
                    alt={hero.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />
                )}
              </div>

              {/* Gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.12) 100%)",
                }}
              />

              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "rgba(0,0,0,0.2)" }}
              />

              {/* Index */}
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span
                  className="text-[9px] font-mono"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  01
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-white leading-tight mb-1">
                  {hero.name}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {hero._count.products} produk
                </p>
              </div>

              {/* Bottom border reveal */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ background: "rgba(255,255,255,0.6)" }}
              />
            </Link>
          )}

          {/* Remaining cards — each 1 col */}
          {rest.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden col-span-1 lg:col-span-1"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Background */}
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw"
                  />
                ) : (
                  <Image
                    src={`https://picsum.photos/seed/${PICSUM_SEEDS[(i + 1) % PICSUM_SEEDS.length]}/600/900`}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw"
                  />
                )}
              </div>

              {/* Gradient */}
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.12) 100%)",
                }}
              />

              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "rgba(0,0,0,0.25)" }}
              />

              {/* Index */}
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span
                  className="text-[9px] font-mono"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {String(i + 2).padStart(2, "0")}
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white leading-tight">
                  {cat.name}
                </p>
                <p
                  className="text-[10px] mt-1"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {cat._count.products} produk
                </p>
              </div>

              {/* Bottom border reveal */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ background: "rgba(255,255,255,0.5)" }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
