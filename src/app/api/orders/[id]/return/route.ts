import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifySameOrigin, parseJsonSafe, sanitize } from "@/lib/security";

type Params = { params: Promise<{ id: string }> };

const RETURNABLE_STATUSES = ["DELIVERED", "COMPLETED"];

export async function POST(request: NextRequest, { params }: Params) {
  if (!verifySameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const parsed = await parseJsonSafe(request, 5_000);
  if (!parsed.ok) return parsed.response;

  const { reason, detail } = parsed.data;
  if (!reason || typeof reason !== "string")
    return NextResponse.json({ error: "Alasan return wajib diisi" }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { returnRequest: true },
  });

  if (!order)
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

  if (!RETURNABLE_STATUSES.includes(order.status))
    return NextResponse.json({ error: "Pesanan belum dapat dikembalikan" }, { status: 400 });

  if (order.returnRequest)
    return NextResponse.json({ error: "Permintaan return sudah diajukan" }, { status: 409 });

  const returnReq = await prisma.returnRequest.create({
    data: {
      orderId: id,
      userId:  session.user.id,
      reason:  sanitize(reason).slice(0, 100),
      detail:  detail ? sanitize(String(detail)).slice(0, 500) : null,
    },
  });

  return NextResponse.json({ success: true, data: returnReq });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const req = await prisma.returnRequest.findFirst({
    where: { orderId: id, userId: session.user.id },
  });

  return NextResponse.json({ data: req });
}
