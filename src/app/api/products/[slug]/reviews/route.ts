import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Harus login untuk memberi ulasan" }, { status: 401 });

    const { slug } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating harus antara 1-5" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: product.id } },
    });
    if (existing) return NextResponse.json({ error: "Kamu sudah memberi ulasan untuk produk ini" }, { status: 409 });

    // Check if user bought this product (for verified badge)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: session.user.id,
          status: { in: ["DELIVERED", "COMPLETED"] },
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        rating,
        comment: comment?.trim() || null,
        isVerified: !!hasPurchased,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan ulasan" }, { status: 500 });
  }
}
