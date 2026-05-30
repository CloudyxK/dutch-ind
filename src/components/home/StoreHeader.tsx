"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function StoreHeader() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#060608", minHeight: "300px" }}
    >
      {/* Top rule */}
      <div className="absolute top-0 inset-x-0 h-px bg-white/[0.06]" />

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          opacity: 0.055,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
        }}
      />

      {/* Centered ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />

      {/* Edition marker â€” top right */}
      <div className="absolute top-7 right-8 hidden md:block" aria-hidden>
        <p
          className="font-mono text-[8px] uppercase tracking-[0.45em]"
          style={{ color: "rgba(255,255,255,0.1)" }}
        >
          SS25 / IDN
        </p>
      </div>

      {/* Main content â€” centered */}
      <div
        className="container-main relative z-10 flex items-center justify-center"
        style={{ minHeight: "300px" }}
      >
        <div className="flex flex-col items-center text-center py-10 md:py-12">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-7"
          >
            <div className="w-7 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
            <span
              className="text-[9px] uppercase tracking-[0.55em]"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              Toko Brand Lokal Termurah No #1
            </span>
            <div className="w-7 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
          </motion.div>

          {/* Logo â€” bigger */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7"
          >
            <Image
              src="/logo.png"
              alt="DUTCH.IND"
              width={480}
              height={180}
              className="w-auto object-contain mx-auto"
              style={{
                height: "clamp(56px, 12vw, 76px)",
                mixBlendMode: "screen",
                filter:
                  "brightness(2) contrast(2.8) drop-shadow(0 0 48px rgba(255,255,255,0.16))",
              }}
              priority
            />
          </motion.div>

          {/* Sub-label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] uppercase tracking-[0.45em] mb-10"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Samarinda, Indonesia &nbsp;Â·&nbsp; Est. 2026
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto px-4 sm:px-0"
          >
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
              Koleksi Baru
              <span
                className="transition-transform group-hover:translate-x-0.5"
                style={{ display: "inline-block" }}
              >
                â†’
              </span>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.06]" />
    </section>
  );
}
