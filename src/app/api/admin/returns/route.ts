import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifySameOrigin, parseJsonSafe, sanitize } from "@/lib/security";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  const returns = await prisma.returnRequest.findMany({
    where: status ? { status } : undefined,
    include: {
      order: { select: { orderNumber: true, total: true } },
      user:  { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: returns });
}

export async function PATCH(request: NextRequest) {
  if (!verifySameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await requireAdmin()))   return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonSafe(request, 5_000);
  if (!parsed.ok) return parsed.response;

  const { id, status, adminNote } = parsed.data;
  if (!id || !status)
    return NextResponse.json({ error: "id dan status wajib" }, { status: 400 });

  const updated = await prisma.returnRequest.update({
    where: { id },
    data: {
      status,
      adminNote: adminNote ? sanitize(String(adminNote)).slice(0, 500) : undefined,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
