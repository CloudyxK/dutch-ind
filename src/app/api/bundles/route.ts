import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: bundles });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil bundle" }, { status: 500 });
  }
}
