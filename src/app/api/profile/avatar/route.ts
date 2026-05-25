import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Max ~300 KB base64 setelah compress di client
const MAX_B64 = 400_000;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { imageBase64 } = body ?? {};
  if (!imageBase64 || typeof imageBase64 !== "string")
    return NextResponse.json({ error: "imageBase64 wajib diisi" }, { status: 400 });

  if (!imageBase64.startsWith("data:image/"))
    return NextResponse.json({ error: "Format gambar tidak valid" }, { status: 400 });

  if (imageBase64.length > MAX_B64)
    return NextResponse.json({ error: "Gambar terlalu besar (maks ~300KB)" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { avatar: imageBase64 },
  });

  return NextResponse.json({ success: true, avatar: imageBase64 });
}

export async function DELETE(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { avatar: null },
  });

  return NextResponse.json({ success: true });
}
