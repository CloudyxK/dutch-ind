// =============================================
// DUTCH.IND — Member Rank System
// =============================================

export type RankKey = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export type RankConfig = {
  key:          RankKey;
  label:        string;
  minSpend:     number;
  maxSpend:     number | null; // null = no upper limit
  color:        string;        // Tailwind-safe hex / CSS color
  bgClass:      string;        // Tailwind gradient class
  textClass:    string;
  borderClass:  string;
  icon:         string;        // emoji icon
  discountPct:  number;        // % diskon otomatis dari subtotal
  freeShipping: ("reguler" | "ekspres" | "sameday")[]; // metode ongkir gratis
  description:  string;        // keuntungan singkat
};

export const RANKS: RankConfig[] = [
  {
    key:         "BRONZE",
    label:       "Bronze",
    minSpend:    0,
    maxSpend:    499_999,
    color:       "#cd7f32",
    bgClass:     "from-amber-900 to-amber-700",
    textClass:   "text-amber-600",
    borderClass: "border-amber-700",
    icon:        "🥉",
    discountPct: 0,
    freeShipping: [],
    description: "Member baru — mulai berbelanja untuk naik level!",
  },
  {
    key:         "SILVER",
    label:       "Silver",
    minSpend:    500_000,
    maxSpend:    1_999_999,
    color:       "#94a3b8",
    bgClass:     "from-slate-600 to-slate-400",
    textClass:   "text-slate-400",
    borderClass: "border-slate-500",
    icon:        "🥈",
    discountPct: 3,
    freeShipping: [],
    description: "Diskon 3% setiap transaksi",
  },
  {
    key:         "GOLD",
    label:       "Gold",
    minSpend:    2_000_000,
    maxSpend:    4_999_999,
    color:       "#fbbf24",
    bgClass:     "from-yellow-700 to-yellow-500",
    textClass:   "text-yellow-400",
    borderClass: "border-yellow-500",
    icon:        "🥇",
    discountPct: 5,
    freeShipping: ["reguler"],
    description: "Diskon 5% + Gratis Ongkir Reguler",
  },
  {
    key:         "PLATINUM",
    label:       "Platinum",
    minSpend:    5_000_000,
    maxSpend:    9_999_999,
    color:       "#a78bfa",
    bgClass:     "from-violet-800 to-violet-500",
    textClass:   "text-violet-400",
    borderClass: "border-violet-500",
    icon:        "💎",
    discountPct: 8,
    freeShipping: ["reguler", "ekspres"],
    description: "Diskon 8% + Gratis Reguler & Ekspres",
  },
  {
    key:         "DIAMOND",
    label:       "Diamond",
    minSpend:    10_000_000,
    maxSpend:    null,
    color:       "#22d3ee",
    bgClass:     "from-cyan-700 to-cyan-400",
    textClass:   "text-cyan-400",
    borderClass: "border-cyan-500",
    icon:        "💠",
    discountPct: 10,
    freeShipping: ["reguler", "ekspres", "sameday"],
    description: "Diskon 10% + Gratis Semua Ongkir",
  },
];

export const RANK_MAP: Record<RankKey, RankConfig> = Object.fromEntries(
  RANKS.map((r) => [r.key, r])
) as Record<RankKey, RankConfig>;

/** Hitung rank dari total spend */
export function calcRank(totalSpend: number): RankKey {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalSpend >= RANKS[i].minSpend) return RANKS[i].key;
  }
  return "BRONZE";
}

/** Rank berikutnya (null = sudah Diamond) */
export function nextRank(current: RankKey): RankConfig | null {
  const idx = RANKS.findIndex((r) => r.key === current);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

/** Progress ke rank berikutnya (0–100) */
export function rankProgress(totalSpend: number, current: RankKey): number {
  const cfg  = RANK_MAP[current];
  const next = nextRank(current);
  if (!next) return 100;
  const range = next.minSpend - cfg.minSpend;
  const done  = totalSpend - cfg.minSpend;
  return Math.min(100, Math.round((done / range) * 100));
}

/** Apakah metode shipping gratis untuk rank ini? */
export function isFreeShipping(rank: RankKey, method: string): boolean {
  const cfg = RANK_MAP[rank];
  const m   = method.toLowerCase();
  return cfg.freeShipping.some((f) => m.includes(f));
}
