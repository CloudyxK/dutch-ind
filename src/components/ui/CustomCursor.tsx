"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef    = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    const dot    = dotRef.current;
    const ring   = ringRef.current;
    const canvas = canvasRef.current;
    if (!dot || !ring || !canvas) return;

    /* Inject cursor:none — most reliable approach */
    let styleEl = document.getElementById("custom-cursor-css") as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "custom-cursor-css";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = "*, *::before, *::after { cursor: none !important; }";

    const ctx = canvas.getContext("2d")!;

    let mx = -300, my = -300;
    let rx = -300, ry = -300;
    let pointer = false;
    let raf = 0;
    let hasMoused = false;

    /* Canvas sizing */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* Trail */
    const trail: { x: number; y: number; age: number }[] = [];

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!hasMoused) {
        rx = mx; ry = my; /* snap ring on first move so it doesn't lerp from off-screen */
        hasMoused = true;
        dot.style.opacity  = "1";
        ring.style.opacity = "1";
        canvas.style.opacity = "1";
      }
      trail.push({ x: mx, y: my, age: 0 });
      if (trail.length > 22) trail.shift();
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      pointer = !!t.closest("a, button, [role='button'], label, input, select, textarea");
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);

    const LERP = 0.12;

    const tick = () => {
      /* dot: precise */
      dot.style.transform = `translate(${mx - 3}px,${my - 3}px)`;

      /* ring: spring lerp */
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      const rs = pointer ? 22 : 14;
      ring.style.width       = `${rs * 2}px`;
      ring.style.height      = `${rs * 2}px`;
      ring.style.transform   = `translate(${rx - rs}px,${ry - rs}px)`;
      ring.style.borderColor = pointer
        ? "rgba(255,255,255,0.85)"
        : "rgba(255,255,255,0.45)";

      /* trail canvas */
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
      /* prune dead trail points */
      let k = 0;
      while (k < trail.length && trail[k].age > 18) k++;
      if (k > 0) trail.splice(0, k);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      /* Keep the style tag so cursor:none stays during React Strict Mode double-invoke */
    };
  }, []);

  /* Always render — never return null. Elements are invisible until mouse moves. */
  return (
    <>
      {/* Trail canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed", inset: 0,
          pointerEvents: "none",
          zIndex: 99994,
          opacity: 0,
          transition: "opacity 0.15s",
        }}
      />

      {/* Dot */}
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
          opacity: 0,
          transition: "opacity 0.15s",
        }}
      />

      {/* Ring */}
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
          opacity: 0,
          transition: "width 0.18s ease, height 0.18s ease, border-color 0.18s ease, opacity 0.15s",
        }}
      />
    </>
  );
}
