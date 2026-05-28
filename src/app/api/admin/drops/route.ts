import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifySameOrigin, parseJsonSafe, sanitize } from "@/lib/security";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const drops = await prisma.drop.findMany({
    include: { _count: { select: { waitlist: true } } },
    orderBy: { releaseDate: "asc" },
  });
  return NextResponse.json({ data: drops });
}

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await requireAdmin()))   return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonSafe(request, 10_000);
  if (!parsed.ok) return parsed.response;

  const { name, slug, description, coverImage, releaseDate, couponCode } = parsed.data;
  if (!name || !slug || !releaseDate)
    return NextResponse.json({ error: "name, slug, releaseDate wajib diisi" }, { status: 400 });

  const drop = await prisma.drop.create({
    data: {
      name:        sanitize(name).slice(0, 100),
      slug:        sanitize(slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 80),
      description: description ? sanitize(description).slice(0, 500) : null,
      coverImage:  coverImage ?? null,
      releaseDate: new Date(releaseDate),
      couponCode:  couponCode ? sanitize(couponCode).toUpperCase().slice(0, 20) : null,
      status:      "UPCOMING",
    },
  });

  return NextResponse.json({ success: true, data: drop });
}
