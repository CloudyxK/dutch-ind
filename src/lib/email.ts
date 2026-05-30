import { formatPrice, formatDateTime } from "@/lib/utils";

// ── Brevo HTTP API (lebih reliable dari SMTP di serverless) ──────────────────
async function send(to: string, subject: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY belum diset — email tidak dikirim");
    return;
  }

  const fromName  = process.env.NEXT_PUBLIC_APP_NAME || "DUTCH.IND";
  const fromEmail = process.env.EMAIL_FROM_ADDRESS   || "noreply@dutch-ind.com";

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method:  "POST",
      headers: {
        "api-key":      apiKey,
        "Content-Type": "application/json",
        "Accept":       "application/json",
      },
      body: JSON.stringify({
        sender:      { name: fromName, email: fromEmail },
        to:          [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[email] Brevo error:", err);
    }
  } catch (e) {
    console.error("[email] Gagal kirim:", e);
  }
}

// ── Template HTML ─────────────────────────────────────────────────────────────
function baseTemplate(title: string, content: string) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <style>
    body{margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    .wrap{max-width:600px;margin:0 auto;padding:40px 24px}
    .hdr{border-bottom:1px solid #262626;padding-bottom:24px;margin-bottom:32px}
    .logo{font-size:22px;font-weight:900;letter-spacing:.2em;color:#F5F5F5;text-transform:uppercase}
    .body{color:#A3A3A3;line-height:1.7;font-size:14px}
    h1{color:#F5F5F5;font-size:20px;font-weight:700;margin:0 0 16px}
    .num{font-family:monospace;font-size:18px;font-weight:700;color:#F5F5F5;background:#171717;padding:12px 20px;display:inline-block;letter-spacing:.05em;margin:12px 0}
    .btn{display:inline-block;background:#F5F5F5;color:#0A0A0A;padding:12px 28px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-top:20px}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    td,th{padding:10px 0;border-bottom:1px solid #262626;font-size:13px;text-align:left}
    th{color:#737373;font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:.1em}
    .tot td{font-weight:700;color:#F5F5F5;font-size:15px;border-top:2px solid #404040;border-bottom:none;padding-top:16px}
    .ftr{margin-top:40px;padding-top:24px;border-top:1px solid #262626;color:#525252;font-size:12px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr"><div class="logo">DUTCH.IND</div></div>
    <div class="body">${content}</div>
    <div class="ftr">
      <p>© ${new Date().getFullYear()} DUTCH.IND — Brand Streetwear Premium Indonesia</p>
      <p>Samarinda, Kalimantan Timur</p>
    </div>
  </div>
</body>
</html>`;
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
      <td style="color:#A3A3A3">${i.name} <span style="color:#525252">— ${i.size}</span></td>
      <td style="color:#A3A3A3;text-align:center">${i.quantity}</td>
      <td style="color:#F5F5F5;text-align:right;font-weight:600">${formatPrice(i.price * i.quantity)}</td>
    </tr>`).join("");

  await send(to, `Pesanan #${order.orderNumber} Dikonfirmasi — DUTCH.IND`,
    baseTemplate("Konfirmasi Pesanan", `
      <h1>Pesanan Dikonfirmasi!</h1>
      <p>Halo <strong style="color:#F5F5F5">${order.recipientName}</strong>,</p>
      <p>Terima kasih telah berbelanja di DUTCH.IND. Pesananmu telah kami terima dan sedang diproses.</p>
      <div class="num">#${order.orderNumber}</div>
      <p style="font-size:12px;color:#525252;margin-top:4px">${formatDateTime(order.createdAt)}</p>
      <table>
        <thead><tr><th>Produk</th><th style="text-align:center">Qty</th><th style="text-align:right">Subtotal</th></tr></thead>
        <tbody>${rows}</tbody>
        <tr class="tot"><td colspan="2">Total Pembayaran</td><td style="text-align:right">${formatPrice(order.total)}</td></tr>
      </table>
      <p>Kami akan menghubungimu ketika pesanan telah dikirim.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/orders" class="btn">Lacak Pesanan →</a>
    `)
  );
}

// ── Email notif admin: bukti bayar masuk ─────────────────────────────────────
export async function sendAdminPaymentProofEmail(data: {
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  paymentMethod: string;
  orderId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  const methodLabel = data.paymentMethod === "TRANSFER" ? "Transfer Bank"
    : data.paymentMethod === "QRIS" ? "QRIS"
    : data.paymentMethod === "EWALLET" ? "E-Wallet"
    : data.paymentMethod;
  await send(adminEmail, `⚡ Bukti Bayar Masuk — #${data.orderNumber}`,
    baseTemplate("Bukti Bayar Masuk", `
      <h1>Bukti Pembayaran Baru</h1>
      <p>Ada bukti pembayaran yang perlu dikonfirmasi:</p>
      <table>
        <tr><td style="color:#737373;width:40%">No. Pesanan</td><td style="color:#F5F5F5;font-family:monospace;font-weight:700">#${data.orderNumber}</td></tr>
        <tr><td style="color:#737373">Pembeli</td><td style="color:#F5F5F5">${data.buyerName} (${data.buyerEmail})</td></tr>
        <tr><td style="color:#737373">Metode</td><td style="color:#F5F5F5">${methodLabel}</td></tr>
        <tr style="border:none"><td style="color:#737373">Nominal</td><td style="color:#F5F5F5;font-weight:700">${formatPrice(data.amount)}</td></tr>
      </table>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" class="btn">Konfirmasi Sekarang →</a>
    `)
  );
}

// ── Email ke customer: bukti bayar ditolak ────────────────────────────────────
export async function sendPaymentRejectedEmail(
  to: string,
  data: { recipientName: string; orderNumber: string; reason: string; orderId: string }
) {
  await send(to, `Bukti Pembayaran Ditolak — #${data.orderNumber}`,
    baseTemplate("Bukti Pembayaran Ditolak", `
      <h1>Bukti Pembayaranmu Ditolak</h1>
      <p>Halo <strong style="color:#F5F5F5">${data.recipientName}</strong>,</p>
      <p>Maaf, bukti pembayaran untuk pesanan <strong style="color:#F5F5F5">#${data.orderNumber}</strong> tidak dapat kami konfirmasi.</p>
      <div style="background:#1A0A0A;border:1px solid #4B1414;padding:16px 20px;margin:20px 0">
        <p style="color:#EF4444;font-size:13px;font-weight:600;margin:0 0 6px">Alasan Penolakan:</p>
        <p style="color:#FCA5A5;margin:0;font-size:14px">${data.reason}</p>
      </div>
      <p>Silakan upload ulang bukti pembayaran yang benar melalui halaman pesananmu.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/orders/${data.orderId}" class="btn">Upload Ulang Bukti →</a>
    `)
  );
}

// ── Email pengiriman ──────────────────────────────────────────────────────────
export async function sendShippingEmail(
  to: string,
  data: { recipientName: string; orderNumber: string; trackingNumber: string; shippingMethod: string }
) {
  await send(to, `Pesanan #${data.orderNumber} Sedang Dikirim — DUTCH.IND`,
    baseTemplate("Pesanan Dikirim", `
      <h1>Pesananmu Sedang Dikirim!</h1>
      <p>Halo <strong style="color:#F5F5F5">${data.recipientName}</strong>,</p>
      <p>Kabar baik! Pesanan <strong style="color:#F5F5F5">#${data.orderNumber}</strong> sudah dalam perjalanan.</p>
      <table>
        <tr><td style="color:#737373;width:40%">Nomor Resi</td><td style="color:#F5F5F5;font-family:monospace;font-weight:700">${data.trackingNumber}</td></tr>
        <tr style="border:none"><td style="color:#737373">Kurir</td><td style="color:#F5F5F5">${data.shippingMethod}</td></tr>
      </table>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/orders" class="btn">Lacak Pesanan →</a>
    `)
  );
}

// ── Email verifikasi akun ─────────────────────────────────────────────────────
export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  await send(to, "Verifikasi Email Akun — DUTCH.IND",
    baseTemplate("Verifikasi Email", `
      <h1>Verifikasi Email Kamu</h1>
      <p>Halo <strong style="color:#F5F5F5">${name}</strong>,</p>
      <p>Klik tombol di bawah untuk memverifikasi email kamu. Link berlaku <strong style="color:#F5F5F5">24 jam</strong>.</p>
      <a href="${url}" class="btn">Verifikasi Sekarang →</a>
      <p style="font-size:12px;color:#525252;margin-top:24px;word-break:break-all">Link: ${url}</p>
      <p style="font-size:12px;color:#525252">Jika kamu tidak mendaftar, abaikan email ini.</p>
    `)
  );
}

// ── Email reset password ──────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  await send(to, "Reset Password — DUTCH.IND",
    baseTemplate("Reset Password", `
      <h1>Reset Password</h1>
      <p>Halo <strong style="color:#F5F5F5">${name}</strong>,</p>
      <p>Klik tombol di bawah untuk membuat password baru. Link berlaku <strong style="color:#F5F5F5">1 jam</strong>.</p>
      <a href="${url}" class="btn">Reset Password →</a>
      <p style="font-size:12px;color:#525252;margin-top:24px;word-break:break-all">Link: ${url}</p>
      <p style="font-size:12px;color:#525252">Jika kamu tidak meminta ini, abaikan email ini.</p>
    `)
  );
}

// ── Email restock notifikasi ─────────────────────────────────────────────────
export async function sendRestockEmail(
  to: string,
  data: { productName: string; productSlug: string; price: number }
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/products/${data.productSlug}`;
  await send(to, `${data.productName} Kembali Tersedia — DUTCH.IND`,
    baseTemplate("Produk Kembali Tersedia", `
      <h1>Stok Kembali!</h1>
      <p>Kabar baik! Produk yang kamu pantau sudah kembali tersedia:</p>
      <div class="num">${data.productName}</div>
      <p>Harga: <strong style="color:#F5F5F5">${formatPrice(data.price)}</strong></p>
      <p style="font-size:12px;color:#737373">Jangan sampai kehabisan lagi — stok terbatas!</p>
      <a href="${url}" class="btn">Beli Sekarang →</a>
      <p style="font-size:11px;color:#525252;margin-top:24px">Kamu menerima email ini karena kamu mendaftar notifikasi stok untuk produk ini.</p>
    `)
  );
}

// ── Drop live notification ───────────────────────────────────────────────────
export async function sendDropLiveEmail(
  to: string,
  data: { name: string; dropName: string; dropSlug: string; couponCode?: string }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dutch-indd.vercel.app";
  await send(to, `🔥 ${data.dropName} — Drop Sekarang LIVE! DUTCH.IND`,
    baseTemplate("Drop Live!", `
      <h1>${data.dropName} — Sekarang Live!</h1>
      <p>Halo <strong style="color:#F5F5F5">${data.name}</strong>,</p>
      <p>Drop yang kamu tunggu-tunggu sudah tersedia sekarang. Stok sangat terbatas!</p>
      ${data.couponCode ? `
        <p>Gunakan kode eksklusif untuk mendapat diskon spesial:</p>
        <div class="num">${data.couponCode}</div>
      ` : ""}
      <a href="${appUrl}/drops/${data.dropSlug}" class="btn">Lihat Drop Sekarang →</a>
      <p style="font-size:11px;color:#525252;margin-top:24px">
        Kamu menerima email ini karena mendaftar ke waitlist drop ini.
      </p>
    `)
  );
}

// ── Abandoned cart email ─────────────────────────────────────────────────────
export async function sendAbandonedCartEmail(
  to: string,
  data: {
    name: string;
    items: Array<{ name: string; slug: string; size: string; price: number; image: string | null; qty: number }>;
  }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dutch-indd.vercel.app";
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #262626">
          ${item.image ? `<img src="${item.image}" width="50" height="60" style="object-fit:cover;display:inline-block;vertical-align:middle;margin-right:12px" alt="${item.name}"/>` : ""}
          <span style="vertical-align:middle;font-size:13px;color:#D4D4D4">${item.name} <span style="color:#737373">/ ${item.size}</span></span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #262626;text-align:right;color:#D4D4D4;font-size:13px">
          Rp${item.price.toLocaleString("id-ID")} × ${item.qty}
        </td>
      </tr>`
    )
    .join("");

  await send(to, `${data.name}, kamu masih punya barang di keranjang — DUTCH.IND`,
    baseTemplate("Keranjang Belanjamu", `
      <h1>Keranjangmu Menunggu</h1>
      <p>Halo <strong style="color:#F5F5F5">${data.name}</strong>,</p>
      <p>Kamu meninggalkan beberapa item di keranjang. Stok kami terbatas — selesaikan pesananmu sebelum kehabisan.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">${itemRows}</table>
      <a href="${appUrl}/cart" class="btn">Lanjutkan Belanja →</a>
      <p style="font-size:11px;color:#525252;margin-top:24px">
        Jika kamu tidak ingin menerima email ini, abaikan saja.
      </p>
    `)
  );
}

// ── Email pengingat pembayaran (sebelum deadline) ─────────────────────────────
export async function sendPaymentReminderEmail(
  to: string,
  data: {
    recipientName: string;
    orderNumber: string;
    orderId: string;
    total: number;
    paymentDeadline: Date;
    paymentMethod: string;
    hoursLeft: number;
  }
) {
  const methodLabel = data.paymentMethod === "TRANSFER" ? "Transfer Bank"
    : data.paymentMethod === "QRIS" ? "QRIS"
    : data.paymentMethod === "EWALLET" ? "E-Wallet"
    : data.paymentMethod;

  const deadlineStr = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Makassar",
  }).format(data.paymentDeadline);

  await send(to, `⏰ Segera Bayar — Pesanan #${data.orderNumber} Hampir Kedaluwarsa`,
    baseTemplate("Pengingat Pembayaran", `
      <h1>Pesananmu Hampir Kedaluwarsa!</h1>
      <p>Halo <strong style="color:#F5F5F5">${data.recipientName}</strong>,</p>
      <p>Pesanan <strong style="color:#F5F5F5">#${data.orderNumber}</strong> belum dibayar dan akan otomatis dibatalkan dalam
        <strong style="color:#EF4444">${data.hoursLeft} jam</strong>.
      </p>
      <table>
        <tr><td style="color:#737373;width:40%">No. Pesanan</td><td style="color:#F5F5F5;font-family:monospace;font-weight:700">#${data.orderNumber}</td></tr>
        <tr><td style="color:#737373">Total</td><td style="color:#F5F5F5;font-weight:700">${formatPrice(data.total)}</td></tr>
        <tr><td style="color:#737373">Metode</td><td style="color:#F5F5F5">${methodLabel}</td></tr>
        <tr style="border:none"><td style="color:#737373">Batas Bayar</td><td style="color:#EF4444;font-weight:700">${deadlineStr}</td></tr>
      </table>
      <p>Segera selesaikan pembayaran dan upload bukti transfer agar pesananmu diproses.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/orders/${data.orderId}" class="btn">Bayar Sekarang →</a>
      <p style="font-size:12px;color:#525252;margin-top:20px">Jika sudah bayar, upload bukti pembayaran di halaman pesanan.</p>
    `)
  );
}

// ── Email selamat datang ──────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  await send(to, `Selamat Datang di DUTCH.IND, ${name}!`,
    baseTemplate("Selamat Datang", `
      <h1>Selamat Datang di DUTCH.IND!</h1>
      <p>Halo <strong style="color:#F5F5F5">${name}</strong>,</p>
      <p>Akun kamu sudah berhasil dibuat. Selamat bergabung dengan komunitas streetwear premium Indonesia.</p>
      <p>Gunakan kode berikut untuk diskon <strong style="color:#F5F5F5">10%</strong> di pembelian pertamamu:</p>
      <div class="num">WELCOME10</div>
      <p style="font-size:12px;color:#525252">Min. pembelian Rp200.000 · Maks. potongan Rp100.000</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="btn">Mulai Belanja →</a>
    `)
  );
}
