import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Find the userId from the token
  const setting = await prisma.setting.findFirst({ where: { key: { startsWith: "wishlist_share_" }, value: token } });
  if (!setting) return NextResponse.json({ error: "Link tidak valid atau sudah dihapus" }, { status: 404 });

  const userId = setting.key.replace("wishlist_share_", "");

  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, price: true, comparePrice: true, isActive: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          variants: { select: { stock: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

  return NextResponse.json({
    ownerName: user?.name ?? "Seseorang",
    products: wishlistItems.map(w => w.product).filter(p => p.isActive),
  });
}
