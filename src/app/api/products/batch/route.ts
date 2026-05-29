import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  if (ids.length === 0) return Response.json({ products: [] });

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 2 },
      variants: true,
      category: true,
      _count: { select: { reviews: true } },
    },
  });

  // Return in the same order as ids
  const sorted = ids.map(id => products.find(p => p.id === id)).filter(Boolean);
  return Response.json({ products: sorted });
}
