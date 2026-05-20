import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseJsonSafe, verifySameOrigin, sanitize } from "@/lib/security";
import { apiLimiter, getIp } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data: addresses });
  } catch {
    return NextResponse.json({ error: "Gagal memuat alamat" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifySameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rl = apiLimiter(`addr:${session.user.id}`);
    if (!rl.success) return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });

    const parsed = await parseJsonSafe(request, 10_000);
    if (!parsed.ok) return parsed.response;

    const body = parsed.data;
    const { isDefault } = body;
    const label = sanitize(body.label || "Rumah").slice(0, 50);
    const recipientName = sanitize(body.recipientName || "").slice(0, 100);
    const phone = sanitize(body.phone || "").slice(0, 20);
    const province = sanitize(body.province || "").slice(0, 100);
    const city = sanitize(body.city || "").slice(0, 100);
    const district = sanitize(body.district || "").slice(0, 100);
    const postalCode = sanitize(body.postalCode || "").slice(0, 10);
    const street = sanitize(body.street || "").slice(0, 500);

    if (!recipientName || !phone || !province || !city || !district || !postalCode || !street) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const userId = session.user.id;

    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      const hasAny = await tx.address.count({ where: { userId } });
      return tx.address.create({
        data: {
          userId,
          label: label || "Rumah",
          recipientName,
          phone,
          province,
          city,
          district,
          postalCode,
          street,
          isDefault: isDefault || hasAny === 0,
        },
      });
    });

    return NextResponse.json({ success: true, data: address }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan alamat" }, { status: 500 });
  }
}
