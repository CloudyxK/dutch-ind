import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
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
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { label, recipientName, phone, province, city, district, postalCode, street, isDefault } = body;

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
