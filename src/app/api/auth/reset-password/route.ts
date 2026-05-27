import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { parseJsonSafe, verifySameOrigin, sanitize, isValidEmail } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await parseJsonSafe(request, 5_000);
  if (!parsed.ok) return parsed.response;

  const { email, token, password } = parsed.data;
  if (!email || !token || !password) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const cleanEmail = sanitize(String(email)).toLowerCase();
  if (!isValidEmail(cleanEmail)) return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
  }

  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json({ error: "Password harus mengandung huruf dan angka" }, { status: 400 });
  }

  const setting = await prisma.setting.findUnique({ where: { key: `pwd_reset_${cleanEmail}` } });
  if (!setting) {
    return NextResponse.json({ error: "Token tidak ditemukan atau sudah digunakan" }, { status: 400 });
  }

  const [storedToken, expiresAt] = setting.value.split(":");
  if (storedToken !== token || !expiresAt || new Date(expiresAt) < new Date()) {
    await prisma.setting.delete({ where: { key: `pwd_reset_${cleanEmail}` } }).catch(() => {});
    return NextResponse.json({ error: "Token tidak valid atau sudah kadaluarsa" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });

  const hashed = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
    prisma.setting.delete({ where: { key: `pwd_reset_${cleanEmail}` } }),
  ]);

  return NextResponse.json({ success: true });
}
