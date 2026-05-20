import { NextRequest, NextResponse } from "next/server";
import { getShippingSettings, haversineKm, calcSamedayFare } from "@/lib/shippingConfig";
import { apiLimiter, getIp } from "@/lib/rateLimit";

/** Geocode an address string → { lat, lng } using OpenStreetMap Nominatim (free, no key) */
async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " Indonesia")}&format=json&limit=1&countrycodes=id`;
    const res = await fetch(url, {
      headers: { "User-Agent": "DUTCH.IND-Store/1.0 (adinatafarel2@gmail.com)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const rl = apiLimiter(`ship:${getIp(request)}`);
  if (!rl.success) return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const { city, district, province } = body ?? {};
  if (!city && !province) {
    return NextResponse.json({ error: "Isi minimal kota atau provinsi tujuan" }, { status: 400 });
  }

  // Build query — the more detail, the more accurate
  const query = [district, city, province].filter(Boolean).join(", ");

  const [cfg, destCoords] = await Promise.all([
    getShippingSettings(),
    geocode(query),
  ]);

  if (!destCoords) {
    // Return config-based fallback (cannot geocode)
    return NextResponse.json({
      success: true,
      fallback: true,
      message: `Alamat tidak ditemukan, ongkir dihitung dari tarif dasar`,
      data: {
        distanceKm: null,
        samedayFare: cfg["shipping.sameday.base"],
        regulerFare: cfg["shipping.reguler.base"],
        ekspresFare: cfg["shipping.ekspres.base"],
        freeRegulerAbove: cfg["shipping.reguler.freeAbove"],
      },
    });
  }

  const km = haversineKm(cfg["store.lat"], cfg["store.lng"], destCoords.lat, destCoords.lng);
  const roundedKm = Math.round(km * 10) / 10;

  const samedayFare = km > cfg["shipping.sameday.maxKm"]
    ? null  // out of sameday range
    : calcSamedayFare(km, cfg);

  return NextResponse.json({
    success: true,
    fallback: false,
    data: {
      distanceKm: roundedKm,
      samedayFare,
      outOfRange: km > cfg["shipping.sameday.maxKm"],
      maxKm: cfg["shipping.sameday.maxKm"],
      regulerFare: cfg["shipping.reguler.base"],
      ekspresFare: cfg["shipping.ekspres.base"],
      freeRegulerAbove: cfg["shipping.reguler.freeAbove"],
    },
  });
}
