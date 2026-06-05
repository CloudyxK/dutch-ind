import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isValidEmail, sanitize, verifySameOrigin, rateLimitResponse } from "@/lib/security";
import { newsletterLimiter, getIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // CSRF protection
    if (!verifySameOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limit: 3 signups / hour / IP
    const ip = getIp(request);
    const rl = newsletterLimiter(`newsletter:${ip}`);
    if (!rl.success) return rateLimitResponse(rl.retryAfter);

    const body = await request.json().catch(() => ({}));
    const raw  = sanitize(String(body.email ?? "")).toLowerCase();

    if (!raw || !isValidEmail(raw)) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }

    // Max 1000 subscribers stored in Setting (beyond that, use a real list service)
    const key      = "newsletter.subscribers";
    const existing = await prisma.setting.findUnique({ where: { key } });
    let subscribers: string[] = [];
    if (existing) {
      try { subscribers = JSON.parse(existing.value); } catch {}
    }

    if (subscribers.length >= 1000) {
      return NextResponse.json({ success: true, message: "Berhasil mendaftar!" }); // silent cap
    }

    if (subscribers.includes(raw)) {
      return NextResponse.json({ message: "Email sudah terdaftar" });
    }

    subscribers.push(raw);
    await prisma.setting.upsert({
      where:  { key },
      create: { key, value: JSON.stringify(subscribers) },
      update: { value: JSON.stringify(subscribers) },
    });

    // Sync to Brevo contacts (non-blocking)
    const brevoKey = process.env.BREVO_API_KEY;
    if (brevoKey) {
      fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "api-key": brevoKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: raw, updateEnabled: true }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: "Berhasil mendaftar newsletter!" });
  } catch (err) {
    console.error("[newsletter]", (err as Error).message);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
