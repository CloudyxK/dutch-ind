import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseJsonSafe, verifySameOrigin, sanitize } from "@/lib/security";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ data: categories });
}

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonSafe(request, 20_000);
  if (!parsed.ok) return parsed.response;

  const { name, description, image, sortOrder } = parsed.data;
  if (!name) return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });

  const cleanName = sanitize(String(name)).slice(0, 100);
  const slug = cleanName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });

  const category = await prisma.category.create({
    data: {
      name: cleanName,
      slug,
      description: description ? sanitize(String(description)).slice(0, 500) : null,
      image: image ? String(image).slice(0, 500) : null,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
    },
  });

  return NextResponse.json({ data: category }, { status: 201 });
}
