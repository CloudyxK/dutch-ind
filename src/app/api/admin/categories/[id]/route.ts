import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseJsonSafe, verifySameOrigin, sanitize } from "@/lib/security";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!verifySameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const parsed = await parseJsonSafe(request, 20_000);
  if (!parsed.ok) return parsed.response;

  const { name, description, image, sortOrder, isActive } = parsed.data;

  const data: any = {};
  if (name !== undefined) data.name = sanitize(String(name)).slice(0, 100);
  if (description !== undefined) data.description = description ? sanitize(String(description)).slice(0, 500) : null;
  if (image !== undefined) data.image = image ? String(image).slice(0, 500) : null;
  if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);
  if (isActive !== undefined) data.isActive = Boolean(isActive);

  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json({ data: category });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!verifySameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `Kategori masih memiliki ${productCount} produk. Pindahkan produk terlebih dahulu.` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
