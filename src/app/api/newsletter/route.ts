import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email ?? "").toLowerCase().trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }

    // Store in Setting table as a JSON array (no migration needed)
    const key = "newsletter.subscribers";
    const existing = await prisma.setting.findUnique({ where: { key } });

    let subscribers: string[] = [];
    if (existing) {
      try { subscribers = JSON.parse(existing.value); } catch {}
    }

    if (subscribers.includes(email)) {
      return NextResponse.json({ message: "Email sudah terdaftar" });
    }

    subscribers.push(email);

    await prisma.setting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(subscribers) },
      update: { value: JSON.stringify(subscribers) },
    });

    // Optional: notify via Brevo if configured
    const brevoKey = process.env.BREVO_API_KEY;
    if (brevoKey) {
      fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, updateEnabled: true }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: "Berhasil mendaftar newsletter!" });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
