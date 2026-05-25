"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [visible, setVisible]   = useState(true);
  const [leaving, setLeaving]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function enter() {
    setLeaving(true);
    // Tunggu animasi selesai lalu hapus dari DOM
    setTimeout(() => setVisible(false), 800);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none
        ${leaving ? "animate-splash-leave" : "animate-splash-enter"}`}
      style={{ background: "#000" }}
    >
      {/* Background noise texture */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />

      {/* Logo */}
      <div className={`mb-10 ${leaving ? "animate-logo-leave" : "animate-logo-enter"}`}>
        <Image
          src="/logo.png"
          alt="DUTCH.IND"
          width={280}
          height={140}
          className="drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] select-none"
          priority
          draggable={false}
        />
      </div>

      {/* ENTER button */}
      <div className={`${leaving ? "opacity-0 translate-y-8" : "animate-enter-text"}`}
        style={{ transition: leaving ? "all 0.4s ease-in" : "" }}>
        <button
          onClick={enter}
          className="group relative overflow-hidden border border-white/20 px-16 py-4 tracking-[0.4em] text-sm font-bold uppercase text-white hover:text-black transition-colors duration-500"
        >
          {/* Fill animation */}
          <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
          <span className="relative z-10">ENTER</span>
        </button>
      </div>

      {/* Brand name kecil di bawah */}
      <p className={`absolute bottom-10 text-[10px] tracking-[0.5em] text-white/20 uppercase
        ${leaving ? "opacity-0" : "animate-brand-fade"}`}>
        DUTCH.IND — EST. 2024
      </p>
    </div>
  );
}
