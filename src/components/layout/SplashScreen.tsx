"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

/* Number of extrusion depth layers behind the front face */
const EXTRUSION = 14;

export default function SplashScreen() {
  const [visible,   setVisible]   = useState(true);
  const [leaving,   setLeaving]   = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const [hoverBtn,  setHoverBtn]  = useState(false);

  const splashRef    = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);
  const autoT        = useRef(0);
  const mouseTarget  = useRef({ x: 0, y: 0 });
  const mouseCur     = useRef({ x: 0, y: 0 });
  const rxRef        = useRef(0);
  const ryRef        = useRef(0);
  const wrapRef      = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  /* Continuous auto-sway + mouse-tilt RAF loop — writes directly to DOM */
  useEffect(() => {
    function loop() {
      autoT.current += 0.006;
      const autoY = Math.sin(autoT.current) * 18;
      const autoX = Math.sin(autoT.current * 0.55) * 7;

      const LERP = 0.045;
      mouseCur.current.x += (mouseTarget.current.x - mouseCur.current.x) * LERP;
      mouseCur.current.y += (mouseTarget.current.y - mouseCur.current.y) * LERP;

      rxRef.current = autoX + mouseCur.current.x;
      ryRef.current = autoY + mouseCur.current.y;

      if (wrapRef.current) {
        wrapRef.current.style.transform =
          `perspective(1100px) rotateX(${rxRef.current}deg) rotateY(${ryRef.current}deg)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = splashRef.current;
    if (!el) return;
    const r  = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    mouseTarget.current = { x: dy * -9, y: dx * 14 };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseTarget.current = { x: 0, y: 0 };
  }, []);

  function enter() {
    setLeaving(true);
    setTimeout(() => setVisible(false), 900);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      ref={splashRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden
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
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* ── Cinematic ambient glow ── */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "15%", left: "50%",
          transform: "translateX(-50%)",
          width: "700px", height: "500px",
          background:
            "radial-gradient(ellipse 60% 55% at 50% 45%, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 45%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ── Corner brackets ── */}
      {[
        { top: "28px", left: "28px",  border: "border-t border-l" },
        { top: "28px", right: "28px", border: "border-t border-r" },
        { bottom: "28px", left: "28px",  border: "border-b border-l" },
        { bottom: "28px", right: "28px", border: "border-b border-r" },
      ].map((pos, i) => (
        <div
          key={i}
          aria-hidden
          className={`absolute w-5 h-5 ${pos.border} border-white/[0.12] pointer-events-none`}
          style={{ top: pos.top, left: pos.left, bottom: pos.bottom, right: pos.right }}
        />
      ))}

      {/* ── 3D Logo ── */}
      <div
        className={`relative mb-16 ${leaving ? "animate-logo-leave" : "animate-logo-enter"}`}
        style={{ perspective: "1100px" }}
      >
        {/* Tight core glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "-80px",
            background:
              "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, transparent 72%)",
            filter: "blur(24px)",
            pointerEvents: "none",
          }}
        />

        {/* 3D transform wrapper — written via ref, no React re-render */}
        <div
          ref={wrapRef}
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
            position: "relative",
          }}
        >
          {/* ── EXTRUSION layers — stacked behind, each 2.8px deeper ── */}
          {Array.from({ length: EXTRUSION }, (_, i) => (
            <div
              key={i}
              aria-hidden
              style={{
                position:  "absolute",
                inset:     0,
                display:   "flex",
                alignItems: "center",
                justifyContent: "center",
                transform:  `translateZ(${-(i + 1) * 2.8}px)`,
                pointerEvents: "none",
              }}
            >
              <Image
                src="/logo.png"
                alt=""
                width={0}
                height={0}
                sizes="60vw"
                style={{
                  width: "clamp(280px, 42vw, 460px)",
                  height: "auto",
                  display: "block",
                  mixBlendMode: "screen",
                  filter: `brightness(${Math.max(0.08, 0.35 - i * 0.022)}) contrast(4) saturate(0)`,
                  opacity: Math.max(0.1, 0.9 - i * 0.055),
                }}
                draggable={false}
              />
            </div>
          ))}

          {/* ── FRONT FACE — brightest, sits at Z=0 ── */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <Image
              src="/logo.png"
              alt="DUTCH.IND"
              width={0}
              height={0}
              sizes="60vw"
              style={{
                width: "clamp(280px, 42vw, 460px)",
                height: "auto",
                display: "block",
                mixBlendMode: "screen",
                filter: "brightness(1.6) contrast(3) saturate(0.25)",
              }}
              priority
              draggable={false}
            />

            {/* Chrome specular highlight — fixed top-left, NOT cursor-tracking */}
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
      </div>

      {/* ── MASUK button ── */}
      <div
        className={leaving ? "opacity-0 translate-y-6" : "animate-enter-text"}
        style={{ transition: leaving ? "all 0.35s ease-in" : "" }}
      >
        {/* Eyebrow label */}
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

        {/* Button */}
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
          {/* Fill sweep */}
          <span
            aria-hidden
            className="absolute inset-0 bg-white"
            style={{
              transform:       hoverBtn ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: "bottom",
              transition:      "transform 0.42s cubic-bezier(0.76,0,0.24,1)",
            }}
          />
          {/* Scanline overlay on hover */}
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
          {/* Label */}
          <span
            className="relative z-10 font-black uppercase"
            style={{
              fontSize:      "11px",
              letterSpacing: "0.6em",
              color:         hoverBtn ? "#000" : "#fff",
              transition:    "color 0.28s",
              display:       "block",
              paddingLeft:   "0.6em", /* compensate tracking shift */
            }}
          >
            MASUK
          </span>
        </button>

        {/* Sub-label */}
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
