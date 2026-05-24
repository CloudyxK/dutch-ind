import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const KEY = "payment.manual.config";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

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
  const { banks, qrisImageUrl, instructions } = body;

  const config = {
    banks: Array.isArray(banks) ? banks : [],
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
