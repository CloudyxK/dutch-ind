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
  if (order.payment?.method !== "COD")
    return NextResponse.json({ error: "Bukan pesanan COD" }, { status: 400 });
  if (order.payment.status === "SUCCESS")
    return NextResponse.json({ error: "COD sudah dikonfirmasi" }, { status: 400 });

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId: id },
      data: {
        status:      "SUCCESS",
        paidAt:      new Date(),
        confirmedAt: new Date(),
      },
    }),
    prisma.order.update({
      where: { id },
      data: { status: "COMPLETED" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
