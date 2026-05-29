"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Kembali ke atas"
      className="fixed right-4 sm:right-6 z-40 w-10 h-10 bg-brand-gray-800 border border-brand-gray-600 hover:bg-white hover:text-black hover:border-white flex items-center justify-center transition-all duration-200 group"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
    >
      <ChevronUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
    </button>
  );
}
