import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = body;

    // Verifikasi signature Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (hash !== signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Cari order berdasarkan orderNumber
    const order = await prisma.order.findFirst({
      where: { orderNumber: order_id },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update status berdasarkan respons Midtrans
    let paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" = "PENDING";
    let orderStatus: "AWAITING_PAYMENT" | "PAID" | "CANCELLED" = "AWAITING_PAYMENT";

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      if (fraud_status === "accept" || !fraud_status) {
        paymentStatus = "SUCCESS";
        orderStatus = "PAID";
      }
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      paymentStatus = transaction_status === "expire" ? "EXPIRED" : "FAILED";
      orderStatus = "CANCELLED";
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: paymentStatus,
          transactionId: body.transaction_id,
          paidAt: paymentStatus === "SUCCESS" ? new Date() : undefined,
          metadata: body,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: orderStatus },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
