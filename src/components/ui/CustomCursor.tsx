"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const dotRef    = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    /* Skip on touch/mobile */
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    setMounted(true);

    /* Inject cursor:none globally via stylesheet — most reliable approach */
    const style = document.createElement("style");
    style.id = "custom-cursor-css";
    style.textContent = "html, html *, html *::before, html *::after { cursor: none !important; }";
    document.head.appendChild(style);

    const dot    = dotRef.current!;
    const ring   = ringRef.current!;
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    let mx = -200, my = -200;   /* cursor pos */
    let rx = -200, ry = -200;   /* ring pos (lerped) */
    let pointer = false;
    let raf = 0;

    /* canvas sizing */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* Trail points */
    const trail: { x: number; y: number; age: number }[] = [];

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      trail.push({ x: mx, y: my, age: 0 });
      if (trail.length > 22) trail.shift();
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      pointer = !!t.closest("a, button, [role='button'], label, input, select");
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);

    const LERP = 0.1;

    const tick = () => {
      /* --- dot: precise --- */
      dot.style.transform  = `translate(${mx - 3}px, ${my - 3}px)`;

      /* --- ring: spring lerp --- */
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      const rs = pointer ? 22 : 14;
      ring.style.width     = `${rs * 2}px`;
      ring.style.height    = `${rs * 2}px`;
      ring.style.transform = `translate(${rx - rs}px, ${ry - rs}px)`;
      ring.style.borderColor = pointer
        ? "rgba(255,255,255,0.85)"
        : "rgba(255,255,255,0.45)";

      /* --- trail canvas --- */
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let i = trail.length;
      while (i--) {
        const pt = trail[i];
        pt.age++;
        const progress = i / trail.length;
        const alpha    = Math.max(0, progress * 0.22 - pt.age * 0.015);
        const radius   = progress * 3.5;
        if (alpha <= 0) continue;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }
      /* prune dead points */
      let k = 0;
      while (k < trail.length && trail[k].age > 18) k++;
      if (k > 0) trail.splice(0, k);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      style.remove();
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Trail */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed", inset: 0,
          pointerEvents: "none", zIndex: 99994,
        }}
      />

      {/* Dot — precise */}
      <div
        ref={dotRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 6, height: 6,
          borderRadius: "50%",
          background: "white",
          pointerEvents: "none",
          zIndex: 99999,
          willChange: "transform",
        }}
      />

      {/* Ring — spring lag */}
      <div
        ref={ringRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 28, height: 28,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.45)",
          pointerEvents: "none",
          zIndex: 99998,
          willChange: "transform",
          transition: "width 0.18s ease, height 0.18s ease, border-color 0.18s ease",
        }}
      />
    </>
  );
}
