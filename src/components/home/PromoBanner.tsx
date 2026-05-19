"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState({
    jam: 23,
    menit: 59,
    detik: 59,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.detik > 0) return { ...prev, detik: prev.detik - 1 };
        if (prev.menit > 0) return { ...prev, menit: prev.menit - 1, detik: 59 };
        if (prev.jam > 0) return { jam: prev.jam - 1, menit: 59, detik: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="py-16 bg-white text-black">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/50 mb-2">
              Penawaran Terbatas
            </p>
            <h2 className="text-4xl md:text-5xl font-display tracking-wider uppercase">
              Flash Sale
              <br />
              Diskon 20%
            </h2>
            <p className="mt-3 text-sm text-black/60 max-w-sm">
              Dapatkan diskon 20% untuk semua produk pilihan. Gunakan kode{" "}
              <strong className="text-black">FLASHSALE</strong> saat checkout.
            </p>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-black/50 mb-4">
              Berakhir dalam
            </p>
            <div className="flex items-center gap-2">
              {[
                { value: pad(timeLeft.jam), label: "Jam" },
                { value: pad(timeLeft.menit), label: "Menit" },
                { value: pad(timeLeft.detik), label: "Detik" },
              ].map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-2xl font-display">
                      {unit.value}
                    </div>
                    <p className="text-[10px] uppercase tracking-wider mt-1 text-black/50">
                      {unit.label}
                    </p>
                  </div>
                  {i < 2 && (
                    <span className="text-2xl font-bold text-black/40 pb-4">:</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Link href="/products" className="btn-primary bg-black text-white hover:bg-black/80 group">
            Belanja Sekarang
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
