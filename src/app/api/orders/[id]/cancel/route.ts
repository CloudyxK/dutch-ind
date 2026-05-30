import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifySameOrigin } from "@/lib/security";

type Params = { params: Promise<{ id: string }> };

const CANCELLABLE_STATUSES = ["AWAITING_PAYMENT", "PROCESSING"];

export async function POST(request: NextRequest, { params }: Params) {
  if (!verifySameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: { include: { variant: true } },
      payment: true,
    },
  });

  if (!order)
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

  if (!CANCELLABLE_STATUSES.includes(order.status))
    return NextResponse.json(
      { error: "Pesanan ini tidak dapat dibatalkan" },
      { status: 400 }
    );

  // Restore stock for each item
  await prisma.$transaction([
    // Update order status
    prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    }),
    // Restore variant stocks
    ...order.items.map((item) =>
      prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      })
    ),
    // Restore product totalStock
    ...order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { totalStock: { increment: item.quantity } },
      })
    ),
  ]);

  // Refund redeemed points (jika ada)
  const pointsUsed = (order as any).pointsUsed ?? 0;
  if (pointsUsed > 0) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { points: { increment: pointsUsed } },
    });
  }

  return NextResponse.json({ success: true });
}
