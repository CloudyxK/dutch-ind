import { NextRequest } from "next/server";

const RAJAONGKIR_KEY = process.env.RAJAONGKIR_KEY;
const ORIGIN_CITY = process.env.RAJAONGKIR_ORIGIN_CITY || "444"; // Samarinda = 444

export async function POST(req: NextRequest) {
  const { destination, weight, courier } = await req.json();

  if (!RAJAONGKIR_KEY) {
    // Fallback flat rates if no API key
    const fallback: Record<string, number> = {
      "jne": 25000, "tiki": 22000, "pos": 20000, "sicepat": 23000, "jnt": 22000
    };
    return Response.json({ cost: fallback[courier?.toLowerCase()] ?? 25000, source: "fallback" });
  }

  try {
    const res = await fetch("https://api.rajaongkir.com/starter/cost", {
      method: "POST",
      headers: {
        "key": RAJAONGKIR_KEY,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        origin: ORIGIN_CITY,
        destination: String(destination),
        weight: String(Math.max(weight || 300, 1)),
        courier: courier || "jne",
      }),
    });
    const data = await res.json();
    const costs = data?.rajaongkir?.results?.[0]?.costs ?? [];
    const regular = costs.find((c: any) => c.service === "REG") || costs[0];
    return Response.json({ cost: regular?.cost?.[0]?.value ?? 25000, service: regular?.service, etd: regular?.cost?.[0]?.etd });
  } catch {
    return Response.json({ cost: 25000, source: "fallback" });
  }
}
