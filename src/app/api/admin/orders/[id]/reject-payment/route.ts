import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    include: { payment: true },
  });

  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  if (!order.payment) return NextResponse.json({ error: "Data pembayaran tidak ditemukan" }, { status: 404 });

  await prisma.payment.update({
    where: { orderId: id },
    data: {
      status:         "REJECTED",
      rejectedReason: reason || "Bukti transfer tidak valid",
      proofImageUrl:  null,
      proofUploadedAt: null,
    },
  });

  return NextResponse.json({ success: true });
}
