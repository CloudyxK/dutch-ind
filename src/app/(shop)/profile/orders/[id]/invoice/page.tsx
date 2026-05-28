import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import PrintButton from "@/components/order/PrintButton";

type Props = { params: Promise<{ id: string }> };

export default async function InvoicePage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true } },
          variant:  { select: { size: true } },
        },
      },
      address: true,
      payment: true,
      coupon: { select: { code: true } },
      user:   { select: { name: true, email: true } },
    },
  });

  if (!order) notFound();

  const paymentLabel =
    order.payment?.method === "MANUAL" ? "Transfer / QRIS / E-Wallet" :
    order.payment?.method === "COD"    ? "COD — Bayar di Tempat"      :
                                         "Midtrans (Online)";

  const statusLabel: Record<string, string> = {
    AWAITING_PAYMENT: "Menunggu Pembayaran",
    PROCESSING:       "Diproses",
    SHIPPED:          "Dikirim",
    DELIVERED:        "Terkirim",
    COMPLETED:        "Selesai",
    CANCELLED:        "Dibatalkan",
  };

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <a
          href={`/profile/orders/${id}`}
          className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-brand-gray-600 text-brand-gray-300 hover:border-white hover:text-white transition-colors bg-brand-black"
        >
          ← Kembali
        </a>
        <PrintButton />
      </div>

      {/* Invoice — styled for print */}
      <div className="invoice-root">
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; color: black !important; }
            .invoice-root { padding: 32px; }
          }
          @media screen {
            .invoice-root {
              max-width: 720px;
              margin: 0 auto;
              padding: 80px 24px 48px;
              min-height: 100vh;
            }
          }
          .inv-table { width: 100%; border-collapse: collapse; }
          .inv-table th, .inv-table td {
            padding: 8px 12px;
            text-align: left;
            font-size: 12px;
          }
          .inv-table th { font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
          .inv-table tr + tr td { border-top: 1px solid currentColor; opacity: 0.15; }
          .inv-table tr + tr td { opacity: 1; border-top-color: rgba(255,255,255,0.08); }
          @media print {
            .inv-table tr + tr td { border-top-color: #e5e7eb; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-display uppercase tracking-[0.2em]">DUTCH.IND</h1>
            <p className="text-xs mt-1 opacity-50 tracking-wider uppercase">Invoice / Bukti Pembelian</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold font-mono">#{order.orderNumber}</p>
            <p className="text-xs opacity-50 mt-0.5">{formatDate(order.createdAt)}</p>
            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-current opacity-70">
              {statusLabel[order.status] ?? order.status}
            </span>
          </div>
        </div>

        <div className="h-px bg-current opacity-10 mb-8" />

        {/* Bill to + Ship to */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">Pembeli</p>
            <p className="text-sm font-semibold">{order.user.name}</p>
            <p className="text-xs opacity-60">{order.user.email}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">Alamat Pengiriman</p>
            <p className="text-sm font-semibold">{order.address.recipientName}</p>
            <p className="text-xs opacity-60">{order.address.phone}</p>
            <p className="text-xs opacity-60 mt-0.5 leading-relaxed">
              {order.address.street}, {order.address.district},{" "}
              {order.address.city}, {order.address.province} {order.address.postalCode}
            </p>
          </div>
        </div>

        {/* Items table */}
        <table className="inv-table mb-8">
          <thead>
            <tr className="border-b border-current opacity-20">
              <th className="pb-3" style={{ width: "40%" }}>Produk</th>
              <th className="pb-3 text-center">Ukuran</th>
              <th className="pb-3 text-center">Qty</th>
              <th className="pb-3 text-right">Harga</th>
              <th className="pb-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2.5 font-medium">{item.product.name}</td>
                <td className="py-2.5 text-center opacity-70">{item.variant.size}</td>
                <td className="py-2.5 text-center opacity-70">{item.quantity}</td>
                <td className="py-2.5 text-right opacity-70">{formatPrice(item.price)}</td>
                <td className="py-2.5 text-right font-semibold">{formatPrice(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-56 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="opacity-60">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Ongkos Kirim</span>
              <span>{order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Diskon{order.coupon ? ` (${order.coupon.code})` : ""}</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-current opacity-10 pt-1.5" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div className="border border-current opacity-[0.15] mb-8" />
        <div className="grid grid-cols-2 gap-6 text-xs opacity-60">
          <div>
            <p className="font-bold uppercase tracking-widest mb-1 opacity-60">Metode Pembayaran</p>
            <p>{paymentLabel}</p>
          </div>
          {order.shippingMethod && (
            <div>
              <p className="font-bold uppercase tracking-widest mb-1 opacity-60">Ekspedisi</p>
              <p>{order.shippingMethod}</p>
            </div>
          )}
          {order.trackingNumber && (
            <div>
              <p className="font-bold uppercase tracking-widest mb-1 opacity-60">No. Resi</p>
              <p className="font-mono">{order.trackingNumber}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-current opacity-[0.08] text-[10px] opacity-30 text-center">
          <p>DUTCH.IND — Samarinda, Kalimantan Timur · adinbilok@gmail.com</p>
          <p className="mt-0.5">Dokumen ini digenerate otomatis. Simpan sebagai bukti pembelian.</p>
        </div>
      </div>
    </>
  );
}
