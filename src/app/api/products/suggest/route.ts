import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitize, hasSqlInjection, rateLimitResponse } from "@/lib/security";
import { searchLimiter, getIp } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  // Rate limit search: 60/min/IP
  const ip = getIp(request);
  const rl = searchLimiter(`search:${ip}`);
  if (!rl.success) return rateLimitResponse(rl.retryAfter);

  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get("q")?.trim();
  const q    = rawQ ? sanitize(rawQ).slice(0, 100) : "";

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  // Block injection attempts
  if (hasSqlInjection(q)) {
    return NextResponse.json({ data: [] });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { tags: { contains: q.toLowerCase() } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: { take: 1, select: { url: true } },
        category: { select: { name: true } },
        totalStock: true,
      },
      take: 6,
      orderBy: [{ isFeatured: "desc" }, { isBestSeller: "desc" }],
    });

    return NextResponse.json(
      {
        data: products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          comparePrice: p.comparePrice,
          imageUrl: p.images[0]?.url ?? null,
          category: p.category.name,
          inStock: p.totalStock > 0,
        })),
      },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch {
    return NextResponse.json({ data: [] });
  }
}
