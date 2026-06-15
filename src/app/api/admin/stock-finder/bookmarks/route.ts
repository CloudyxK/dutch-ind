import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// ─── GET — list all bookmarks ─────────────────────────────────────────────────
export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bookmarks = await prisma.bookmarkedProduct.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: bookmarks });
  } catch {
    return NextResponse.json({ error: "Gagal memuat bookmark" }, { status: 500 });
  }
}

// ─── POST — create bookmark ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, price, image, url, platform, shop, location, rating, sold } = body;

    if (!name || !price || !url || !platform || !id) {
      return NextResponse.json({ error: "Field tidak lengkap" }, { status: 400 });
    }

    // Check duplicate by platformId
    const existing = await prisma.bookmarkedProduct.findFirst({
      where: { platformId: String(id) },
    });
    if (existing) {
      return NextResponse.json({ error: "Produk ini sudah dibookmark" }, { status: 409 });
    }

    const initialHistory = JSON.stringify([{ price, checkedAt: new Date().toISOString() }]);

    const bookmark = await prisma.bookmarkedProduct.create({
      data: {
        name:         String(name),
        price:        Number(price),
        lastPrice:    Number(price),
        image:        image ?? null,
        url:          String(url),
        platform:     String(platform),
        platformId:   String(id),
        shop:         shop ?? null,
        location:     location ?? null,
        rating:       rating ? Number(rating) : null,
        sold:         sold ?? null,
        priceHistory: initialHistory,
      },
    });

    return NextResponse.json({ data: bookmark });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan bookmark" }, { status: 500 });
  }
}
