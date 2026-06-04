// Server component — no "use client" needed, no JS sent to browser
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function StoreHeader() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#060608", minHeight: "300px" }}
    >
      <div className="absolute top-0 inset-x-0 h-px bg-white/[0.06]" />

      {/* Ambient glow — CSS only, no filter blur on mobile */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none hidden sm:block"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 65%)",
        }}
      />

      {/* Edition marker */}
      <div className="absolute top-7 right-8 hidden md:block" aria-hidden>
        <p className="font-mono text-[8px] uppercase tracking-[0.45em]" style={{ color: "rgba(255,255,255,0.1)" }}>
          SS25 / IDN
        </p>
      </div>

      <div className="container-main relative z-10 flex items-center justify-center" style={{ minHeight: "300px" }}>
        <div className="flex flex-col items-center text-center py-10 md:py-12">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-7 header-fade-1">
            <div className="w-7 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
            <span className="text-[9px] uppercase tracking-[0.55em]" style={{ color: "rgba(255,255,255,0.28)" }}>
              Toko Brand Lokal Termurah No #1
            </span>
            <div className="w-7 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
          </div>

          {/* Logo */}
          <div className="mb-7 header-fade-2">
            <Image
              src="/logo.png"
              alt="DUTCH.IND"
              width={480}
              height={180}
              className="w-auto object-contain mx-auto"
              style={{
                height: "clamp(56px, 12vw, 76px)",
                mixBlendMode: "screen",
                filter: "brightness(2) contrast(2.8) drop-shadow(0 0 48px rgba(255,255,255,0.16))",
              }}
              priority
            />
          </div>

          {/* Sub-label */}
          <p className="text-[10px] uppercase tracking-[0.45em] mb-10 header-fade-3" style={{ color: "rgba(255,255,255,0.2)" }}>
            Samarinda, Indonesia &nbsp;·&nbsp; Est. 2026
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto px-4 sm:px-0 header-fade-4">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-3 bg-white text-black w-full sm:w-auto px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] hover:bg-white/90 transition-colors"
            >
              Belanja Sekarang
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products?isNewArrival=true"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] transition-colors"
              style={{ color: "rgba(255,255,255,0.32)" }}
            >
              Koleksi Baru <span className="transition-transform group-hover:translate-x-0.5 inline-block">→</span>
            </Link>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.06]" />

      <style>{`
        .header-fade-1 { animation: hdrFade 0.65s ease both 0.05s; }
        .header-fade-2 { animation: hdrFade 0.75s ease both 0.15s; }
        .header-fade-3 { animation: hdrFade 0.65s ease both 0.25s; }
        .header-fade-4 { animation: hdrFade 0.65s ease both 0.35s; }
        @keyframes hdrFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .header-fade-1, .header-fade-2, .header-fade-3, .header-fade-4 { animation: none; }
        }
      `}</style>
    </section>
  );
}
