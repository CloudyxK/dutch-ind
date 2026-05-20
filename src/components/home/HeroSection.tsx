"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function HeroSection() {
  const parallaxRef  = useRef<HTMLDivElement>(null);
  const beamRef      = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  /* Parallax on scroll */
  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const y = window.scrollY;
      if (parallaxRef.current)
        parallaxRef.current.style.transform = `translateY(${y * 0.18}px)`;
      if (beamRef.current)
        beamRef.current.style.transform = `translateY(${y * 0.08}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]">

      {/* ── 1. Film grain (SVG feTurbulence) ─────────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20"
           style={{ opacity: 0.055, mixBlendMode: "overlay" }} aria-hidden>
        <filter id="grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)"/>
      </svg>

      {/* ── 2. Vignette (cinematic dark edges) ───────────────── */}
      <div aria-hidden className="absolute inset-0 z-10 pointer-events-none"
           style={{
             background: "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.9) 100%)",
           }}/>

      {/* ── 3. Diagonal light beam ────────────────────────────── */}
      <div ref={beamRef}
           aria-hidden
           className="absolute pointer-events-none z-10 will-change-transform"
           style={{
             top: "-30%", right: "-10%",
             width: "55vw", height: "130vh",
             background: "linear-gradient(160deg, rgba(255,255,255,0.032) 0%, rgba(255,255,255,0.014) 30%, transparent 60%)",
             transform: "rotate(-12deg)",
             animation: "beam-drift 14s ease-in-out infinite alternate",
           }}/>

      {/* ── 4. Ambient glow (behind title) ───────────────────── */}
      <div aria-hidden className="absolute pointer-events-none z-[5]"
           style={{
             left: "-5vw", top: "20%",
             width: "60vw", height: "55vh",
             background: "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 65%)",
           }}/>

      {/* ── 5. Cinematic letterbox bars ──────────────────────── */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-[3.5vh] bg-black z-30 pointer-events-none"/>
      <div aria-hidden className="absolute bottom-0 left-0 right-0 h-[3.5vh] bg-black z-30 pointer-events-none"/>

      {/* ── 6. Background super-size wordmark ────────────────── */}
      <div ref={parallaxRef}
           aria-hidden
           className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden will-change-transform z-[6]">
        <span
          className="font-display tracking-tighter leading-none"
          style={{
            fontSize: "32vw",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.04)",
            transform: "translateX(6vw)",
            letterSpacing: "-0.02em",
          }}>
          IND
        </span>
      </div>

      {/* ── 7. Main content ──────────────────────────────────── */}
      <div className="container-main relative z-20 py-24">
        <div className="max-w-4xl">

          {/* Eyebrow */}
          <div className={`flex items-center gap-3 mb-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
               style={{ transitionDelay: "100ms" }}>
            <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.3)" }}/>
            <span className="text-[10px] font-semibold uppercase tracking-[0.5em]"
                  style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.5em" }}>
              Koleksi Terbaru
            </span>
          </div>

          {/* Main title */}
          <h1 className="leading-[0.9] uppercase font-display"
              style={{ fontSize: "clamp(4rem,11.5vw,9rem)" }}>

            {/* DUTCH — animate in from left */}
            <span className={`block text-white transition-all duration-900 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
                  style={{
                    transitionDelay: "250ms",
                    letterSpacing: "0.03em",
                    textShadow: "0 0 120px rgba(255,255,255,0.06)",
                  }}>
              DUTCH
            </span>

            {/* IND — outline, animate in from below */}
            <span className={`block transition-all duration-900 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{
                    transitionDelay: "420ms",
                    color: "transparent",
                    WebkitTextStroke: "2px rgba(255,255,255,0.8)",
                    letterSpacing: "0.03em",
                  }}>
              IND
            </span>
          </h1>

          {/* Divider */}
          <div className={`mt-8 flex items-center gap-4 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
               style={{ transitionDelay: "600ms" }}>
            <div className="h-px flex-1 max-w-[60px]" style={{ background: "rgba(255,255,255,0.15)" }}/>
            <span className="text-[9px] uppercase tracking-[0.4em]" style={{ color: "rgba(255,255,255,0.2)" }}>
              Est. 2025
            </span>
          </div>

          {/* Description */}
          <p className={`mt-6 text-sm max-w-[280px] leading-relaxed transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
             style={{
               transitionDelay: "700ms",
               color: "rgba(255,255,255,0.38)",
             }}>
            Seller brand lokal streetwear #1 termurah di Samarinda — kualitas premium, harga terjangkau.
          </p>

          {/* CTAs */}
          <div className={`flex items-center gap-7 mt-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
               style={{ transitionDelay: "850ms" }}>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2.5 bg-white text-black px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-brand-gray-100 transition-colors"
            >
              Belanja Sekarang
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"/>
            </Link>
            <Link
              href="/products?isNewArrival=true"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              New Arrivals
            </Link>
          </div>

          {/* Bottom metadata row */}
          <div className={`mt-16 flex items-center gap-6 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
               style={{ transitionDelay: "1050ms" }}>
            {[
              { n: "100+", label: "Produk" },
              { n: "100%", label: "Original" },
              { n: "Free", label: "Ongkir" },
            ].map(({ n, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-white">{n}</span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {label}
                </span>
                <div className="w-px h-3 last:hidden" style={{ background: "rgba(255,255,255,0.12)" }}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 8. Scroll indicator ──────────────────────────────── */}
      <div className={`absolute bottom-[5vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 transition-opacity duration-1000 ${mounted ? "opacity-30" : "opacity-0"}`}
           style={{ transitionDelay: "1200ms" }}>
        <div className="relative w-[1px] h-12 overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
          <div className="absolute top-0 left-0 w-full"
               style={{
                 height: "40%",
                 background: "white",
                 animation: "scroll-line 2s ease-in-out infinite",
               }}/>
        </div>
        <span className="text-[8px] uppercase tracking-[0.4em]" style={{ color: "rgba(255,255,255,0.4)" }}>Scroll</span>
      </div>

      {/* ── Keyframes ────────────────────────────────────────── */}
      <style>{`
        @keyframes beam-drift {
          0%   { opacity: 1; transform: rotate(-12deg) translateX(0); }
          100% { opacity: 0.6; transform: rotate(-12deg) translateX(6vw); }
        }
        @keyframes scroll-line {
          0%   { transform: translateY(-100%); opacity: 1; }
          100% { transform: translateY(280%);  opacity: 0; }
        }
        .duration-900 { transition-duration: 900ms; }
      `}</style>
    </section>
  );
}
