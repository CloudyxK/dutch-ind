import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
  }

  const setting = await prisma.setting.findUnique({ where: { key: `email_verify_${token}` } });
  if (!setting) {
    return NextResponse.json({ error: "Token tidak ditemukan atau sudah digunakan" }, { status: 400 });
  }

  const [userId, expiresAt] = setting.value.split(":");
  if (!userId || !expiresAt || new Date(expiresAt) < new Date()) {
    await prisma.setting.delete({ where: { key: `email_verify_${token}` } }).catch(() => {});
    return NextResponse.json({ error: "Token sudah kadaluarsa" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } }),
    prisma.setting.delete({ where: { key: `email_verify_${token}` } }),
  ]);

  return NextResponse.json({ success: true });
}
