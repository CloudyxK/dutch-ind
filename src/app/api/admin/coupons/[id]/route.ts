import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const coupon = await prisma.coupon.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, data: coupon });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui kupon" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus kupon" }, { status: 500 });
  }
}
