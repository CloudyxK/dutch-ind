import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  // Carts with items, not checked out, last updated > 2 hours ago
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const carts = await prisma.cart.findMany({
    where: {
      updatedAt: { lt: cutoff },
      items: { some: {} },
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { name: true, price: true, images: { take: 1 } } },
          variant: { select: { size: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return Response.json({ carts });
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  const { cartId } = await req.json();

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      user: true,
      items: {
        include: {
          product: { select: { name: true, price: true } },
          variant: { select: { size: true } },
        },
      },
    },
  });

  if (!cart) return Response.json({ error: "Cart not found" }, { status: 404 });

  const itemsList = cart.items
    .map(i => `- ${i.product.name} (${i.variant.size}) x${i.quantity}`)
    .join("\n");

  // Mark as "reminder sent" using Setting key
  const settingKey = `cart_reminder_${cart.userId}`;
  await prisma.setting.upsert({
    where: { key: settingKey },
    update: { value: new Date().toISOString() },
    create: { key: settingKey, value: new Date().toISOString() },
  });

  // Attempt to send email via Brevo
  try {
    const BREVO_KEY = process.env.BREVO_API_KEY;
    if (BREVO_KEY && cart.user.email) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "DUTCH.IND", email: "noreply@dutch-ind.com" },
          to: [{ email: cart.user.email, name: cart.user.name }],
          subject: "Kamu masih ada item di keranjang! 🛒",
          htmlContent: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <h2 style="font-size:24px;letter-spacing:4px;text-transform:uppercase">DUTCH.IND</h2>
              <p>Hei <strong>${cart.user.name}</strong>,</p>
              <p>Kamu masih punya item di keranjang belanja:</p>
              <pre style="background:#f5f5f5;padding:12px;font-size:13px">${itemsList}</pre>
              <p>Selesaikan checkout sebelum kehabisan!</p>
              <a href="${process.env.NEXTAUTH_URL}/cart" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Lihat Keranjang →</a>
            </div>
          `,
        }),
      });
    }
  } catch (err) {
    console.error("Failed to send abandoned cart email:", err);
  }

  return Response.json({ ok: true });
}
