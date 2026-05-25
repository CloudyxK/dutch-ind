import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RANKS } from "@/lib/rank";

const SETTING_KEY = "membership.config";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
  if (!row) {
    // Return defaults
    return NextResponse.json({ data: RANKS.map((r) => ({
      key:          r.key,
      label:        r.label,
      icon:         r.icon,
      minSpend:     r.minSpend,
      discountPct:  r.discountPct,
      freeShipping: r.freeShipping,
      description:  r.description,
    }))});
  }

  try {
    return NextResponse.json({ data: JSON.parse(row.value) });
  } catch {
    return NextResponse.json({ data: RANKS });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Validate structure
  if (!Array.isArray(body) || body.length !== 5)
    return NextResponse.json({ error: "Data harus array 5 rank" }, { status: 400 });

  await prisma.setting.upsert({
    where:  { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: JSON.stringify(body) },
    update: { value: JSON.stringify(body) },
  });

  return NextResponse.json({ success: true });
}
