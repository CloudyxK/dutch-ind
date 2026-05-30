import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendPaymentRejectedEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const { reason } = await request.json().catch(() => ({}));

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      payment: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  if (!order.payment) return NextResponse.json({ error: "Data pembayaran tidak ditemukan" }, { status: 404 });

  const rejectedReason = reason || "Bukti transfer tidak valid";

  await prisma.payment.update({
    where: { orderId: id },
    data: {
      status:          "REJECTED",
      rejectedReason,
      proofImageUrl:   null,
      proofUploadedAt: null,
    },
  });

  // Kirim email ke customer (fire-and-forget)
  if (order.user?.email) {
    sendPaymentRejectedEmail(order.user.email, {
      recipientName: order.user.name ?? "Pelanggan",
      orderNumber:   order.orderNumber,
      reason:        rejectedReason,
      orderId:       order.id,
    }).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
