"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [mounted, setMounted]     = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden]   = useState(false);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const springCfg = { stiffness: 90, damping: 22, mass: 0.55 };
  const ringX = useSpring(mouseX, springCfg);
  const ringY = useSpring(mouseY, springCfg);

  /* Canvas-based trail */
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const trailRef   = useRef<{ x: number; y: number; age: number }[]>([]);
  const rafRef     = useRef<number>(0);

  useEffect(() => {
    setMounted(true);

    /* Skip on touch devices */
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      trailRef.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trailRef.current.length > 18) trailRef.current.shift();
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      setIsPointer(!!t.closest("a, button, [role='button'], label, input, select"));
    };

    const onLeave = () => setIsHidden(true);
    const onEnter = () => setIsHidden(false);

    document.addEventListener("mouseout",  onLeave);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);

    /* Draw trail */
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      trailRef.current.forEach((pt, i) => {
        pt.age += 1;
        const progress = i / trailRef.current.length;
        const alpha    = Math.max(0, progress * 0.22 - pt.age * 0.014);
        const radius   = progress * 3.5;
        if (alpha <= 0) return;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });
      trailRef.current = trailRef.current.filter((p) => p.age < 16);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout",  onLeave);
      document.removeEventListener("mouseover", onEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!mounted) return null;

  const hidden = isHidden ? 0 : 1;

  return (
    <>
      {/* Trail canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 99995 }}
      />

      {/* Precise dot */}
      <motion.div
        className="fixed pointer-events-none rounded-full bg-white"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 99999,
          opacity: hidden,
        }}
        animate={{ width: isPointer ? 8 : 5, height: isPointer ? 8 : 5 }}
        transition={{ duration: 0.15 }}
      />

      {/* Lagging ring */}
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 99998,
          border: "1px solid rgba(255,255,255,0.5)",
          opacity: hidden,
        }}
        animate={{
          width:  isPointer ? 48 : 30,
          height: isPointer ? 48 : 30,
          borderColor: isPointer
            ? "rgba(255,255,255,0.85)"
            : "rgba(255,255,255,0.4)",
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
