import { NextRequest } from "next/server";

const RAJAONGKIR_KEY = process.env.RAJAONGKIR_KEY;

export async function GET(req: NextRequest) {
  const province = req.nextUrl.searchParams.get("province");
  if (!RAJAONGKIR_KEY) return Response.json({ cities: [] });

  try {
    const url = province
      ? `https://api.rajaongkir.com/starter/city?province=${province}`
      : "https://api.rajaongkir.com/starter/city";
    const res = await fetch(url, { headers: { key: RAJAONGKIR_KEY } });
    const data = await res.json();
    return Response.json({ cities: data?.rajaongkir?.results ?? [] });
  } catch {
    return Response.json({ cities: [] });
  }
}

export async function POST() {
  if (!RAJAONGKIR_KEY) return Response.json({ provinces: [] });
  try {
    const res = await fetch("https://api.rajaongkir.com/starter/province", {
      headers: { key: RAJAONGKIR_KEY },
    });
    const data = await res.json();
    return Response.json({ provinces: data?.rajaongkir?.results ?? [] });
  } catch {
    return Response.json({ provinces: [] });
  }
}
