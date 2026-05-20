const words = [
  "DUTCH.IND", "×", "STREETWEAR", "×", "KOLEKSI 2025", "×",
  "PREMIUM", "×", "INDONESIA", "×", "ORIGINAL", "×",
  "DUTCH.IND", "×", "STREETWEAR", "×", "KOLEKSI 2025", "×",
  "PREMIUM", "×", "INDONESIA", "×", "ORIGINAL", "×",
];

export default function MarqueeTicker() {
  return (
    <div className="relative overflow-hidden py-3.5"
         style={{ background: "#040406", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex whitespace-nowrap" style={{ animation: "marquee-left 28s linear infinite" }}>
        {[...words, ...words].map((w, i) => (
          <span key={i}
                className="inline-flex items-center font-display text-[11px] uppercase tracking-[0.3em] mx-5"
                style={{ color: w === "×" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.22)" }}>
            {w}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
