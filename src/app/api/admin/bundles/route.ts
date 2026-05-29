import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bundles = await prisma.bundle.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: bundles });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil bundle" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, discount, productIds, isActive, sortOrder } = body;

    if (!name || !productIds || productIds.length === 0) {
      return NextResponse.json({ error: "Nama dan produk wajib diisi" }, { status: 400 });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now();

    const bundle = await prisma.bundle.create({
      data: {
        name,
        slug,
        description: description || null,
        discount: parseFloat(discount) || 0,
        isActive: isActive !== false,
        sortOrder: parseInt(sortOrder) || 0,
        items: {
          create: (productIds as string[]).map((productId, idx) => ({
            productId,
            sortOrder: idx,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: bundle }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Nama bundle sudah digunakan" }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal membuat bundle" }, { status: 500 });
  }
}
