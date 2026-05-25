import { NextRequest, NextResponse } from "next/server";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const HEADERS = {
  "User-Agent": "dutch-ind-store/1.0 (adinatafarel2@gmail.com)",
  "Accept-Language": "id,en;q=0.9",
  "Referer": "https://dutch-indd.vercel.app",
};

// GET /api/geocode?q=Samarinda          → forward geocode
// GET /api/geocode?lat=-0.5&lng=117.1   → reverse geocode
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q   = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  try {
    if (q) {
      // Forward geocode
      const url = `${NOMINATIM}/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=id&addressdetails=1`;
      const res = await fetch(url, { headers: HEADERS, next: { revalidate: 60 } });
      if (!res.ok) return NextResponse.json({ error: "Nominatim error" }, { status: 502 });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (lat && lng) {
      // Reverse geocode
      const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`;
      const res = await fetch(url, { headers: HEADERS, next: { revalidate: 10 } });
      if (!res.ok) return NextResponse.json({ error: "Nominatim error" }, { status: 502 });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Butuh parameter q atau lat+lng" }, { status: 400 });
  } catch (e) {
    console.error("[geocode]", e);
    return NextResponse.json({ error: "Gagal menghubungi layanan geocoding" }, { status: 500 });
  }
}
