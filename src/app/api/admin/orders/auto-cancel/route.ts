import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // Allow admin or cron requests
    const session = await auth();
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    // Cron secret allows unauthenticated access
    const cronSecret = process.env.CRON_SECRET;
    // (cron secret checked via header if needed — for now admin-only)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
      // Cancel order
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
    }

    return NextResponse.json({ success: true, cancelled: expired.length });
  } catch (error) {
    console.error("Auto-cancel error:", error);
    return NextResponse.json({ error: "Gagal membatalkan pesanan" }, { status: 500 });
  }
}
