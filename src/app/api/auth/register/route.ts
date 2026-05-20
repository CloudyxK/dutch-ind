import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerLimiter, getIp } from "@/lib/rateLimit";
import { sanitize, isValidEmail, parseJsonSafe, verifySameOrigin, rateLimitResponse } from "@/lib/security";

export async function POST(request: NextRequest) {
  // CORS — only accept same-origin requests
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Rate limit: 3 registrations per IP per hour
  const ip = getIp(request);
  const rl = registerLimiter(`register:${ip}`);
  if (!rl.success) return rateLimitResponse(rl.retryAfter);

  // Parse & size-check body (max 10 KB)
  const parsed = await parseJsonSafe(request, 10_000);
  if (!parsed.ok) return parsed.response;

  const { name, email, phone, password } = parsed.data;

  // Validate required fields
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nama, email, dan password wajib diisi" }, { status: 400 });
  }

  // Sanitize text inputs
  const cleanName = sanitize(name);
  const cleanEmail = sanitize(email).toLowerCase();
  const cleanPhone = phone ? sanitize(phone) : undefined;

  // Field length limits
  if (cleanName.length < 2 || cleanName.length > 100) {
    return NextResponse.json({ error: "Nama harus 2-100 karakter" }, { status: 400 });
  }
  if (cleanEmail.length > 254 || !isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
  }
  if (cleanPhone && (cleanPhone.length < 8 || cleanPhone.length > 20)) {
    return NextResponse.json({ error: "Nomor telepon tidak valid" }, { status: 400 });
  }

  // Password strength: min 8 chars, must have letter + number
  if (password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });
  }
  if (password.length > 128) {
    return NextResponse.json({ error: "Password terlalu panjang" }, { status: 400 });
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: "Password harus mengandung huruf dan angka" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      // Don't reveal whether email exists — use generic message
      return NextResponse.json({ error: "Gagal mendaftar. Periksa data dan coba lagi." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: cleanName, email: cleanEmail, phone: cleanPhone, password: hashedPassword },
      select: { id: true, email: true, name: true },
    });

    await prisma.cart.create({ data: { userId: user.id } });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch {
    // Never expose error details to the client
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi nanti." }, { status: 500 });
  }
}
