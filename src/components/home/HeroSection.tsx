"use client";

// Rewritten for mobile performance:
// - Removed useScroll/useTransform/useSpring (was running JS every scroll frame)
// - Removed SVG feTurbulence grain (GPU-heavy, especially on mobile)
// - Replaced all motion.* with CSS animations
// - Parallax removed: causes scroll jank on mobile

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#080808]"
    >
      {/* Vignette — pure CSS, zero JS */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      {/* Light beam — CSS animation only */}
      <div
        aria-hidden
        className="absolute pointer-events-none z-10 will-change-transform hero-beam"
        style={{
          top: "-30%", right: "-10%",
          width: "55vw", height: "130vh",
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0.012) 30%, transparent 60%)",
          rotate: "-12deg",
        }}
      />

      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute pointer-events-none z-[5]"
        style={{
          left: "-5vw", top: "20%",
          width: "60vw", height: "55vh",
          background: "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.025) 0%, transparent 65%)",
        }}
      />

      {/* Cinematic letterbox */}
      <div aria-hidden className="absolute top-0 inset-x-0 h-[3.5vh] bg-black z-30 pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 inset-x-0 h-[3.5vh] bg-black z-30 pointer-events-none" />

      {/* Wordmark watermark — static, hidden on mobile */}
      <div
        aria-hidden
        className="absolute inset-0 hidden lg:flex items-center justify-end pointer-events-none select-none overflow-hidden z-[6]"
      >
        <span
          className="font-display tracking-tighter leading-none"
          style={{
            fontSize: "32vw",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.035)",
            transform: "translateX(6vw)",
          }}
        >
          IND
        </span>
      </div>

      {/* Floating logo — desktop only, CSS animation */}
      <div
        aria-hidden
        className="absolute pointer-events-none select-none hidden lg:block hero-emblem"
        style={{ right: "7vw", top: "18%", width: "22vw", opacity: 0.05, zIndex: 7 }}
      >
        <Image src="/logo.png" alt="" width={400} height={200} className="w-full h-auto object-contain" style={{ filter: "brightness(2) contrast(0.7)" }} />
      </div>

      {/* Main content — CSS stagger animations */}
      <div className="container-main relative z-20 py-24">
        <div className="max-w-4xl">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-10 hero-item" style={{ animationDelay: "0.1s" }}>
            <div className="w-8 h-px bg-white/30" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.5em] text-white/40">
              Koleksi Terbaru
            </span>
          </div>

          {/* Title */}
          <h1 className="leading-[0.9] uppercase font-display" style={{ fontSize: "clamp(4rem,11.5vw,9rem)" }}>
            <span
              className="block text-white hero-item"
              style={{ letterSpacing: "0.03em", textShadow: "0 0 120px rgba(255,255,255,0.06)", animationDelay: "0.18s" }}
            >
              DUTCH
            </span>
            <span
              className="block hero-item"
              style={{
                color: "transparent",
                WebkitTextStroke: "2px rgba(255,255,255,0.8)",
                letterSpacing: "0.03em",
                animationDelay: "0.28s",
              }}
            >
              IND
            </span>
          </h1>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-4 hero-item" style={{ animationDelay: "0.35s" }}>
            <div className="h-px flex-1 max-w-[60px] bg-white/15" />
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/20">Est. 2026</span>
          </div>

          {/* Description */}
          <p
            className="mt-6 text-sm max-w-[280px] leading-relaxed hero-item"
            style={{ color: "rgba(255,255,255,0.38)", animationDelay: "0.42s" }}
          >
            Seller brand lokal streetwear #1 termurah di Samarinda — kualitas premium, harga terjangkau.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-7 mt-10 hero-item" style={{ animationDelay: "0.5s" }}>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2.5 bg-white text-black px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-brand-gray-100 transition-colors"
            >
              Belanja Sekarang
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/products?isNewArrival=true"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              New Arrivals
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex items-center gap-6 hero-item" style={{ animationDelay: "0.6s" }}>
            {[
              { n: "100+", label: "Produk"   },
              { n: "100%", label: "Original" },
              { n: "Free", label: "Ongkir"   },
            ].map(({ n, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-white">{n}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/25">{label}</span>
                <div className="w-px h-3 last:hidden bg-white/12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator — CSS only */}
      <div
        className="absolute bottom-[5vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 hero-item"
        style={{ animationDelay: "1.8s" }}
      >
        <div className="relative w-[1px] h-12 overflow-hidden bg-white/15">
          <div className="absolute top-0 left-0 w-full h-[40%] bg-white hero-scroll-line" />
        </div>
        <span className="text-[8px] uppercase tracking-[0.4em] text-white/40">Scroll</span>
      </div>

      <style>{`
        .hero-item {
          opacity: 0;
          animation: heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-beam {
          animation: beamDrift 14s ease-in-out infinite alternate;
        }
        @keyframes beamDrift {
          0%   { opacity: 1; transform: rotate(-12deg) translateX(0); }
          100% { opacity: 0.6; transform: rotate(-12deg) translateX(6vw); }
        }
        .hero-scroll-line {
          animation: scrollLine 2s ease-in-out infinite;
        }
        @keyframes scrollLine {
          0%   { transform: translateY(-100%); opacity: 1; }
          100% { transform: translateY(280%);  opacity: 0; }
        }
        .hero-emblem {
          animation: emblemFloat 8s ease-in-out infinite;
        }
        @keyframes emblemFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }
        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-item { animation: none; opacity: 1; }
          .hero-beam, .hero-scroll-line, .hero-emblem { animation: none; }
        }
      `}</style>
    </section>
  );
}
