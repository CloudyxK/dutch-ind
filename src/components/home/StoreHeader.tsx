"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function StoreHeader() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#060608", minHeight: "400px" }}
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

      {/* Asymmetric ambient glow — off-center left */}
      <div
        className="absolute pointer-events-none"
        aria-hidden
        style={{
          top: "-30%", left: "-10%",
          width: "70%", height: "160%",
          background:
            "radial-gradient(ellipse 55% 55% at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      {/* Edition marker — top right */}
      <div className="absolute top-7 right-8 hidden md:block" aria-hidden>
        <p
          className="font-mono text-[8px] uppercase tracking-[0.45em]"
          style={{ color: "rgba(255,255,255,0.1)" }}
        >
          SS25 / IDN
        </p>
      </div>

      {/* Main content */}
      <div
        className="container-main relative z-10 flex items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="w-full grid md:grid-cols-[1fr_auto] gap-10 items-center py-14 md:py-20">
          {/* Left — editorial headline */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-7"
            >
              <div className="w-7 h-px" style={{ background: "rgba(255,255,255,0.35)" }} />
              <span
                className="text-[9px] uppercase tracking-[0.55em]"
                style={{ color: "rgba(255,255,255,0.28)" }}
              >
                Brand Streetwear Premium Indonesia
              </span>
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <Image
                src="/logo.png"
                alt="DUTCH.IND"
                width={360}
                height={140}
                className="h-16 md:h-[72px] w-auto object-contain"
                style={{
                  mixBlendMode: "screen",
                  filter:
                    "brightness(2) contrast(2.8) drop-shadow(0 0 48px rgba(255,255,255,0.14))",
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
              Samarinda, Indonesia &nbsp;·&nbsp; Est. 2025
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-7"
            >
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 bg-white text-black px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] hover:bg-white/90 transition-colors"
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
                  →
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Right — vertical brand text divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.5 }}
            className="hidden md:flex flex-col items-center gap-3 self-stretch justify-center py-14"
            aria-hidden
          >
            <div
              className="w-px flex-1"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
            <p
              className="font-mono text-[7px] uppercase tracking-[0.55em]"
              style={{
                color: "rgba(255,255,255,0.1)",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
              }}
            >
              DUTCH.IND © 2025
            </p>
            <div
              className="w-px flex-1"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.06]" />
    </section>
  );
}
