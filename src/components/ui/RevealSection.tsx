"use client";

import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
}

export default function RevealSection({ children, delay = 0, className = "", direction = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "-60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const extraStyle: React.CSSProperties = {
    "--reveal-delay": `${delay}s`,
    ...(direction === "left"  && { transform: "translateX(-28px)" }),
    ...(direction === "right" && { transform: "translateX(28px)"  }),
    ...(direction === "none"  && { transform: "none"              }),
  } as React.CSSProperties;

  return (
    <div ref={ref} className={`reveal-on-scroll ${className}`} style={extraStyle}>
      {children}
    </div>
  );
}
