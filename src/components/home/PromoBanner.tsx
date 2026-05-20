"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

type FlashSaleConfig = {
  active: boolean;
  title: string;
  subtitle: string;
  endAt: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  couponCode: string;
};

type Props = {
  flashSale?: FlashSaleConfig | null;
};

export default function PromoBanner({ flashSale }: Props) {
  const [timeLeft, setTimeLeft] = useState({ hari: 0, jam: 0, menit: 0, detik: 0 });
  const [mounted, setMounted] = useState(false);
  const [expired, setExpired] = useState(false);

  // Check if flash sale is valid
  const isActive = !!(
    flashSale &&
    flashSale.active &&
    flashSale.endAt &&
    new Date(flashSale.endAt) > new Date()
  );

  useEffect(() => {
    setMounted(true);

    if (!flashSale?.endAt) return;

    const endTime = new Date(flashSale.endAt).getTime();

    const calcTimeLeft = () => {
      const diff = Math.max(0, endTime - Date.now());
      if (diff === 0) {
        setExpired(true);
        setTimeLeft({ hari: 0, jam: 0, menit: 0, detik: 0 });
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      setTimeLeft({
        hari:  Math.floor(totalSec / 86400),
        jam:   Math.floor((totalSec % 86400) / 3600),
        menit: Math.floor((totalSec % 3600) / 60),
        detik: totalSec % 60,
      });
    };

    calcTimeLeft();
    const id = setInterval(calcTimeLeft, 1000);
    return () => clearInterval(id);
  }, [flashSale?.endAt]);

  // Don't render if no active flash sale
  if (!isActive && mounted) return null;
  // During SSR or before mount, hide if no flashSale at all
  if (!flashSale || !flashSale.active) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  const discountLabel =
    flashSale.discountType === "PERCENTAGE"
      ? `Diskon ${flashSale.discountValue}%`
      : `Diskon Rp${flashSale.discountValue.toLocaleString("id-ID")}`;

  const countdownItems = timeLeft.hari > 0
    ? [
        { v: pad(timeLeft.hari),  l: "Hari"  },
        { v: pad(timeLeft.jam),   l: "Jam"   },
        { v: pad(timeLeft.menit), l: "Menit" },
        { v: pad(timeLeft.detik), l: "Detik" },
      ]
    : [
        { v: pad(timeLeft.jam),   l: "Jam"   },
        { v: pad(timeLeft.menit), l: "Menit" },
        { v: pad(timeLeft.detik), l: "Detik" },
      ];

  return (
    <section className="relative overflow-hidden py-20" style={{ background: "#060608" }}>
      {/* Grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }} aria-hidden>
        <filter id="pb-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#pb-grain)"/>
      </svg>

      {/* Ambient red glow */}
      <div aria-hidden className="absolute pointer-events-none"
           style={{
             top: "50%", left: "50%",
             transform: "translate(-50%,-50%)",
             width: "70%", height: "200%",
             background: "radial-gradient(ellipse at center, rgba(220,38,38,0.05) 0%, transparent 65%)",
           }}/>

      {/* Top / bottom rules */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.06)" }}/>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.06)" }}/>

      <div className="container-main relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

          {/* Left — copy */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-6 h-px" style={{ background: "rgba(220,38,38,0.8)" }}/>
              <p className="text-[10px] font-bold uppercase tracking-[0.45em]" style={{ color: "rgba(220,38,38,0.9)" }}>
                Penawaran Terbatas
              </p>
            </div>
            <h2 className="font-display uppercase leading-[0.9]" style={{ fontSize: "clamp(2.8rem,5vw,4rem)" }}>
              <span className="text-white block">{flashSale.title}</span>
              <span className="block" style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.7)" }}>
                {discountLabel}
              </span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed max-w-[300px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              {flashSale.subtitle}. Gunakan kode{" "}
              <span className="font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>
                {flashSale.couponCode}
              </span>{" "}
              saat checkout.
            </p>
          </div>

          {/* Center — countdown */}
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.45em] mb-5" style={{ color: "rgba(255,255,255,0.25)" }}>
              Berakhir dalam
            </p>
            <div className="flex items-start gap-1.5">
              {countdownItems.map(({ v, l }, i) => (
                <div key={l} className="flex items-start gap-1.5">
                  <div className="text-center">
                    <div
                      className="w-[72px] h-[72px] flex items-center justify-center font-display text-3xl text-white"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {mounted ? v : "--"}
                    </div>
                    <p className="text-[9px] uppercase tracking-widest mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {l}
                    </p>
                  </div>
                  {i < countdownItems.length - 1 && (
                    <span className="text-2xl font-bold mt-3.5" style={{ color: "rgba(255,255,255,0.2)" }}>:</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right — CTA */}
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 border px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-white hover:text-black"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            Belanja Sekarang
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"/>
          </Link>
        </div>
      </div>
    </section>
  );
}
