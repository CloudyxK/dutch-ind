import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { parseJsonSafe, verifySameOrigin, sanitize, isValidEmail } from "@/lib/security";
import { sendPasswordResetEmail } from "@/lib/email";
import { reviewLimiter, getIp } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const ip = getIp(request);
  const rl = reviewLimiter(`forgot:${ip}`);
  if (!rl.success) return rateLimitResponse(rl.retryAfter);

  const parsed = await parseJsonSafe(request, 5_000);
  if (!parsed.ok) return parsed.response;

  const { email } = parsed.data;
  if (!email) return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });

  const cleanEmail = sanitize(String(email)).toLowerCase();
  if (!isValidEmail(cleanEmail)) return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (user) {
    try {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      await prisma.setting.upsert({
        where: { key: `pwd_reset_${cleanEmail}` },
        update: { value: `${token}:${expires}` },
        create: { key: `pwd_reset_${cleanEmail}`, value: `${token}:${expires}` },
      });
      sendPasswordResetEmail(user.email, user.name, token).catch(() => {});
    } catch { /* non-blocking */ }
  }

  return NextResponse.json({ success: true });
}
