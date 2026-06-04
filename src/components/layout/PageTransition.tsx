"use client";

// Lightweight CSS-only page transition — no framer-motion runtime overhead
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
