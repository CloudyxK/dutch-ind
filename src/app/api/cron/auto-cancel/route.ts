import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Cron job: batalkan pesanan yang melewati paymentDeadline secara otomatis.
 * Dipanggil oleh Vercel Cron setiap jam (lihat vercel.json).
 * Bisa juga dipanggil manual oleh admin.
 */
export async function POST(request: NextRequest) {
  try {
    // Allow via CRON_SECRET header (Vercel Cron) atau admin session
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isCronRequest = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronRequest) {
      const session = await auth();
      const isAdmin = (session?.user as any)?.role === "ADMIN";
      if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const expired = await prisma.order.findMany({
      where: {
        status: "AWAITING_PAYMENT",
        paymentDeadline: { lt: new Date() },
        payment: { status: { in: ["PENDING", "MANUAL_PENDING"] } },
      },
      include: {
        items: { include: { variant: true } },
        payment: true,
        user: { select: { id: true, points: true } },
      },
    });

    for (const order of expired) {
      // Restore stock
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
        await prisma.product.update({
          where: { id: item.productId },
          data: { totalStock: { increment: item.quantity } },
        });
      }

      // Cancel order + payment
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      if (order.payment) {
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: { status: "CANCELLED" },
        });
      }

      // Refund redeemed points (jika ada pointsUsed tersimpan di order)
      const pointsUsed = (order as any).pointsUsed ?? 0;
      if (pointsUsed > 0 && order.user?.id) {
        await prisma.user.update({
          where: { id: order.user.id },
          data: { points: { increment: pointsUsed } },
        });
      }
    }

    return NextResponse.json({ success: true, cancelled: expired.length });
  } catch (error) {
    console.error("Auto-cancel error:", error);
    return NextResponse.json({ error: "Gagal membatalkan pesanan" }, { status: 500 });
  }
}

// Vercel Cron hits GET by default
export const GET = POST;
