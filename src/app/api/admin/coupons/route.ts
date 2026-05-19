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

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: coupons });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data kupon" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, startDate, endDate } = body;

    if (!code || !discountValue || !discountType) {
      return NextResponse.json({ error: "Kode, tipe, dan nilai diskon wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return NextResponse.json({ error: "Kode kupon sudah digunakan" }, { status: 409 });

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount || "0"),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat kupon" }, { status: 500 });
  }
}
