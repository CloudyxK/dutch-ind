import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { reviewLimiter, getIp } from "@/lib/rateLimit";
import { parseJsonSafe, verifySameOrigin, rateLimitResponse, sanitize } from "@/lib/security";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Harus login untuk memberi ulasan" }, { status: 401 });
  }

  // Rate limit: 5 review submissions per minute per user
  const rl = reviewLimiter(`review:${session.user.id}`);
  if (!rl.success) return rateLimitResponse(rl.retryAfter);

  const parsed = await parseJsonSafe(request, 10_000);
  if (!parsed.ok) return parsed.response;

  const { rating, comment } = parsed.data;

  const ratingNum = parseInt(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "Rating harus antara 1-5" }, { status: 400 });
  }

  const cleanComment = comment ? sanitize(String(comment)).slice(0, 500) : null;

  const { slug } = await params;
  const cleanSlug = sanitize(slug).slice(0, 200);

  try {
    const product = await prisma.product.findUnique({ where: { slug: cleanSlug } });
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: product.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Kamu sudah memberi ulasan untuk produk ini" }, { status: 409 });
    }

    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: session.user.id,
          status: { in: ["DELIVERED", "COMPLETED"] },
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "Kamu harus membeli dan menerima produk ini sebelum bisa memberi ulasan" },
        { status: 403 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        rating: ratingNum,
        comment: cleanComment,
        isVerified: true,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan ulasan" }, { status: 500 });
  }
}
