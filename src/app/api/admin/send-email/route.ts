import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendAdminCustomEmail } from "@/lib/email";
import { sanitize, isValidEmail, isValidId, rateLimitResponse } from "@/lib/security";
import { emailBlastLimiter, getIp } from "@/lib/rateLimit";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Rate limit: 5 individual emails per hour per admin
    const rl = emailBlastLimiter(`send-email:${(session.user as any).id}`);
    if (!rl.success) return rateLimitResponse(rl.retryAfter);

    const body = await request.json();
    const { userId, email, recipientName, subject, message } = body;

    // Sanitize all text inputs
    const cleanSubject = sanitize(String(subject ?? "")).slice(0, 200);
    const cleanMessage = sanitize(String(message ?? "")).slice(0, 5000);
    const cleanName    = sanitize(String(recipientName ?? "Pelanggan")).slice(0, 100);

    if (!cleanSubject || !cleanMessage) {
      return NextResponse.json({ error: "Subjek dan pesan wajib diisi" }, { status: 400 });
    }

    // Resolve recipient
    let toEmail = typeof email === "string" ? email.trim() : "";
    let toName  = cleanName || "Pelanggan";

    if (userId) {
      if (!isValidId(userId)) {
        return NextResponse.json({ error: "User ID tidak valid" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (!user?.email) {
        return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
      }
      toEmail = user.email;
      toName  = user.name ?? "Pelanggan";
    }

    if (!toEmail || !isValidEmail(toEmail)) {
      return NextResponse.json({ error: "Email penerima tidak valid" }, { status: 400 });
    }

    await sendAdminCustomEmail(toEmail, {
      recipientName: toName,
      subject:       cleanSubject,
      message:       cleanMessage,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-email]", (error as Error).message);
    return NextResponse.json({ error: "Gagal mengirim email" }, { status: 500 });
  }
}
