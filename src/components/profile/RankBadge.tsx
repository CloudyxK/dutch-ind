import { RANK_MAP, type RankKey } from "@/lib/rank";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { wrap: string; icon: string; label: string }> = {
  sm: { wrap: "px-2 py-0.5 text-[10px]", icon: "text-xs",  label: "text-[10px]" },
  md: { wrap: "px-3 py-1 text-xs",       icon: "text-sm",  label: "text-xs"     },
  lg: { wrap: "px-4 py-1.5 text-sm",     icon: "text-base",label: "text-sm"     },
};

export function RankBadge({ rank, size = "md" }: { rank: RankKey | string; size?: Size }) {
  const cfg = RANK_MAP[rank as RankKey] ?? RANK_MAP["BRONZE"];
  const s   = sizeMap[size];
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider border ${cfg.borderClass} ${cfg.textClass} ${s.wrap}`}
      style={{ background: `${cfg.color}18` }} // 10% opacity bg
    >
      <span className={s.icon}>{cfg.icon}</span>
      <span className={s.label}>{cfg.label}</span>
    </span>
  );
}

export function LoyaltyBadge({ size = "md" }: { size?: Size }) {
  const s = sizeMap[size];
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider border border-pink-600 text-pink-400 ${s.wrap}`}
      style={{ background: "#ec489918" }}
    >
      <span className={s.icon}>⭐</span>
      <span className={s.label}>Pelanggan Setia</span>
    </span>
  );
}
