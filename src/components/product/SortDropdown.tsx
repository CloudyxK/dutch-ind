"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "popular", label: "Terpopuler" },
  { value: "price_asc", label: "Harga Terendah" },
  { value: "price_desc", label: "Harga Tertinggi" },
] as const;

export default function SortDropdown() {
  const router = useRouter();
  const sp = useSearchParams();
  const currentSort = sp.get("sort") || "newest";
  const currentLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? "Terbaru";

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    // Reset to page 1 on sort change
    params.delete("page");
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 border border-brand-gray-700 text-xs uppercase tracking-wider text-brand-gray-400 hover:border-white hover:text-white transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 z-30 min-w-[160px] bg-brand-gray-900 border border-brand-gray-700 shadow-xl"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={currentSort === opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider transition-colors ${
                currentSort === opt.value
                  ? "text-white bg-white/10 font-semibold"
                  : "text-brand-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
