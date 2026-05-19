import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function requireOwnership(addressId: string, userId: string) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  return address;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const userId = session.user.id;

    if (!(await requireOwnership(id, userId))) {
      return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 404 });
    }

    const body = await request.json();
    const { label, recipientName, phone, province, city, district, postalCode, street, isDefault } = body;

    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return tx.address.update({
        where: { id },
        data: { label, recipientName, phone, province, city, district, postalCode, street, isDefault: isDefault ?? false },
      });
    });

    return NextResponse.json({ success: true, data: address });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui alamat" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const userId = session.user.id;

    const address = await requireOwnership(id, userId);
    if (!address) return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } });
      if (address.isDefault) {
        const next = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
        if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus alamat" }, { status: 500 });
  }
}

export async function PATCH(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const userId = session.user.id;

    if (!(await requireOwnership(id, userId))) {
      return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      await tx.address.update({ where: { id }, data: { isDefault: true } });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal mengatur alamat utama" }, { status: 500 });
  }
}
