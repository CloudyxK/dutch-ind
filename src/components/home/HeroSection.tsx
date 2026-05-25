"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Stagger container */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.85, ease: EASE } },
};

const fadePlain = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.9, ease: "easeOut" } },
};

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const rawParallax = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const rawBeam     = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const parallaxY   = useSpring(rawParallax, { stiffness: 60, damping: 20 });
  const beamY       = useSpring(rawBeam,     { stiffness: 60, damping: 20 });
  const logoOpacity = useTransform(scrollYProgress, [0, 0.6], [0.06, 0]);
  const logoScale   = useTransform(scrollYProgress, [0, 0.6], [1, 1.06]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]"
    >
      {/* ── Film grain ────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        style={{ opacity: 0.055, mixBlendMode: "overlay" }}
        aria-hidden
      >
        <filter id="grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>

      {/* ── Vignette ─────────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      {/* ── Diagonal light beam ──────────────────────────────── */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none z-10 will-change-transform"
        style={{
          top: "-30%", right: "-10%",
          width: "55vw", height: "130vh",
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.032) 0%, rgba(255,255,255,0.014) 30%, transparent 60%)",
          rotate: "-12deg",
          y: beamY,
          animation: "beam-drift 14s ease-in-out infinite alternate",
        }}
      />

      {/* ── Ambient glow ─────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute pointer-events-none z-[5]"
        style={{
          left: "-5vw", top: "20%",
          width: "60vw", height: "55vh",
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 65%)",
        }}
      />

      {/* ── Cinematic letterbox bars ──────────────────────────── */}
      <div aria-hidden className="absolute top-0 inset-x-0 h-[3.5vh] bg-black z-30 pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 inset-x-0 h-[3.5vh] bg-black z-30 pointer-events-none" />

      {/* ── Background wordmark + parallax ───────────────────── */}
      <motion.div
        aria-hidden
        style={{ y: parallaxY }}
        className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden z-[6]"
      >
        <span
          className="font-display tracking-tighter leading-none"
          style={{
            fontSize: "32vw",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.04)",
            transform: "translateX(6vw)",
          }}
        >
          IND
        </span>
      </motion.div>

      {/* ── 3D Floating logo emblem (top-right) ─────────────── */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none select-none hidden lg:block"
        style={{
          right: "7vw", top: "18%",
          width: "22vw",
          opacity: logoOpacity,
          scale: logoScale,
          animation: "emblem-float 8s ease-in-out infinite",
          zIndex: 7,
        }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            animation: "emblem-rotate 18s linear infinite",
          }}
        >
          <Image
            src="/logo.png"
            alt=""
            width={400}
            height={200}
            className="w-full h-auto object-contain"
            style={{
              filter: "brightness(2) contrast(0.7)",
            }}
          />
        </div>
      </motion.div>

      {/* ── Main content ─────────────────────────────────────── */}
      <motion.div
        className="container-main relative z-20 py-24"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-4xl">

          {/* Eyebrow */}
          <motion.div variants={fadePlain} className="flex items-center gap-3 mb-10">
            <div className="w-8 h-px bg-white/30" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.5em] text-white/40">
              Koleksi Terbaru
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="leading-[0.9] uppercase font-display overflow-hidden"
              style={{ fontSize: "clamp(4rem,11.5vw,9rem)" }}>
            <motion.span
              variants={fadeLeft}
              className="block text-white"
              style={{ letterSpacing: "0.03em", textShadow: "0 0 120px rgba(255,255,255,0.06)" }}
            >
              DUTCH
            </motion.span>
            <motion.span
              variants={fadeUp}
              className="block"
              style={{
                color: "transparent",
                WebkitTextStroke: "2px rgba(255,255,255,0.8)",
                letterSpacing: "0.03em",
              }}
            >
              IND
            </motion.span>
          </h1>

          {/* Divider */}
          <motion.div variants={fadePlain} className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 max-w-[60px] bg-white/15" />
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/20">Est. 2025</span>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mt-6 text-sm max-w-[280px] leading-relaxed text-white/38"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Seller brand lokal streetwear #1 termurah di Samarinda — kualitas premium, harga terjangkau.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex items-center gap-7 mt-10">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2.5 bg-white text-black px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-brand-gray-100 transition-colors"
            >
              Belanja Sekarang
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/products?isNewArrival=true"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45 hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              New Arrivals
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadePlain} className="mt-16 flex items-center gap-6">
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
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-[5vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
      >
        <div className="relative w-[1px] h-12 overflow-hidden bg-white/15">
          <div
            className="absolute top-0 left-0 w-full h-[40%] bg-white"
            style={{ animation: "scroll-line 2s ease-in-out infinite" }}
          />
        </div>
        <span className="text-[8px] uppercase tracking-[0.4em] text-white/40">Scroll</span>
      </motion.div>

      <style>{`
        @keyframes beam-drift {
          0%   { opacity: 1; transform: rotate(-12deg) translateX(0); }
          100% { opacity: 0.6; transform: rotate(-12deg) translateX(6vw); }
        }
        @keyframes scroll-line {
          0%   { transform: translateY(-100%); opacity: 1; }
          100% { transform: translateY(280%);  opacity: 0; }
        }
        @keyframes emblem-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-18px); }
        }
        @keyframes emblem-rotate {
          0%   { transform: perspective(600px) rotateY(0deg); }
          100% { transform: perspective(600px) rotateY(360deg); }
        }
      `}</style>
    </section>
  );
}
