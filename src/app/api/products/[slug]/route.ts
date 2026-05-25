import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const where = UUID_RE.test(slug)
      ? { id: slug, isActive: true }
      : { slug, isActive: true };

    const product = await prisma.product.findUnique({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          take: 5,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}
