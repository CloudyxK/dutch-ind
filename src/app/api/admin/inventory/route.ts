import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseJsonSafe, verifySameOrigin, sanitize } from "@/lib/security";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 30;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.inventoryLog.findMany({
      include: {
        product: { select: { id: true, name: true } },
        variant: { select: { id: true, size: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inventoryLog.count(),
  ]);

  return NextResponse.json({ data: logs, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonSafe(request, 10_000);
  if (!parsed.ok) return parsed.response;

  const { variantId, action, quantity, note } = parsed.data;
  if (!variantId || !action || !quantity) {
    return NextResponse.json({ error: "variantId, action, dan quantity wajib diisi" }, { status: 400 });
  }

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty <= 0) {
    return NextResponse.json({ error: "Quantity harus berupa angka positif" }, { status: 400 });
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant) return NextResponse.json({ error: "Varian tidak ditemukan" }, { status: 404 });

  const prevStock = variant.stock;
  const newStock = action === "ADD" ? prevStock + qty : Math.max(0, prevStock - qty);

  await prisma.$transaction([
    prisma.productVariant.update({ where: { id: variantId }, data: { stock: newStock } }),
    prisma.product.update({
      where: { id: variant.productId },
      data: { totalStock: { increment: action === "ADD" ? qty : -Math.min(qty, prevStock) } },
    }),
    prisma.inventoryLog.create({
      data: {
        productId: variant.productId,
        variantId,
        action,
        quantity: qty,
        prevStock,
        newStock,
        note: note ? sanitize(String(note)).slice(0, 200) : null,
      },
    }),
  ]);

  return NextResponse.json({ success: true, newStock });
}
