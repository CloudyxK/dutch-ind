import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { payment: true },
  });

  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  if (!order.payment) return NextResponse.json({ error: "Data pembayaran tidak ditemukan" }, { status: 404 });
  if (order.payment.status === "SUCCESS")
    return NextResponse.json({ error: "Pembayaran sudah dikonfirmasi sebelumnya" }, { status: 400 });

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId: id },
      data: {
        status:      "SUCCESS",
        confirmedAt: new Date(),
        paidAt:      new Date(),
      },
    }),
    prisma.order.update({
      where: { id },
      data: { status: "PROCESSING" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
