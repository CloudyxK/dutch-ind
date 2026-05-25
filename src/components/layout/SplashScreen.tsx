"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [visible,  setVisible]  = useState(true);
  const [leaving,  setLeaving]  = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [transform, setTransform] = useState("perspective(900px) rotateX(0deg) rotateY(0deg)");
  const [hoverBtn, setHoverBtn] = useState(false);

  const splashRef   = useRef<HTMLDivElement>(null);
  const rafRef      = useRef<number>(0);
  const autoT       = useRef(0);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCur    = useRef({ x: 0, y: 0 });

  useEffect(() => { setMounted(true); }, []);

  /* Auto-sway 3D loop — runs always, no mouse dependency */
  useEffect(() => {
    function loop() {
      autoT.current += 0.007;
      const autoY = Math.sin(autoT.current) * 20;
      const autoX = Math.sin(autoT.current * 0.6) * 8;

      /* Soft mouse influence (tilt only, no lighting) */
      const LERP = 0.05;
      mouseCur.current.x += (mouseTarget.current.x - mouseCur.current.x) * LERP;
      mouseCur.current.y += (mouseTarget.current.y - mouseCur.current.y) * LERP;

      const rx = autoX + mouseCur.current.x;
      const ry = autoY + mouseCur.current.y;

      setTransform(`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* Mouse → 3D tilt only (NO lighting tracking) */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = splashRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    mouseTarget.current = { x: dy * -8, y: dx * 12 };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseTarget.current = { x: 0, y: 0 };
  }, []);

  function enter() {
    setLeaving(true);
    setTimeout(() => setVisible(false), 800);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      ref={splashRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none
        ${leaving ? "animate-splash-leave" : "animate-splash-enter"}`}
      style={{ background: "#000" }}
    >
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />

      {/* ── 3D Logo ── */}
      <div
        className={`relative mb-14 ${leaving ? "animate-logo-leave" : "animate-logo-enter"}`}
        style={{ perspective: "900px" }}
      >
        {/* Static ambient glow — behind the logo, centered, NOT cursor-tracking */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "-60px",
            background:
              "radial-gradient(ellipse 55% 45% at 50% 52%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, transparent 70%)",
            filter: "blur(18px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* 3D transform wrapper */}
        <div
          style={{
            transform,
            transformStyle: "preserve-3d",
            position: "relative",
            zIndex: 1,
            willChange: "transform",
          }}
        >
          {/* Logo — high contrast filter removes PNG background box */}
          <Image
            src="/logo.png"
            alt="DUTCH.IND"
            width={320}
            height={160}
            className="block select-none"
            style={{
              mixBlendMode: "screen",
              filter: "brightness(0.75) contrast(3.5) saturate(0.8)",
              display: "block",
            }}
            priority
            draggable={false}
          />

          {/* Subtle fixed specular sheen — top-left, NOT mouse-tracking */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 55% 40% at 38% 32%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 50%, transparent 70%)",
              mixBlendMode: "overlay",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* ── ENTER button ── */}
      <div
        className={leaving ? "opacity-0 translate-y-8" : "animate-enter-text"}
        style={{ transition: leaving ? "all 0.4s ease-in" : "" }}
      >
        <p className="text-center text-[9px] tracking-[0.6em] text-white/30 uppercase mb-3 font-medium">
          ◈ &nbsp; DUTCH.IND &nbsp; ◈
        </p>

        <button
          onClick={enter}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          className="group relative overflow-hidden"
          style={{
            padding: "14px 56px",
            clipPath: "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)",
            border: "1px solid rgba(255,255,255,0.65)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <span
            className="absolute inset-0 bg-white"
            style={{
              transform:       hoverBtn ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: "bottom",
              transition:      "transform 0.45s cubic-bezier(0.76,0,0.24,1)",
            }}
          />
          <span
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              opacity:    hoverBtn ? 0.06 : 0,
              transition: "opacity 0.3s",
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)",
            }}
          />
          <span
            className="relative z-10 font-black uppercase"
            style={{
              fontSize:      "11px",
              letterSpacing: "0.55em",
              color:         hoverBtn ? "#000" : "#fff",
              transition:    "color 0.3s",
            }}
          >
            MASUK
          </span>
        </button>

        <p className="text-center text-[8px] tracking-[0.4em] text-white/20 uppercase mt-3">
          EST. 2024
        </p>
      </div>

      {/* Bottom stamp */}
      <p
        className={`absolute bottom-8 text-[9px] tracking-[0.6em] text-white/15 uppercase
          ${leaving ? "opacity-0" : "animate-brand-fade"}`}
      >
        DUTCH.IND &nbsp;/&nbsp; STREETWEAR
      </p>
    </div>
  );
}
