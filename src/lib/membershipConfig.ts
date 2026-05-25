import prisma from "@/lib/prisma";
import { RANKS, RANK_MAP, calcRank as calcRankStatic, type RankKey, type RankConfig } from "@/lib/rank";

const SETTING_KEY = "membership.config";

export type LiveRankConfig = Pick<RankConfig,
  "key" | "label" | "icon" | "minSpend" | "discountPct" | "freeShipping" | "description"
  | "color" | "bgClass" | "textClass" | "borderClass"
>;

/** Baca config rank dari DB, fallback ke default jika belum diset */
export async function getMembershipConfig(): Promise<LiveRankConfig[]> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    if (!row) return RANKS;
    const saved = JSON.parse(row.value) as Partial<LiveRankConfig>[];
    // Merge saved values dengan static defaults (preserve warna/style dari kode)
    return RANKS.map((def, i) => {
      const ov = saved[i] ?? {};
      return {
        ...def,
        minSpend:     typeof ov.minSpend     === "number" ? ov.minSpend     : def.minSpend,
        discountPct:  typeof ov.discountPct  === "number" ? ov.discountPct  : def.discountPct,
        freeShipping: Array.isArray(ov.freeShipping)      ? ov.freeShipping : def.freeShipping,
        description:  typeof ov.description  === "string" ? ov.description  : def.description,
      };
    });
  } catch {
    return RANKS;
  }
}

/** Hitung rank dari spend berdasarkan config DB */
export function calcRankFromConfig(totalSpend: number, config: LiveRankConfig[]): RankKey {
  for (let i = config.length - 1; i >= 0; i--) {
    if (totalSpend >= config[i].minSpend) return config[i].key as RankKey;
  }
  return "BRONZE";
}

/** isFreeShipping berdasarkan config DB */
export function isFreeShippingFromConfig(
  rank: RankKey,
  method: string,
  config: LiveRankConfig[]
): boolean {
  const cfg = config.find((r) => r.key === rank);
  if (!cfg) return false;
  const m = method.toLowerCase();
  return cfg.freeShipping.some((f: string) => m.includes(f));
}
