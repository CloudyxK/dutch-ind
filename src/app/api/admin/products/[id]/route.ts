import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { images, variants, ...data } = body;

    const totalStock = variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) ?? undefined;

    const product = await prisma.$transaction(async (tx) => {
      // Update main product
      const updated = await tx.product.update({
        where: { id },
        data: { ...data, ...(totalStock !== undefined && { totalStock }) },
      });

      // Replace images
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((url: string, i: number) => ({
            productId: id, url, alt: updated.name, isPrimary: i === 0, sortOrder: i,
          })),
        });
      }

      // Update variants (upsert by size)
      if (variants) {
        for (const v of variants) {
          const existing = await tx.productVariant.findFirst({
            where: { productId: id, size: v.size },
          });
          if (existing) {
            const diff = v.stock - existing.stock;
            await tx.productVariant.update({
              where: { id: existing.id },
              data: { stock: v.stock },
            });
            if (diff !== 0) {
              await tx.inventoryLog.create({
                data: {
                  productId: id, variantId: existing.id,
                  action: "ADJUSTMENT",
                  quantity: diff,
                  prevStock: existing.stock,
                  newStock: v.stock,
                  note: "Penyesuaian stok admin",
                },
              });
            }
          } else {
            const created = await tx.productVariant.create({
              data: { productId: id, size: v.size, stock: v.stock },
            });
            if (v.stock > 0) {
              await tx.inventoryLog.create({
                data: {
                  productId: id, variantId: created.id,
                  action: "RESTOCK", quantity: v.stock,
                  prevStock: 0, newStock: v.stock,
                },
              });
            }
          }
        }
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    // Soft delete — nonaktifkan produk
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const product = await prisma.product.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
  }
}
