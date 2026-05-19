"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

export default function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!headingRef.current) return;
      headingRef.current.style.transform = `translateY(${window.scrollY * 0.25}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-black">
      {/* Faint background wordmark */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden">
        <span className="text-[30vw] font-display tracking-tighter leading-none text-white opacity-[0.025] translate-x-[6vw]">
          IND
        </span>
      </div>

      {/* Content */}
      <div className="container-main relative z-10 py-24">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-px bg-brand-gray-600" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.45em] text-brand-gray-500">
              Koleksi 2025
            </span>
          </div>

          {/* Heading */}
          <h1
            ref={headingRef}
            className="text-[clamp(4rem,11vw,8.5rem)] font-display leading-[0.92] tracking-wide uppercase text-white will-change-transform"
          >
            DUTCH
            <br />
            <span className="hero-outline">IND</span>
          </h1>

          {/* Description */}
          <p className="mt-10 text-sm text-brand-gray-400 max-w-xs leading-relaxed">
            Streetwear premium Indonesia — desain eksklusif untuk mereka yang berani tampil beda.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-6 mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-brand-gray-200 transition-colors"
            >
              Belanja Sekarang
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/products?isNewArrival=true"
              className="text-xs font-semibold uppercase tracking-widest text-brand-gray-500 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              New Arrivals
            </Link>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="w-px h-10 bg-white animate-pulse" />
        <span className="text-[9px] uppercase tracking-[0.3em] text-brand-gray-500">Scroll</span>
      </div>

      <style jsx>{`
        .hero-outline {
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.85);
          color: transparent;
        }
      `}</style>
    </section>
  );
}
