import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseJsonSafe, verifySameOrigin, sanitize } from "@/lib/security";

export async function PATCH(request: NextRequest) {
  if (!verifySameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await parseJsonSafe(request, 5_000);
  if (!parsed.ok) return parsed.response;

  const { name, phone, instagram } = parsed.data;

  const cleanName      = name      ? sanitize(String(name)).slice(0, 100)      : undefined;
  const cleanPhone     = phone     ? sanitize(String(phone)).slice(0, 20)      : null;
  const cleanInstagram = instagram ? sanitize(String(instagram)).replace(/^@/, "").slice(0, 50) : null;

  if (cleanName !== undefined && cleanName.length < 2)
    return NextResponse.json({ error: "Nama minimal 2 karakter" }, { status: 400 });

  // Validate phone format (optional, Indonesian format)
  if (cleanPhone && !/^(\+62|62|0)[0-9]{8,13}$/.test(cleanPhone.replace(/\s|-/g, "")))
    return NextResponse.json({ error: "Format nomor HP tidak valid" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: session.user.id as string },
    data: {
      ...(cleanName !== undefined && { name: cleanName }),
      phone:     cleanPhone,
      instagram: cleanInstagram,
    },
    select: { name: true, phone: true, instagram: true },
  });

  return NextResponse.json({ success: true, data: updated });
}
