import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name, slug, description, price, comparePrice, sku,
      categoryId, weight, isActive, isFeatured, isNewArrival,
      isBestSeller, tags, images, variants,
    } = body;

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }

    const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name, slug, description, price, comparePrice, sku,
          categoryId, weight, isActive, isFeatured, isNewArrival,
          isBestSeller,
          tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags ?? "[]"),
          totalStock,
          images: {
            create: images.map((url: string, i: number) => ({
              url, alt: name, isPrimary: i === 0, sortOrder: i,
            })),
          },
          variants: {
            create: variants.map((v: any) => ({
              size: v.size,
              color: v.color || null,
              stock: v.stock,
              sku: sku ? `${sku}-${v.size}${v.color ? `-${v.color}` : ""}` : undefined,
            })),
          },
        },
        include: { images: true, variants: true },
      });

      // Log initial stock
      for (const variant of newProduct.variants) {
        if (variant.stock > 0) {
          await tx.inventoryLog.create({
            data: {
              productId: newProduct.id,
              variantId: variant.id,
              action: "RESTOCK",
              quantity: variant.stock,
              prevStock: 0,
              newStock: variant.stock,
              note: "Stok awal",
            },
          });
        }
      }

      return newProduct;
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Gagal menambahkan produk" }, { status: 500 });
  }
}
