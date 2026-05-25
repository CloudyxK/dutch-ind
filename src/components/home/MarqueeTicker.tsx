const items = [
  "DUTCH.IND", "·", "STREETWEAR", "·", "SS 2025", "·",
  "PREMIUM", "·", "SAMARINDA", "·", "100% ORIGINAL", "·",
  "KUALITAS PREMIUM", "·", "GAYA OTENTIK", "·", "SEJAK 2025", "·",
  "DUTCH.IND", "·", "STREETWEAR", "·", "SS 2025", "·",
  "PREMIUM", "·", "SAMARINDA", "·", "100% ORIGINAL", "·",
  "KUALITAS PREMIUM", "·", "GAYA OTENTIK", "·", "SEJAK 2025", "·",
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
              letterSpacing: w === "·" ? "0" : "0.38em",
              color:
                w === "·"
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
