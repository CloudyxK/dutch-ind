import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const KEY = "instagram.feed";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: KEY } });
    const images = setting?.value ? JSON.parse(setting.value) : [];
    return NextResponse.json({ data: images });
  } catch {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const images: string[] = body.images;

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Format tidak valid" }, { status: 400 });
    }

    // Validate and sanitize — max 12 images, only http(s) URLs
    const sanitized = images
      .filter((url) => typeof url === "string" && /^https?:\/\/.+/.test(url.trim()))
      .slice(0, 12);

    await prisma.setting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: JSON.stringify(sanitized) },
      update: { value: JSON.stringify(sanitized) },
    });

    return NextResponse.json({ success: true, data: sanitized });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}
