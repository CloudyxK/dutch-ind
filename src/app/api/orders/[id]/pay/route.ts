import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id, userId: session.user.id },
      include: {
        payment: true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (order.payment?.status !== "PENDING") {
      return NextResponse.json({ error: "Pesanan ini sudah dibayar" }, { status: 400 });
    }

    // Return existing snap token if still valid
    if (order.payment.snapToken) {
      return NextResponse.json({ success: true, data: { snapToken: order.payment.snapToken } });
    }

    // Generate new snap token
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const baseUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const itemDetails = order.items.map((item) => ({
      id: item.productId,
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.product.name.substring(0, 50),
    }));

    if (order.shippingCost > 0) {
      itemDetails.push({ id: "SHIPPING", price: Math.round(order.shippingCost), quantity: 1, name: "Ongkos Kirim" });
    }
    if (order.discountAmount > 0) {
      itemDetails.push({ id: "DISCOUNT", price: -Math.round(order.discountAmount), quantity: 1, name: "Diskon Kupon" });
    }

    const payload = {
      transaction_details: {
        order_id: `${order.orderNumber}-retry-${Date.now()}`,
        gross_amount: Math.round(order.total),
      },
      customer_details: {
        first_name: session.user.name,
        email: session.user.email,
      },
      item_details: itemDetails,
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/order-success?orderId=${order.id}`,
      },
    };

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(serverKey + ":").toString("base64")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`Midtrans error ${response.status}: ${JSON.stringify(errBody)}`);
    }

    const midtransData = await response.json();
    const snapToken = midtransData.token;

    await prisma.payment.update({
      where: { orderId: order.id },
      data: { snapToken },
    });

    return NextResponse.json({ success: true, data: { snapToken } });
  } catch (error: any) {
    console.error("Pay error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat token pembayaran" }, { status: 500 });
  }
}
