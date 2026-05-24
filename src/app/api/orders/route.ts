import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { orderLimiter, getIp } from "@/lib/rateLimit";
import { parseJsonSafe, verifySameOrigin, rateLimitResponse, sanitize } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    if (!verifySameOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    // Rate limit: 10 orders per minute per user
    const rl = orderLimiter(`order:${session.user.id}`);
    if (!rl.success) return rateLimitResponse(rl.retryAfter);

    // Max 50 KB body
    const parsed = await parseJsonSafe(request, 50_000);
    if (!parsed.ok) return parsed.response;

    const body = parsed.data;
    const { items, address, addressId: existingAddressId, couponCode, shippingMethod, shippingCost, notes, paymentMethod } = body;
    const isManual = paymentMethod === "MANUAL";

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    // Hard cap on items per order to prevent abuse
    if (items.length > 50) {
      return NextResponse.json({ error: "Terlalu banyak item" }, { status: 400 });
    }

    // Sanitize notes
    const cleanNotes = notes ? sanitize(String(notes)).slice(0, 500) : undefined;

    // Validasi stok dan hitung subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        return NextResponse.json(
          { error: `Varian produk tidak ditemukan` },
          { status: 400 }
        );
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stok ${variant.product.name} ukuran ${variant.size} tidak mencukupi` },
          { status: 400 }
        );
      }

      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;
      validatedItems.push({ ...item, subtotal: itemSubtotal, productName: variant.product.name });
    }

    // Validasi kupon
    let discountAmount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
      });

      if (coupon) {
        if (subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          couponId = coupon.id;
        }
      }
    }

    const total = subtotal + (shippingCost || 0) - discountAmount;

    // Use existing saved address or create a new one
    let savedAddress;
    if (existingAddressId) {
      const found = await prisma.address.findFirst({ where: { id: existingAddressId, userId: session.user.id } });
      savedAddress = found ?? await prisma.address.create({
        data: { userId: session.user.id, label: "Checkout", recipientName: address.recipientName, phone: address.phone, province: address.province, city: address.city, district: address.district, postalCode: address.postalCode, street: address.street },
      });
    } else {
      savedAddress = await prisma.address.create({
        data: { userId: session.user.id, label: "Checkout", recipientName: address.recipientName, phone: address.phone, province: address.province, city: address.city, district: address.district, postalCode: address.postalCode, street: address.street },
      });
    }

    // Buat order dalam transaksi
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id as string,
          addressId: savedAddress.id,
          couponId,
          subtotal,
          discountAmount,
          shippingCost: shippingCost || 0,
          total,
          notes: cleanNotes,
          shippingMethod,
          status: "AWAITING_PAYMENT",
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
            })),
          },
        },
      });

      // Kurangi stok
      for (const item of validatedItems) {
        const variant = await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });

        // Log inventory
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            action: "SALE",
            quantity: -item.quantity,
            prevStock: variant.stock + item.quantity,
            newStock: variant.stock,
            note: `Pesanan #${newOrder.orderNumber}`,
          },
        });

        // Update total stok produk
        await tx.product.update({
          where: { id: item.productId },
          data: {
            totalStock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      // Update usage count kupon
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Buat payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method:  isManual ? "MANUAL" : "MIDTRANS",
          status:  isManual ? "MANUAL_PENDING" : "PENDING",
          amount:  total,
        },
      });

      return newOrder;
    });

    // Generate Midtrans Snap token (skip for manual payment)
    let snapToken: string | null = null;
    if (!isManual) {
      try {
        const midtransResponse = await createMidtransTransaction(order, session.user as any, validatedItems);
        snapToken = midtransResponse.token;

        if (snapToken) {
          await prisma.payment.update({
            where: { orderId: order.id },
            data: { snapToken },
          });
        }
      } catch (midtransError) {
        console.error("Midtrans error:", midtransError);
      }
    }

    return NextResponse.json({
      success: true,
      data: { orderId: order.id, orderNumber: order.orderNumber, snapToken },
    });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Gagal membuat pesanan" }, { status: 500 });
  }
}

async function createMidtransTransaction(order: any, user: any, items: any[]) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const payload = {
    transaction_details: {
      order_id: order.orderNumber,
      gross_amount: Math.round(order.total),
    },
    customer_details: {
      first_name: user.name,
      email: user.email,
    },
    item_details: [
      ...items.map((item) => ({
        id: item.productId,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: (item.productName || item.productId).substring(0, 50),
      })),
      ...(order.shippingCost > 0
        ? [{ id: "SHIPPING", price: Math.round(order.shippingCost), quantity: 1, name: "Ongkos Kirim" }]
        : []),
      ...(order.discountAmount > 0
        ? [{ id: "DISCOUNT", price: -Math.round(order.discountAmount), quantity: 1, name: "Diskon Kupon" }]
        : []),
    ],
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
  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
            variant: true,
          },
        },
        payment: true,
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil pesanan" }, { status: 500 });
  }
}
