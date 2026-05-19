import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(((session.user as any).role !== "ADMIN") && { userId: session.user.id }),
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
            },
            variant: true,
          },
        },
        address: true,
        payment: true,
        coupon: { select: { code: true, description: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil pesanan" }, { status: 500 });
  }
}
