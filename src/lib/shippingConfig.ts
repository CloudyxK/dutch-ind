import prisma from "@/lib/prisma";

export const SHIPPING_KEYS = [
  "store.lat",
  "store.lng",
  "store.address",
  "shipping.reguler.base",
  "shipping.reguler.freeAbove",
  "shipping.ekspres.base",
  "shipping.sameday.base",
  "shipping.sameday.perKm",
  "shipping.sameday.maxKm",
] as const;

export type ShippingSettings = {
  "store.lat": number;
  "store.lng": number;
  "store.address": string;
  "shipping.reguler.base": number;
  "shipping.reguler.freeAbove": number;
  "shipping.ekspres.base": number;
  "shipping.sameday.base": number;
  "shipping.sameday.perKm": number;
  "shipping.sameday.maxKm": number;
};

// Defaults — safe until admin configures
export const DEFAULTS: ShippingSettings = {
  "store.lat": -6.2088,           // Jakarta Pusat default
  "store.lng": 106.8456,
  "store.address": "Jakarta",
  "shipping.reguler.base": 15000,
  "shipping.reguler.freeAbove": 500000,
  "shipping.ekspres.base": 25000,
  "shipping.sameday.base": 10000,  // minimum fare
  "shipping.sameday.perKm": 3000,  // per km
  "shipping.sameday.maxKm": 30,    // service radius km
};

export async function getShippingSettings(): Promise<ShippingSettings> {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: SHIPPING_KEYS as unknown as string[] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const result = { ...DEFAULTS } as ShippingSettings;
    for (const k of SHIPPING_KEYS) {
      if (map[k] !== undefined) {
        (result as any)[k] =
          k === "store.address" ? map[k] : parseFloat(map[k]);
      }
    }
    return result;
  } catch {
    return { ...DEFAULTS };
  }
}

/** Haversine straight-line distance in km */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcSamedayFare(
  km: number,
  cfg: ShippingSettings
): number {
  const fare = cfg["shipping.sameday.base"] + km * cfg["shipping.sameday.perKm"];
  return Math.round(fare / 500) * 500; // round to nearest 500
}
