import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendRestockEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let productId: string;
  try {
    const body = await request.json();
    productId = body.productId;
    if (!productId) throw new Error("Missing productId");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Fetch product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true, price: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Fetch all pending notifications for this product
  const notifications = await prisma.stockNotification.findMany({
    where: { productId },
  });

  if (notifications.length === 0) {
    return NextResponse.json({ success: true, sent: 0 });
  }

  // Send emails
  let sent = 0;
  const sentIds: string[] = [];
  await Promise.allSettled(
    notifications.map(async (n) => {
      try {
        await sendRestockEmail(n.email, {
          productName: product.name,
          productSlug: product.slug,
          price: product.price,
        });
        sentIds.push(n.id);
        sent++;
      } catch (e) {
        console.error(`[stock-notify] Failed to send to ${n.email}:`, e);
      }
    })
  );

  // Delete sent notifications so they don't get re-notified
  if (sentIds.length > 0) {
    await prisma.stockNotification.deleteMany({
      where: { id: { in: sentIds } },
    });
  }

  return NextResponse.json({ success: true, sent });
}
