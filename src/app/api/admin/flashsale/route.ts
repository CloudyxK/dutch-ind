import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const SETTING_KEY = "flashsale.config";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
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
  const { active, title, subtitle, endAt, discountType, discountValue, couponCode } = body;

  // Validate
  if (!endAt) return NextResponse.json({ error: "Waktu berakhir wajib diisi" }, { status: 400 });
  const endDate = new Date(endAt);
  if (isNaN(endDate.getTime()))
    return NextResponse.json({ error: "Format waktu tidak valid" }, { status: 400 });

  const config = { active: !!active, title, subtitle, endAt, discountType, discountValue, couponCode };

  // Save flash sale config
  await prisma.setting.upsert({
    where:  { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: JSON.stringify(config) },
    update: { value: JSON.stringify(config) },
  });

  // Auto-sync coupon if code provided
  if (couponCode?.trim() && discountValue > 0) {
    const code = String(couponCode).trim().toUpperCase();
    const existing = await prisma.coupon.findUnique({ where: { code } });

    const couponData = {
      discountType:  discountType === "FIXED" ? "FIXED" : "PERCENTAGE",
      discountValue: Number(discountValue),
      isActive:      !!active,
      endDate:       endDate,
      description:   `Flash Sale – ${discountType === "FIXED" ? `Diskon Rp${discountValue}` : `Diskon ${discountValue}%`}`,
    };

    if (existing) {
      await prisma.coupon.update({ where: { code }, data: couponData });
    } else {
      await prisma.coupon.create({
        data: { code, ...couponData, minOrderAmount: 0 },
      });
    }
  }

  return NextResponse.json({ success: true, data: config });
}

export async function DELETE() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  await prisma.setting.deleteMany({ where: { key: SETTING_KEY } });
  return NextResponse.json({ success: true });
}
