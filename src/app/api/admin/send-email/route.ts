import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendAdminCustomEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, email, recipientName, subject, message } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Subjek dan pesan wajib diisi" }, { status: 400 });
    }

    // Resolve recipient email — either direct or from userId
    let toEmail = email?.trim();
    let toName  = recipientName?.trim() || "Pelanggan";

    if (userId && !toEmail) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
      if (!user?.email) {
        return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
      }
      toEmail = user.email;
      toName  = user.name ?? "Pelanggan";
    }

    if (!toEmail) {
      return NextResponse.json({ error: "Email penerima tidak ditemukan" }, { status: 400 });
    }

    await sendAdminCustomEmail(toEmail, {
      recipientName: toName,
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 5000),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-email]", error);
    return NextResponse.json({ error: "Gagal mengirim email" }, { status: 500 });
  }
}
