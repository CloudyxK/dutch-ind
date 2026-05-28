import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/lib/email";

// Vercel Cron — runs once per day at 10:00 WIB (03:00 UTC)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  const recent = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // don't spam older carts

  const carts = await prisma.cart.findMany({
    where: {
      updatedAt: { gte: recent, lte: cutoff },
      items: { some: {} },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, slug: true, price: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } },
          variant: { select: { size: true } },
        },
        take: 3,
      },
    },
  });

  let sent = 0;
  for (const cart of carts) {
    if (!cart.user.email || cart.items.length === 0) continue;

    // Skip users who ordered in the last 24h (not really abandoned)
    const recentOrder = await prisma.order.findFirst({
      where: { userId: cart.user.id, createdAt: { gte: cutoff } },
    });
    if (recentOrder) continue;

    try {
      await sendAbandonedCartEmail(cart.user.email, {
        name:  cart.user.name,
        items: cart.items.map((item) => ({
          name:  item.product.name,
          slug:  item.product.slug,
          size:  item.variant.size,
          price: item.product.price,
          image: item.product.images[0]?.url ?? null,
          qty:   item.quantity,
        })),
      });
      sent++;
    } catch { /* individual failures should not abort the batch */ }
  }

  return NextResponse.json({ success: true, sent });
}
