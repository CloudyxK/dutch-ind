import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const sources = await prisma.stockSource.findMany({
      orderBy: [{ quality: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data: sources });
  } catch {
    return NextResponse.json({ error: "Gagal memuat sumber" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { name, platform, url, category, priceMin, priceMax, minOrder, quality, notes } = body;

    if (!name?.trim() || !platform?.trim() || !url?.trim()) {
      return NextResponse.json({ error: "Nama, platform, dan URL wajib diisi" }, { status: 400 });
    }

    const source = await prisma.stockSource.create({
      data: {
        name:     name.trim().slice(0, 200),
        platform: platform.trim(),
        url:      url.trim().slice(0, 500),
        category: category?.trim() || "general",
        priceMin: priceMin ? Number(priceMin) : null,
        priceMax: priceMax ? Number(priceMax) : null,
        minOrder: minOrder ? Number(minOrder) : null,
        quality:  Math.min(5, Math.max(1, Number(quality) || 3)),
        notes:    notes?.trim().slice(0, 500) || null,
      },
    });

    return NextResponse.json({ success: true, data: source }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan sumber" }, { status: 500 });
  }
}
