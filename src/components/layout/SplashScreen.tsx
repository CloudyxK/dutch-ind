"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

/* Number of extrusion layers */
const DEPTH = 14;

export default function SplashScreen() {
  const [visible,  setVisible]  = useState(true);
  const [leaving,  setLeaving]  = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);

  const splashRef   = useRef<HTMLDivElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);  // receives rotateY via RAF
  const rafRef      = useRef<number>(0);
  const angleY      = useRef(0.25);    // current rotation angle (radians)
  const angleX      = useRef(0);       // gentle nod
  const timeRef     = useRef(0);       // auto-nod timer
  const velY        = useRef(0.013);   // radians / frame
  const isDragging  = useRef(false);
  const lastX       = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  /* ── RAF loop — writes directly to DOM, no React re-render ── */
  useEffect(() => {
    function tick() {
      timeRef.current += 0.008;

      /* smooth velocity toward auto-spin target */
      velY.current += (0.013 - velY.current) * 0.022;
      angleY.current += velY.current;

      /* gentle oscillating tilt on X so depth layers are visible */
      angleX.current = Math.sin(timeRef.current) * 10;

      if (wrapRef.current) {
        wrapRef.current.style.transform =
          `rotateX(${angleX.current}deg) rotateY(${angleY.current * (180 / Math.PI)}deg)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── drag interaction ── */
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastX.current;
    velY.current = dx * 0.016;
    lastX.current = e.clientX;
  }, []);

  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    lastX.current = e.touches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - lastX.current;
    velY.current = dx * 0.016;
    lastX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => { isDragging.current = false; }, []);

  function enter() {
    setLeaving(true);
    setTimeout(() => setVisible(false), 900);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center
        select-none overflow-hidden
        ${leaving ? "animate-splash-leave" : "animate-splash-enter"}`}
      style={{ background: "#060608" }}
    >
      {/* ── Grain ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.065,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
        }}
      />

      {/* ── Vignette ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.78) 100%)",
        }}
      />

      {/* ── Cinematic ambient glow ── */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "15%", left: "50%",
          transform: "translateX(-50%)",
          width: "500px", height: "400px",
          background:
            "radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* ── Corner brackets ── */}
      {[
        { top: "28px",    left: "28px",  border: "border-t border-l" },
        { top: "28px",    right: "28px", border: "border-t border-r" },
        { bottom: "28px", left: "28px",  border: "border-b border-l" },
        { bottom: "28px", right: "28px", border: "border-b border-r" },
      ].map((pos, i) => (
        <div
          key={i}
          aria-hidden
          className={`absolute w-5 h-5 ${pos.border} border-white/[0.11] pointer-events-none`}
          style={{ top: pos.top, left: pos.left, bottom: pos.bottom, right: pos.right }}
        />
      ))}

      {/* ── 3D Logo — shape preserved as PNG, spins on Y axis ── */}
      <div
        className={`relative mb-16 ${leaving ? "animate-logo-leave" : "animate-logo-enter"}`}
        style={{
          perspective: "1100px",
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        {/* 3D transform wrapper — written via ref (no React re-render) */}
        <div
          ref={wrapRef}
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
            position: "relative",
          }}
        >
          {/* ── EXTRUSION LAYERS — transform applied directly to Image, no box wrapper ── */}
          {Array.from({ length: DEPTH }, (_, i) => (
            <Image
              key={i}
              src="/logo.png"
              alt=""
              width={0}
              height={0}
              sizes="50vw"
              aria-hidden
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "clamp(200px, 28vw, 340px)",
                height: "auto",
                display: "block",
                transform: `translate(-50%, -50%) translateZ(${-(i + 1) * 2.8}px)`,
                mixBlendMode: "screen",
                filter: `brightness(${Math.max(0.1, 0.4 - i * 0.022)}) contrast(4) saturate(0)`,
                opacity: Math.max(0.12, 0.95 - i * 0.055),
                pointerEvents: "none",
              }}
              draggable={false}
            />
          ))}

          {/* ── Circular glow — centred on logo, no rectangular shape ── */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "480px",
              height: "280px",
              background:
                "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 50%, transparent 75%)",
              filter: "blur(28px)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* ── FRONT FACE — brightest, sits at Z=0 ── */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <Image
              src="/logo.png"
              alt="DUTCH.IND"
              width={0}
              height={0}
              sizes="60vw"
              style={{
                width: "clamp(200px, 28vw, 340px)",
                height: "auto",
                display: "block",
                mixBlendMode: "screen",
                filter: "brightness(2.2) contrast(3) saturate(0.2)",
              }}
              priority
              draggable={false}
            />

            {/* Chrome specular highlight */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 60% 45% at 36% 28%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 45%, transparent 70%)",
                mixBlendMode: "overlay",
                pointerEvents: "none",
              }}
            />

            {/* Bottom rim light */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: "-2px",
                inset: "auto 0 -2px 0",
                height: "35%",
                background:
                  "linear-gradient(to top, rgba(255,255,255,0.06) 0%, transparent 100%)",
                mixBlendMode: "overlay",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Drag hint */}
        <p
          className="absolute -bottom-7 left-0 right-0 text-center text-[8px] uppercase tracking-[0.55em]"
          style={{ color: "rgba(255,255,255,0.18)" }}
        >
          Drag to spin
        </p>
      </div>

      {/* ── MASUK button ── */}
      <div
        className={leaving ? "opacity-0 translate-y-6" : "animate-enter-text"}
        style={{ transition: leaving ? "all 0.35s ease-in" : "" }}
      >
        <p
          className="text-center uppercase mb-4"
          style={{
            fontSize: "9px",
            letterSpacing: "0.65em",
            color: "rgba(255,255,255,0.22)",
            fontWeight: 500,
          }}
        >
          ◈ &nbsp; DUTCH.IND &nbsp; ◈
        </p>

        <button
          onClick={enter}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          className="group relative overflow-hidden"
          style={{
            padding: "15px 64px",
            clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
            border: `1px solid rgba(255,255,255,${hoverBtn ? 0.9 : 0.5})`,
            background: "transparent",
            cursor: "pointer",
            transition: "border-color 0.3s",
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-white"
            style={{
              transform:       hoverBtn ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: "bottom",
              transition:      "transform 0.42s cubic-bezier(0.76,0,0.24,1)",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity:    hoverBtn ? 0.07 : 0,
              transition: "opacity 0.3s",
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)",
            }}
          />
          <span
            className="relative z-10 font-black uppercase"
            style={{
              fontSize:      "11px",
              letterSpacing: "0.6em",
              color:         hoverBtn ? "#000" : "#fff",
              transition:    "color 0.28s",
              display:       "block",
              paddingLeft:   "0.6em",
            }}
          >
            MASUK
          </span>
        </button>

        <p
          className="text-center uppercase mt-3"
          style={{
            fontSize: "8px",
            letterSpacing: "0.45em",
            color: "rgba(255,255,255,0.15)",
          }}
        >
          EST. 2024
        </p>
      </div>

      {/* ── Bottom stamp ── */}
      <p
        className={`absolute bottom-7 uppercase ${leaving ? "opacity-0" : "animate-brand-fade"}`}
        style={{
          fontSize: "8px",
          letterSpacing: "0.65em",
          color: "rgba(255,255,255,0.12)",
        }}
      >
        DUTCH.IND &nbsp;/&nbsp; STREETWEAR
      </p>
    </div>
  );
}
