import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import RevealSection from "@/components/ui/RevealSection";

export const metadata: Metadata = {
  title: "Lookbook — DUTCH.IND",
  description: "Editorial fashion lookbook — koleksi terbaru DUTCH.IND.",
};

async function getLookbookProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
}

export default async function LookbookPage() {
  const products = await getLookbookProducts();

  const hero    = products[0];
  const large1  = products[1];
  const large2  = products[2];
  const mid     = products.slice(3, 7);
  const bottom  = products.slice(7, 11);

  return (
    <div className="bg-[#080808] min-h-screen">

      {/* ── Page header ────────────────────────────────────── */}
      <div className="relative overflow-hidden py-28 border-b border-white/[0.05]">
        {/* Grain */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }} aria-hidden>
          <filter id="lb-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#lb-grain)" />
        </svg>

        <div className="container-main relative z-10 text-center">
          <RevealSection>
            <p className="text-[10px] uppercase tracking-[0.6em] text-white/30 mb-5">
              â—ˆ &nbsp; DUTCH.IND &nbsp; â—ˆ
            </p>
            <h1
              className="font-display uppercase"
              style={{ fontSize: "clamp(3.5rem,10vw,8rem)", letterSpacing: "0.04em" }}
            >
              <span className="text-white">LOOK</span>
              <span
                style={{
                  color: "transparent",
                  WebkitTextStroke: "2px rgba(255,255,255,0.7)",
                }}
              >
                BOOK
              </span>
            </h1>
            <p className="mt-5 text-sm text-white/30 tracking-wider max-w-sm mx-auto">
              Editorial visual — koleksi premium yang dirancang untuk generasi urban.
            </p>
          </RevealSection>
        </div>
      </div>

      {/* ── Hero editorial ──────────────────────────────────── */}
      {hero && (
        <RevealSection>
          <Link
            href={`/products/${(hero as any).slug}`}
            className="group relative block w-full overflow-hidden"
            style={{ height: "80vh" }}
          >
            <Image
              src={(hero as any).images[0]?.url || "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=1400"}
              alt={(hero as any).name}
              fill
              className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-10 md:p-16">
              <p className="text-[10px] uppercase tracking-[0.45em] text-white/40 mb-2">
                {(hero as any).category?.name}
              </p>
              <h2
                className="font-display uppercase text-white"
                style={{ fontSize: "clamp(2rem,5vw,4rem)" }}
              >
                {(hero as any).name}
              </h2>
              <p className="mt-3 text-sm text-white/40 uppercase tracking-widest">
                Lihat Produk →
              </p>
            </div>
          </Link>
        </RevealSection>
      )}

      {/* ── Two large side-by-side ──────────────────────────── */}
      {(large1 || large2) && (
        <div className="grid grid-cols-1 md:grid-cols-2">
          {[large1, large2].filter(Boolean).map((p, i) => (
            <RevealSection key={(p as any).id} delay={i * 0.12}>
              <Link
                href={`/products/${(p as any).slug}`}
                className="group relative block overflow-hidden"
                style={{ height: "65vh" }}
              >
                <Image
                  src={(p as any).images[0]?.url || "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900"}
                  alt={(p as any).name}
                  fill
                  className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-[10px] uppercase tracking-widest text-white/35 mb-1">
                    {(p as any).category?.name}
                  </p>
                  <h3 className="font-display text-2xl uppercase text-white">{(p as any).name}</h3>
                </div>
              </Link>
            </RevealSection>
          ))}
        </div>
      )}

      {/* ── Divider quote ───────────────────────────────────── */}
      <RevealSection>
        <div className="py-24 text-center border-y border-white/[0.04]">
          <blockquote
            className="font-display uppercase text-white/10 mx-auto"
            style={{ fontSize: "clamp(2rem,6vw,5rem)", maxWidth: "900px" }}
          >
            "Kenakan &nbsp;
            <span
              style={{
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,0.35)",
              }}
            >
              Identitasmu
            </span>"
          </blockquote>
          <p className="mt-4 text-[10px] uppercase tracking-[0.5em] text-white/20">
            DUTCH.IND — EST. 2026
          </p>
        </div>
      </RevealSection>

      {/* ── 4-column grid ───────────────────────────────────── */}
      {mid.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {mid.map((p, i) => (
            <RevealSection key={(p as any).id} delay={i * 0.08}>
              <Link
                href={`/products/${(p as any).slug}`}
                className="group relative block overflow-hidden"
                style={{ height: "50vh" }}
              >
                <Image
                  src={(p as any).images[0]?.url || "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=600"}
                  alt={(p as any).name}
                  fill
                  className="object-cover transition-transform duration-[1s] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-400" />
                <div className="absolute bottom-0 inset-x-0 p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <h4 className="font-display text-xl uppercase text-white truncate">{(p as any).name}</h4>
                </div>
              </Link>
            </RevealSection>
          ))}
        </div>
      )}

      {/* ── Full-width strip + CTA ───────────────────────────── */}
      <RevealSection>
        <div className="py-24 border-t border-white/[0.04]">
          <div className="container-main text-center">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/25 mb-6">Koleksi Lengkap</p>
            <h2
              className="font-display uppercase text-white mb-8"
              style={{ fontSize: "clamp(2.5rem,7vw,6rem)" }}
            >
              Temukan Gaya
              <br />
              <span
                style={{
                  color: "transparent",
                  WebkitTextStroke: "2px rgba(255,255,255,0.5)",
                }}
              >
                Kamu
              </span>
            </h2>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 border border-white/30 px-10 py-4 text-[11px] font-bold uppercase tracking-[0.35em] hover:bg-white hover:text-black transition-all duration-300"
            >
              Lihat Semua Koleksi
            </Link>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
