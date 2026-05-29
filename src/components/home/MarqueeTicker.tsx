const items = [
  "DUTCH.IND", "Â·", "STREETWEAR", "Â·", "SS 2026", "Â·",
  "PREMIUM", "Â·", "SAMARINDA", "Â·", "100% ORIGINAL", "Â·",
  "KUALITAS PREMIUM", "Â·", "GAYA OTENTIK", "Â·", "SEJAK 2026", "Â·",
  "DUTCH.IND", "Â·", "STREETWEAR", "Â·", "SS 2026", "Â·",
  "PREMIUM", "Â·", "SAMARINDA", "Â·", "100% ORIGINAL", "Â·",
  "KUALITAS PREMIUM", "Â·", "GAYA OTENTIK", "Â·", "SEJAK 2026", "Â·",
];

export default function MarqueeTicker() {
  return (
    <div
      className="relative overflow-hidden py-3"
      style={{
        background: "#040406",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee-left 40s linear infinite" }}
      >
        {[...items, ...items].map((w, i) => (
          <span
            key={i}
            className="inline-flex items-center font-display text-[10px] uppercase mx-4"
            style={{
              letterSpacing: w === "Â·" ? "0" : "0.38em",
              color:
                w === "Â·"
                  ? "rgba(255,255,255,0.14)"
                  : "rgba(255,255,255,0.35)",
            }}
          >
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
