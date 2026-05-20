import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { couponLimiter, getIp } from "@/lib/rateLimit";
import { parseJsonSafe, verifySameOrigin, rateLimitResponse, sanitize } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Must be logged in to validate coupons
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login terlebih dahulu" }, { status: 401 });
  }

  // Rate limit: 20 checks per minute per user
  const rl = couponLimiter(`coupon:${session.user.id}`);
  if (!rl.success) return rateLimitResponse(rl.retryAfter);

  const parsed = await parseJsonSafe(request, 5_000);
  if (!parsed.ok) return parsed.response;

  const { code, orderAmount } = parsed.data;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Kode kupon wajib diisi" }, { status: 400 });
  }

  const cleanCode = sanitize(code).toUpperCase().slice(0, 50);
  const amount = Number(orderAmount) || 0;

  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: cleanCode,
        isActive: true,
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
          { OR: [{ usageLimit: null }, { usageLimit: { gt: prisma.coupon.fields.usedCount } }] },
        ],
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Kupon tidak valid atau sudah kadaluarsa" }, { status: 404 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Kupon sudah habis digunakan" }, { status: 400 });
    }

    if (amount < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum pembelian Rp${coupon.minOrderAmount.toLocaleString("id-ID")} untuk kupon ini` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    } else {
      discountAmount = Math.min(coupon.discountValue, amount);
    }

    return NextResponse.json({
      success: true,
      data: {
        couponId: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountAmount: Math.round(discountAmount),
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal memvalidasi kupon" }, { status: 500 });
  }
}
