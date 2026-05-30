import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const KEY = "payment.manual.config";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// GET is public — customers need to read bank/wallet info in ManualPaymentPanel
export async function GET() {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  if (!row) return NextResponse.json({ data: null });
  try {
    return NextResponse.json({ data: JSON.parse(row.value) });
  } catch {
    return NextResponse.json({ data: null });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const { banks, ewallets, qrisImageUrl, instructions } = body;

  const config = {
    banks:        Array.isArray(banks)    ? banks    : [],
    ewallets:     Array.isArray(ewallets) ? ewallets : [],
    qrisImageUrl: qrisImageUrl || "",
    instructions: instructions || "",
  };

  await prisma.setting.upsert({
    where:  { key: KEY },
    create: { key: KEY, value: JSON.stringify(config) },
    update: { value: JSON.stringify(config) },
  });

  return NextResponse.json({ success: true, data: config });
}
