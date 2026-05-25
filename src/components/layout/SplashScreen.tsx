"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [visible, setVisible]   = useState(true);
  const [leaving, setLeaving]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [tilt, setTilt]         = useState({ x: 0, y: 0 });
  const [glare, setGlare]       = useState({ x: 50, y: 50 });
  const [hoverBtn, setHoverBtn] = useState(false);
  const splashRef = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => { setMounted(true); }, []);

  /* Smooth spring-lerp for tilt */
  useEffect(() => {
    function loop() {
      const LERP = 0.08;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * LERP;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * LERP;
      setTilt({ x: currentRef.current.x, y: currentRef.current.y });
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = splashRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    targetRef.current = { x: dy * -12, y: dx * 16 };
    setGlare({ x: 50 + dx * 35, y: 50 + dy * 35 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
    setGlare({ x: 50, y: 50 });
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
      {/* Background grain */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />

      {/* ── 3D Logo ── */}
      <div
        className={`relative mb-14 cursor-default ${leaving ? "animate-logo-leave" : "animate-logo-enter"}`}
        style={{ perspective: "900px" }}
      >
        <div
          style={{
            transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "filter 0.12s ease-out",
            transformStyle: "preserve-3d",
            position: "relative",
          }}
        >
          {/* Cast shadow layer — shifts opposite to tilt */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              transform: `translateZ(-1px) translateX(${tilt.y * 3}px) translateY(${-tilt.x * 3}px)`,
              filter: "blur(28px) brightness(0)",
              opacity: 0.65,
              pointerEvents: "none",
            }}
          >
            <Image src="/logo.png" alt="" width={300} height={150} draggable={false} priority />
          </div>

          {/* Main logo image */}
          <Image
            src="/logo.png"
            alt="DUTCH.IND"
            width={300}
            height={150}
            className="relative select-none"
            style={{
              filter: `
                drop-shadow(${-tilt.y * 2}px ${tilt.x * 2}px 0px rgba(255,255,255,0.55))
                drop-shadow(${-tilt.y * 0.5}px ${tilt.x * 0.5}px 30px rgba(255,255,255,0.18))
              `,
            }}
            priority
            draggable={false}
          />

          {/* Specular glare overlay */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)`,
              mixBlendMode: "overlay",
              pointerEvents: "none",
            }}
          />

          {/* Edge highlight (rim light) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -1,
              borderRadius: 2,
              border: `1px solid rgba(255,255,255,${Math.abs(tilt.y) * 0.03 + 0.04})`,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* ── ENTER button — streetwear aesthetic ── */}
      <div
        className={leaving ? "opacity-0 translate-y-8" : "animate-enter-text"}
        style={{ transition: leaving ? "all 0.4s ease-in" : "" }}
      >
        {/* Overline label */}
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
            border: "1px solid rgba(255,255,255,0.7)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {/* Fill from bottom */}
          <span
            className="absolute inset-0 bg-white"
            style={{
              transform: hoverBtn ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: "bottom",
              transition: "transform 0.45s cubic-bezier(0.76,0,0.24,1)",
            }}
          />

          {/* Scanline texture on hover */}
          <span
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              opacity: hoverBtn ? 0.06 : 0,
              transition: "opacity 0.3s",
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)",
            }}
          />

          <span
            className="relative z-10 font-black uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "0.55em",
              color: hoverBtn ? "#000" : "#fff",
              transition: "color 0.3s",
            }}
          >
            ENTER
          </span>
        </button>

        {/* Underline label */}
        <p className="text-center text-[8px] tracking-[0.4em] text-white/20 uppercase mt-3">
          EST. 2024
        </p>
      </div>

      {/* Bottom brand stamp */}
      <p
        className={`absolute bottom-8 text-[9px] tracking-[0.6em] text-white/15 uppercase
          ${leaving ? "opacity-0" : "animate-brand-fade"}`}
      >
        DUTCH.IND &nbsp;/&nbsp; STREETWEAR
      </p>
    </div>
  );
}
