import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Kode kupon wajib diisi" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
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

    if (orderAmount < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum pembelian Rp${coupon.minOrderAmount.toLocaleString("id-ID")} untuk menggunakan kupon ini`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, orderAmount);
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
  } catch (error) {
    return NextResponse.json({ error: "Gagal memvalidasi kupon" }, { status: 500 });
  }
}
