import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseJsonSafe, verifySameOrigin } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await parseJsonSafe(request, 5_000);
  if (!parsed.ok) return parsed.response;

  const { currentPassword, newPassword } = parsed.data;

  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });

  if (newPassword.length < 8 || newPassword.length > 128)
    return NextResponse.json({ error: "Password baru minimal 8 karakter" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { password: true },
  });

  if (!user?.password)
    return NextResponse.json({ error: "Akun ini tidak menggunakan password" }, { status: 400 });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid)
    return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id as string },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true });
}
