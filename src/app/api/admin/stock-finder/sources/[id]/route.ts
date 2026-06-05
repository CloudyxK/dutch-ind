import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const source = await prisma.stockSource.update({
      where: { id },
      data: {
        ...(body.name      && { name:     body.name.trim().slice(0, 200) }),
        ...(body.notes     !== undefined && { notes: body.notes?.trim().slice(0, 500) || null }),
        ...(body.quality   !== undefined && { quality: Math.min(5, Math.max(1, Number(body.quality))) }),
        ...(body.isActive  !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.priceMin  !== undefined && { priceMin: body.priceMin ? Number(body.priceMin) : null }),
        ...(body.priceMax  !== undefined && { priceMax: body.priceMax ? Number(body.priceMax) : null }),
        lastChecked: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: source });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui sumber" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    await prisma.stockSource.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus sumber" }, { status: 500 });
  }
}
