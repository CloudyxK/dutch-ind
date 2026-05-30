import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendPaymentReminderEmail } from "@/lib/email";

/**
 * Cron job: batalkan pesanan expired + kirim reminder email untuk yang hampir expired.
 * Dipanggil Vercel Cron sekali sehari (lihat vercel.json).
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

    const now = new Date();

    // ── 1. Batalkan pesanan yang sudah expired ─────────────────────────────────
    const expired = await prisma.order.findMany({
      where: {
        status: "AWAITING_PAYMENT",
        paymentDeadline: { lt: now },
        payment: { status: { in: ["PENDING", "MANUAL_PENDING"] } },
      },
      include: {
        items: { include: { variant: true } },
        payment: true,
        user: { select: { id: true, points: true } },
      },
    });

    for (const order of expired) {
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
      const pointsUsed = (order as any).pointsUsed ?? 0;
      if (pointsUsed > 0 && order.user?.id) {
        await prisma.user.update({
          where: { id: order.user.id },
          data: { points: { increment: pointsUsed } },
        });
      }
    }

    // ── 2. Kirim reminder untuk pesanan yang expire dalam 12 jam ke depan ─────
    const reminderWindow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const toRemind = await prisma.order.findMany({
      where: {
        status: "AWAITING_PAYMENT",
        paymentDeadline: { gt: now, lt: reminderWindow },
        payment: { status: "MANUAL_PENDING" },
      },
      include: {
        payment: true,
        user: { select: { email: true, name: true } },
      },
    });

    let reminded = 0;
    for (const order of toRemind) {
      if (!order.user?.email || !order.paymentDeadline) continue;
      const hoursLeft = Math.max(
        1,
        Math.round((order.paymentDeadline.getTime() - now.getTime()) / (60 * 60 * 1000))
      );
      await sendPaymentReminderEmail(order.user.email, {
        recipientName:   order.user.name ?? "Pelanggan",
        orderNumber:     order.orderNumber,
        orderId:         order.id,
        total:           order.total,
        paymentDeadline: order.paymentDeadline,
        paymentMethod:   order.payment?.method ?? "MANUAL",
        hoursLeft,
      });
      reminded++;
    }

    return NextResponse.json({ success: true, cancelled: expired.length, reminded });
  } catch (error) {
    console.error("Auto-cancel error:", error);
    return NextResponse.json({ error: "Gagal menjalankan cron" }, { status: 500 });
  }
}

// Vercel Cron hits GET by default
export const GET = POST;
