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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef  = useRef<{ x: number; y: number; age: number }[]>([]);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    /* Skip on touch/mobile devices */
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    setMounted(true);

    /* Hide native cursor via JS — only when component is running */
    document.body.style.cursor = "none";
    document.documentElement.style.cursor = "none";

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

    const onLeaveDoc = () => setIsHidden(true);
    const onEnterDoc = () => setIsHidden(false);

    document.addEventListener("mouseout",  onLeaveDoc);
    document.addEventListener("mouseover", onEnterDoc);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);

    /* Trail draw loop */
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      trailRef.current.forEach((pt, i) => {
        pt.age += 1;
        const progress = i / trailRef.current.length;
        const alpha    = Math.max(0, progress * 0.2 - pt.age * 0.013);
        const radius   = progress * 3;
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
      /* Restore native cursor on unmount */
      document.body.style.cursor = "";
      document.documentElement.style.cursor = "";
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout",  onLeaveDoc);
      document.removeEventListener("mouseover", onEnterDoc);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!mounted) return null;

  const opacity = isHidden ? 0 : 1;

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
          opacity,
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
          opacity,
        }}
        animate={{
          width:       isPointer ? 48 : 30,
          height:      isPointer ? 48 : 30,
          borderColor: isPointer ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
        }}
        transition={{ duration: 0.2 }}
        initial={{
          width: 30,
          height: 30,
          border: "1px solid rgba(255,255,255,0.4)",
        }}
      />
    </>
  );
}
