import { Resend } from "resend";
import { formatPrice, formatDateTime } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

// Alamat pengirim — ganti ke domain kamu kalau sudah punya
const FROM_ADDRESS = process.env.EMAIL_FROM || "DUTCH.IND <onboarding@resend.dev>";

// ── Template HTML dasar ──────────────────────────────────────────────────────
function baseTemplate(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#0A0A0A; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrap { max-width:600px; margin:0 auto; padding:40px 20px; }
    .hdr  { border-bottom:1px solid #262626; padding-bottom:24px; margin-bottom:32px; }
    .logo { font-size:24px; font-weight:900; letter-spacing:.2em; color:#F5F5F5; text-transform:uppercase; }
    .body { color:#A3A3A3; line-height:1.7; font-size:14px; }
    h1    { color:#F5F5F5; font-size:22px; font-weight:700; margin-bottom:16px; }
    .num  { font-family:monospace; font-size:18px; font-weight:700; color:#F5F5F5; background:#171717; padding:12px 20px; display:inline-block; letter-spacing:.05em; margin:12px 0; }
    .btn  { display:inline-block; background:#F5F5F5; color:#0A0A0A; padding:12px 28px; text-decoration:none; font-weight:700; font-size:13px; letter-spacing:.1em; text-transform:uppercase; margin-top:20px; }
    table { width:100%; border-collapse:collapse; margin:20px 0; }
    td,th { padding:10px 0; border-bottom:1px solid #262626; text-align:left; font-size:13px; }
    th    { color:#737373; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:.1em; }
    .tot td { font-weight:700; color:#F5F5F5; font-size:15px; border-top:1px solid #404040; border-bottom:none; padding-top:16px; }
    .ftr  { margin-top:40px; padding-top:24px; border-top:1px solid #262626; color:#525252; font-size:12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr"><div class="logo">DUTCH.IND</div></div>
    <div class="body">${content}</div>
    <div class="ftr">
      <p>© ${new Date().getFullYear()} DUTCH.IND. Semua hak dilindungi.</p>
      <p>Samarinda, Indonesia · streetwear premium lokal</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Kirim helper ─────────────────────────────────────────────────────────────
async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY tidak diset — email tidak dikirim");
    return;
  }
  const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
  if (error) console.error("[email] Resend error:", error);
}

// ── Email konfirmasi pesanan ──────────────────────────────────────────────────
export async function sendOrderConfirmationEmail(
  to: string,
  order: {
    orderNumber: string;
    total: number;
    items: { name: string; size: string; quantity: number; price: number }[];
    recipientName: string;
    createdAt: Date;
  }
) {
  const rows = order.items.map(i => `
    <tr>
      <td style="color:#A3A3A3">${i.name} — ${i.size}</td>
      <td style="color:#A3A3A3;text-align:center">${i.quantity}</td>
      <td style="color:#F5F5F5;text-align:right">${formatPrice(i.price * i.quantity)}</td>
    </tr>`).join("");

  const html = baseTemplate("Konfirmasi Pesanan", `
    <h1>Pesanan Dikonfirmasi!</h1>
    <p>Halo <strong style="color:#F5F5F5">${order.recipientName}</strong>,</p>
    <p>Terima kasih telah berbelanja di DUTCH.IND. Pesananmu telah kami terima dan sedang diproses.</p>
    <div class="num">#${order.orderNumber}</div>
    <p style="font-size:12px;color:#525252">${formatDateTime(order.createdAt)}</p>
    <table>
      <thead><tr><th>Produk</th><th style="text-align:center">Qty</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${rows}</tbody>
      <tr class="tot"><td colspan="2">Total</td><td style="text-align:right">${formatPrice(order.total)}</td></tr>
    </table>
    <p>Kami akan mengirimkan notifikasi ketika pesananmu dikirim.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/orders" class="btn">Lacak Pesanan</a>
  `);

  await send(to, `Pesanan #${order.orderNumber} Dikonfirmasi — DUTCH.IND`, html);
}

// ── Email status pengiriman ───────────────────────────────────────────────────
export async function sendShippingEmail(
  to: string,
  data: { recipientName: string; orderNumber: string; trackingNumber: string; shippingMethod: string }
) {
  const html = baseTemplate("Pesanan Dikirim", `
    <h1>Pesananmu Sedang Dikirim!</h1>
    <p>Halo <strong style="color:#F5F5F5">${data.recipientName}</strong>,</p>
    <p>Kabar baik! Pesanan <strong style="color:#F5F5F5">#${data.orderNumber}</strong> sudah dalam perjalanan.</p>
    <table>
      <tr><td style="color:#737373">Nomor Resi</td><td style="color:#F5F5F5;font-family:monospace;font-weight:700">${data.trackingNumber}</td></tr>
      <tr><td style="color:#737373">Kurir</td><td style="color:#F5F5F5">${data.shippingMethod}</td></tr>
    </table>
    <p>Gunakan nomor resi di atas untuk melacak pengiriman paketmu.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/orders" class="btn">Lacak Pesanan</a>
  `);

  await send(to, `Pesanan #${data.orderNumber} Sedang Dikirim — DUTCH.IND`, html);
}

// ── Email verifikasi akun ─────────────────────────────────────────────────────
export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  const html = baseTemplate("Verifikasi Email", `
    <h1>Verifikasi Email Kamu</h1>
    <p>Halo <strong style="color:#F5F5F5">${name}</strong>,</p>
    <p>Klik tombol di bawah untuk memverifikasi alamat emailmu. Link berlaku selama <strong style="color:#F5F5F5">24 jam</strong>.</p>
    <a href="${url}" class="btn">Verifikasi Email</a>
    <p style="font-size:12px;color:#525252;margin-top:24px">Atau salin link: ${url}</p>
    <p style="font-size:12px;color:#525252">Jika kamu tidak mendaftar di DUTCH.IND, abaikan email ini.</p>
  `);

  await send(to, "Verifikasi Email Akun DUTCH.IND", html);
}

// ── Email reset password ──────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  const html = baseTemplate("Reset Password", `
    <h1>Reset Password</h1>
    <p>Halo <strong style="color:#F5F5F5">${name}</strong>,</p>
    <p>Kami menerima permintaan reset password. Klik tombol di bawah untuk membuat password baru.</p>
    <p>Link berlaku selama <strong style="color:#F5F5F5">1 jam</strong>.</p>
    <a href="${url}" class="btn">Reset Password</a>
    <p style="font-size:12px;color:#525252;margin-top:24px">Atau salin link: ${url}</p>
    <p style="font-size:12px;color:#525252">Jika kamu tidak meminta reset password, abaikan email ini.</p>
  `);

  await send(to, "Reset Password — DUTCH.IND", html);
}

// ── Email selamat datang ──────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  const html = baseTemplate("Selamat Datang", `
    <h1>Selamat Datang di DUTCH.IND!</h1>
    <p>Halo <strong style="color:#F5F5F5">${name}</strong>,</p>
    <p>Akun kamu sudah berhasil dibuat. Selamat bergabung dengan komunitas streetwear premium Indonesia.</p>
    <p>Sebagai member baru, gunakan kode berikut untuk diskon 10% di pembelian pertamamu:</p>
    <div class="num">WELCOME10</div>
    <p style="font-size:12px;color:#525252">Berlaku min. pembelian Rp200.000 · Maks. potongan Rp100.000</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="btn">Mulai Belanja</a>
  `);

  await send(to, `Selamat Datang di DUTCH.IND, ${name}!`, html);
}
