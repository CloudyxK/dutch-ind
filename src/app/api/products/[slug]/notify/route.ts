import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySameOrigin, sanitize, isValidEmail } from "@/lib/security";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  if (!verifySameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const email = sanitize(String(body.email ?? "")).toLowerCase().trim();

  if (!email || !isValidEmail(email))
    return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, totalStock: true },
  });
  if (!product)
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  if (product.totalStock > 0)
    return NextResponse.json({ error: "Stok masih tersedia" }, { status: 400 });

  await prisma.stockNotification.upsert({
    where:  { email_productId: { email, productId: product.id } },
    create: { email, productId: product.id },
    update: {},
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const email = sanitize(String(searchParams.get("email") ?? "")).toLowerCase().trim();

  if (!email) return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });

  const product = await prisma.product.findUnique({
    where: { slug }, select: { id: true },
  });
  if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

  await prisma.stockNotification.deleteMany({
    where: { email, productId: product.id },
  });

  return NextResponse.json({ success: true });
}
