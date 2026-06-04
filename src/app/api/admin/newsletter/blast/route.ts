import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

async function sendOne(to: string, subject: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;
  const fromName  = process.env.NEXT_PUBLIC_APP_NAME || "DUTCH.IND";
  const fromEmail = process.env.EMAIL_FROM_ADDRESS   || "noreply@dutch-ind.com";
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender:      { name: fromName, email: fromEmail },
      to:          [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
}

function buildHtml(subject: string, body: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dutch-indd.vercel.app";
  const htmlBody = body
    .split(/\n{2,}/)
    .map((p) => `<p style="color:#A3A3A3;line-height:1.7;font-size:14px;margin:0 0 16px">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px">
    <div style="border-bottom:1px solid #262626;padding-bottom:24px;margin-bottom:32px">
      <div style="font-size:22px;font-weight:900;letter-spacing:.2em;color:#F5F5F5;text-transform:uppercase">DUTCH.IND</div>
    </div>
    <h1 style="color:#F5F5F5;font-size:20px;font-weight:700;margin:0 0 16px">${subject}</h1>
    ${htmlBody}
    <div style="margin-top:32px">
      <a href="${appUrl}/products" style="display:inline-block;background:#F5F5F5;color:#0A0A0A;padding:12px 28px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase">Belanja Sekarang →</a>
    </div>
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #262626;color:#525252;font-size:12px">
      <p>© ${new Date().getFullYear()} DUTCH.IND — Brand Streetwear Premium Indonesia</p>
      <p>Kamu menerima email ini karena berlangganan newsletter DUTCH.IND.</p>
    </div>
  </div>
</body></html>`;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { subject, message, testEmail } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Subjek dan pesan wajib diisi" }, { status: 400 });
    }

    const html = buildHtml(subject.trim(), message.trim());

    // Test mode — kirim ke satu email saja
    if (testEmail?.trim()) {
      await sendOne(testEmail.trim(), `[TEST] ${subject.trim()}`, html);
      return NextResponse.json({ success: true, sent: 1, test: true });
    }

    // Blast ke semua subscriber
    const row = await prisma.setting.findUnique({ where: { key: "newsletter.subscribers" } });
    const subscribers: string[] = row?.value ? JSON.parse(row.value) : [];

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "Tidak ada subscriber" }, { status: 400 });
    }

    // Send with small delay to avoid rate limiting
    let sent = 0;
    for (const email of subscribers) {
      try {
        await sendOne(email, subject.trim(), html);
        sent++;
        await new Promise((r) => setTimeout(r, 100)); // 100ms delay between sends
      } catch { /* continue on individual failure */ }
    }

    return NextResponse.json({ success: true, sent, total: subscribers.length });
  } catch (error) {
    console.error("[newsletter-blast]", error);
    return NextResponse.json({ error: "Gagal mengirim newsletter" }, { status: 500 });
  }
}
