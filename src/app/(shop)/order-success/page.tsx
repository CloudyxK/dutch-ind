import Link from "next/link";
import { CheckCircle2, Truck } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: {
      items: {
        include: {
          product: { include: { images: true } },
          variant: true,
        },
      },
      address: true,
      payment: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="min-h-screen py-16">
      <div className="container-main max-w-2xl">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-400" />
          </div>
          <h1 className="text-3xl font-display tracking-wider uppercase">
            Pesanan Dikonfirmasi!
          </h1>
          <p className="text-brand-gray-400 text-sm mt-2">
            Terima kasih! Pesanan kamu sedang diproses.
          </p>
          <p className="text-white font-mono text-lg mt-3 font-bold">
            #{order.orderNumber}
          </p>
          <p className="text-xs text-brand-gray-500 mt-1">
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* Order details */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 divide-y divide-brand-gray-700">
          {/* Items */}
          <div className="p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4">
              Item Pesanan
            </h2>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="relative w-12 h-14 bg-brand-gray-800 flex-shrink-0 overflow-hidden">
                    {item.product.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-brand-gray-500">
                      {item.variant.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">{formatPrice(item.subtotal)}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals */}
          <div className="p-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-gray-400">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-gray-400">Ongkir</span>
              <span>{order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Diskon</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-brand-gray-700 pt-2">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Shipping address */}
          <div className="p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3">
              Alamat Pengiriman
            </h2>
            <p className="text-sm">{order.address.recipientName}</p>
            <p className="text-sm text-brand-gray-400">{order.address.phone}</p>
            <p className="text-sm text-brand-gray-400 mt-1">
              {order.address.street}, {order.address.district},{" "}
              {order.address.city}, {order.address.province}{" "}
              {order.address.postalCode}
            </p>
          </div>

          {/* Payment status */}
          {order.payment && (
            <div className="p-6 flex items-center justify-between text-sm">
              <div>
                <p className="text-xs text-brand-gray-400 uppercase tracking-wider">
                  Status Pembayaran
                </p>
                <p className="font-semibold mt-0.5">
                  {order.payment.status === "SUCCESS" ? "Lunas" : "Menunggu Pembayaran"}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-bold uppercase ${
                  order.payment.status === "SUCCESS"
                    ? "bg-green-900/40 text-green-400"
                    : "bg-yellow-900/40 text-yellow-400"
                }`}
              >
                {order.payment.status === "SUCCESS" ? "Dibayar" : "Pending"}
              </span>
            </div>
          )}

          {/* Tracking number */}
          {order.trackingNumber && (
            <div className="p-6 flex items-center gap-4 text-sm bg-brand-gray-800/40">
              <Truck className="w-5 h-5 text-brand-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-brand-gray-400 uppercase tracking-wider">
                  Nomor Resi Pengiriman
                </p>
                <p className="font-mono font-bold text-white mt-0.5 text-base">
                  {order.trackingNumber}
                </p>
                <p className="text-[10px] text-brand-gray-500 mt-0.5">
                  Gunakan nomor ini untuk melacak paket kamu
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link href="/profile/orders" className="btn-primary flex-1 text-center">
            Lihat Pesanan Saya
          </Link>
          <Link href="/products" className="btn-secondary flex-1 text-center">
            Lanjut Belanja
          </Link>
        </div>

        {/* WA confirmation */}
        <a
          href={`https://wa.me/6285217733737?text=${encodeURIComponent(
            `Halo DUTCH.IND, saya baru saja melakukan pemesanan.\nNomor Order: #${order.orderNumber}\nNama: ${session?.user?.name || "Pelanggan"}\nTotal: Rp${order.total.toLocaleString("id-ID")}\n\nMohon konfirmasi pesanan saya. Terima kasih!`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full border border-green-800 text-green-400 hover:bg-green-900/20 transition-colors py-3 text-sm font-semibold mt-3"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Konfirmasi via WhatsApp
        </a>
      </div>
    </div>
  );
}
