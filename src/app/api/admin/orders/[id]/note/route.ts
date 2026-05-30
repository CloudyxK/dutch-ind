import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const { adminNote } = await request.json().catch(() => ({}));

  await prisma.order.update({
    where: { id },
    data: { adminNote: adminNote ? String(adminNote).slice(0, 500) : null },
  });

  return NextResponse.json({ success: true });
}
