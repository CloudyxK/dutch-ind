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
      </div>
    </div>
  );
}
