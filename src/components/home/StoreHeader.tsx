"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function StoreHeader() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center py-20 md:py-28 overflow-hidden">
      {/* Top rule */}
      <div className="absolute top-0 inset-x-0 h-px bg-white/[0.06]" />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <Image
          src="/logo.png"
          alt="DUTCH.IND"
          width={180}
          height={90}
          className="h-14 w-auto object-contain mx-auto"
          style={{
            mixBlendMode: "screen",
            filter: "brightness(1.2) drop-shadow(0 0 30px rgba(255,255,255,0.15))",
          }}
          priority
        />
      </motion.div>

      {/* Brand tagline */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="text-[10px] uppercase tracking-[0.55em] mb-8"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        Premium Streetwear &nbsp;·&nbsp; Est. 2025 &nbsp;·&nbsp; Samarinda, Indonesia
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-4"
      >
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 bg-white text-black px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-colors"
        >
          Shop Now
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/products?isNewArrival=true"
          className="inline-flex items-center gap-2 border border-white/20 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white hover:border-white/50 transition-colors"
        >
          New Arrivals
        </Link>
      </motion.div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.06]" />
    </section>
  );
}
