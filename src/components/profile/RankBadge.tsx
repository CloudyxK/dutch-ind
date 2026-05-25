import { RANK_MAP, type RankKey } from "@/lib/rank";
import RankIcon from "./RankIcon";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { wrap: string; iconSize: number; label: string }> = {
  sm: { wrap: "px-2 py-0.5 text-[10px]", iconSize: 14, label: "text-[10px]" },
  md: { wrap: "px-3 py-1   text-xs",     iconSize: 18, label: "text-xs"     },
  lg: { wrap: "px-4 py-1.5 text-sm",     iconSize: 22, label: "text-sm"     },
};

export function RankBadge({ rank, size = "md" }: { rank: RankKey | string; size?: Size }) {
  const cfg = RANK_MAP[rank as RankKey] ?? RANK_MAP["BRONZE"];
  const s   = sizeMap[size];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border ${cfg.borderClass} ${cfg.textClass} ${s.wrap}`}
      style={{ background: `${cfg.color}18` }}
    >
      <RankIcon rank={rank as RankKey} size={s.iconSize} />
      <span className={s.label}>{cfg.label}</span>
    </span>
  );
}

export function LoyaltyBadge({ size = "md" }: { size?: Size }) {
  const s = sizeMap[size];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border border-pink-600 text-pink-400 ${s.wrap}`}
      style={{ background: "#ec489918" }}
    >
      {/* Star SVG */}
      <svg width={s.iconSize} height={s.iconSize} viewBox="0 0 20 20" fill="none">
        <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 14.27l-4.77 2.44.91-5.32L2.27 7.62l5.34-.78L10 2z"
          fill="#f9a8d4" stroke="#ec4899" strokeWidth="1" strokeLinejoin="round"/>
      </svg>
      <span className={s.label}>Pelanggan Setia</span>
    </span>
  );
}
