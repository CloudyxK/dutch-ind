import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const days = parseInt(period.replace("d", "")) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Revenue per day
    const revenueData = await prisma.payment.findMany({
      where: {
        status: "SUCCESS",
        paidAt: { gte: startDate },
      },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: "asc" },
    });

    // Group by date
    const revenueByDay: Record<string, number> = {};
    revenueData.forEach((payment) => {
      if (!payment.paidAt) return;
      const date = payment.paidAt.toISOString().split("T")[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + payment.amount;
    });

    // Top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const topProductsWithInfo = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, images: { take: 1 } },
        });
        return { ...item, product };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({
          date,
          revenue,
        })),
        topProducts: topProductsWithInfo,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil analitik" }, { status: 500 });
  }
}
