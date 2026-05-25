"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function SplashScreen() {
  const [visible,  setVisible]  = useState(true);
  const [leaving,  setLeaving]  = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);

  /* ── canvas + coin state ── */
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const angleY      = useRef(0.35);          // start slightly angled
  const velY        = useRef(0.013);         // radians / frame
  const isDragging  = useRef(false);
  const lastX       = useRef(0);
  const logoImg     = useRef<HTMLImageElement | null>(null);
  const logoReady   = useRef(false);
  const coinR       = useRef(140);           // updated on mount
  const rimT        = useRef(22);

  useEffect(() => { setMounted(true); }, []);

  /* pre-load logo */
  useEffect(() => {
    const img = new window.Image();
    img.src = "/logo.png";
    img.onload = () => { logoImg.current = img; logoReady.current = true; };
  }, []);

  /* ── size + render loop — single effect after mounted so canvasRef is live ── */
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* size canvas first */
    const vw = window.innerWidth;
    const R  = Math.min(Math.round(vw * 0.22), 148);
    const T  = 22;
    coinR.current = R;
    rimT.current  = T;
    const S  = (R + T) * 2 + 60;
    canvas.width  = S;
    canvas.height = S + 24;
    const ctx = canvas.getContext("2d")!;

    function draw() {
      const W  = canvas!.width;
      const H  = canvas!.height;
      const cx = W / 2;
      const cy = H / 2 - 8;           /* slightly above centre so shadow fits */
      const R  = coinR.current;
      const T  = rimT.current;

      ctx.clearRect(0, 0, W, H);

      const a    = angleY.current;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const fW   = R * Math.abs(cosA); /* face half-width on screen */

      /* ── ambient glow behind coin ── */
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
      glowGrad.addColorStop(0,   "rgba(255,255,255,0.045)");
      glowGrad.addColorStop(0.5, "rgba(255,255,255,0.01)");
      glowGrad.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H);

      /* ── drop shadow (ellipse below coin) ── */
      ctx.save();
      ctx.filter = "blur(18px)";
      ctx.beginPath();
      const shadowW = (R + T) * Math.abs(cosA) * 0.85 + T * Math.abs(sinA);
      ctx.ellipse(cx, cy + R + T + 6, Math.max(shadowW, 10), 11, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fill();
      ctx.filter = "none";
      ctx.restore();

      /* ── RIM ──────────────────────────────────────────────── */
      if (Math.abs(sinA) > 0.008) {
        const rimOff = T * sinA;       /* back-face offset in screen X */

        ctx.beginPath();
        if (sinA > 0) {
          /* right rim visible */
          ctx.ellipse(cx, cy, fW || 0.5, R, 0, -Math.PI / 2, Math.PI / 2, false);
          ctx.ellipse(cx + rimOff, cy, fW || 0.5, R, 0, Math.PI / 2, -Math.PI / 2, true);
        } else {
          /* left rim visible */
          ctx.ellipse(cx, cy, fW || 0.5, R, 0, Math.PI / 2, -Math.PI / 2, false);
          ctx.ellipse(cx + rimOff, cy, fW || 0.5, R, 0, -Math.PI / 2, Math.PI / 2, true);
        }
        ctx.closePath();

        /* metallic chrome gradient along Y */
        const rimGrad = ctx.createLinearGradient(cx, cy - R, cx, cy + R);
        rimGrad.addColorStop(0,    "#111");
        rimGrad.addColorStop(0.12, "#2e2e2e");
        rimGrad.addColorStop(0.28, "#5a5a5a");
        rimGrad.addColorStop(0.5,  "#6e6e6e");
        rimGrad.addColorStop(0.72, "#5a5a5a");
        rimGrad.addColorStop(0.88, "#2e2e2e");
        rimGrad.addColorStop(1,    "#0a0a0a");
        ctx.fillStyle = rimGrad;
        ctx.fill();

        /* highlight edge on the far face arc */
        ctx.beginPath();
        const rimEdgeX = cx + rimOff;
        if (sinA > 0) {
          ctx.ellipse(rimEdgeX, cy, fW || 0.5, R, 0, -Math.PI / 2, Math.PI / 2, false);
        } else {
          ctx.ellipse(rimEdgeX, cy, fW || 0.5, R, 0, Math.PI / 2, -Math.PI / 2, false);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* ── COIN FACE ────────────────────────────────────────── */
      if (fW > 0.5) {
        ctx.save();

        /* clip to ellipse */
        ctx.beginPath();
        ctx.ellipse(cx, cy, fW, R, 0, 0, Math.PI * 2);
        ctx.clip();

        /* dark metallic face background */
        const bgGrad = ctx.createRadialGradient(
          cx - fW * 0.18, cy - R * 0.22, 0,
          cx, cy, R * 1.15
        );
        bgGrad.addColorStop(0,   "#1e1e1e");
        bgGrad.addColorStop(0.55,"#0e0e0e");
        bgGrad.addColorStop(1,   "#060606");
        ctx.fillStyle = bgGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, fW, R, 0, 0, Math.PI * 2);
        ctx.fill();

        /* logo texture — screen blend */
        if (logoReady.current && logoImg.current) {
          const nat   = logoImg.current;
          const lw    = fW * 1.72;
          const lh    = lw * (nat.naturalHeight / nat.naturalWidth);
          ctx.globalCompositeOperation = "screen";
          ctx.filter = "brightness(2.2) contrast(3.5) saturate(0.15)";
          ctx.drawImage(nat, cx - lw / 2, cy - lh / 2, lw, lh);
          ctx.filter  = "none";
          ctx.globalCompositeOperation = "source-over";
        }

        /* back-face darkening when coin flips */
        if (cosA < 0) {
          ctx.fillStyle = "rgba(0,0,0,0.78)";
          ctx.beginPath();
          ctx.ellipse(cx, cy, fW, R, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        /* top-left specular highlight */
        const specGrad = ctx.createRadialGradient(
          cx - fW * 0.28, cy - R * 0.32, 0,
          cx,             cy,             R * 1.05
        );
        const sa = Math.abs(cosA) * 0.24;
        specGrad.addColorStop(0,   `rgba(255,255,255,${sa})`);
        specGrad.addColorStop(0.45,`rgba(255,255,255,${(sa * 0.28).toFixed(3)})`);
        specGrad.addColorStop(1,   "rgba(255,255,255,0)");
        ctx.fillStyle = specGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, fW, R, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        /* chrome ring on face perimeter */
        ctx.beginPath();
        ctx.ellipse(cx, cy, fW, R, 0, 0, Math.PI * 2);
        const edgeGrad = ctx.createLinearGradient(cx - fW, cy, cx + fW, cy);
        edgeGrad.addColorStop(0,   "rgba(255,255,255,0.55)");
        edgeGrad.addColorStop(0.28,"rgba(255,255,255,0.12)");
        edgeGrad.addColorStop(0.72,"rgba(255,255,255,0.12)");
        edgeGrad.addColorStop(1,   "rgba(255,255,255,0.55)");
        ctx.strokeStyle = edgeGrad;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    /* RAF tick */
    function tick() {
      /* smoothly approach target auto-spin speed */
      velY.current += (0.013 - velY.current) * 0.018;
      angleY.current += velY.current;
      draw();
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mounted]);

  /* ── drag interaction ── */
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastX.current;
    velY.current = dx * 0.018;
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
    velY.current = dx * 0.018;
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

      {/* ── 3D Coin logo ── */}
      <div
        className={`relative mb-14 ${leaving ? "animate-logo-leave" : "animate-logo-enter"}`}
        style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            /* scale canvas to responsive width without distortion */
            width:  "clamp(240px, 44vw, 340px)",
            height: "auto",
          }}
        />

        {/* Drag hint */}
        <p
          className="absolute -bottom-6 left-0 right-0 text-center text-[8px] uppercase tracking-[0.55em]"
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
        {/* Eyebrow */}
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
          {/* Scanline */}
          <span
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: hoverBtn ? 0.07 : 0,
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
              paddingLeft:   "0.6em",
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
