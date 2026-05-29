import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatPrice, formatDate, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { ChevronLeft, MapPin, CreditCard, Package, MessageCircle, Instagram, Printer } from "lucide-react";
import TrackingPanel from "@/components/order/TrackingPanel";
import OrderReviewSection from "@/components/order/OrderReviewSection";
import ManualPaymentPanel from "@/components/order/ManualPaymentPanel";
import CancelOrderButton from "@/components/order/CancelOrderButton";
import ReturnRequestButton from "@/components/order/ReturnRequestButton";

const STATUS_STEPS = [
  { key: "AWAITING_PAYMENT", label: "Menunggu Bayar" },
  { key: "PROCESSING",       label: "Diproses" },
  { key: "SHIPPED",          label: "Dikirim" },
  { key: "DELIVERED",        label: "Terkirim" },
  { key: "COMPLETED",        label: "Selesai" },
];

type Props = { params: Promise<{ id: string }> };

async function geocodeCity(city: string, province: string): Promise<[number, number] | null> {
  try {
    const q   = `${city}, ${province}, Indonesia`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=id`;
    const res = await fetch(url, {
      headers: { "User-Agent": "dutch-ind-store/1.0" },
      next: { revalidate: 86400 },
    });
    const data = await res.json();
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
          variant: true,
        },
      },
      address: true,
      payment: true,
      coupon: { select: { code: true, description: true } },
    },
  });

  if (!order) notFound();

  /* ── Contact config (untuk tombol WA/IG di panel COD) ── */
  let waNumber = "";
  let igHandle = "";
  if (order.payment?.method === "COD") {
    const contactRow = await prisma.setting.findUnique({ where: { key: "contact.config" } });
    if (contactRow) {
      try {
        const cfg = JSON.parse(contactRow.value);
        waNumber = cfg.whatsapp || "";
        igHandle = cfg.instagram || "";
      } catch {}
    }
  }

  /* ── Tracking data ── */
  let cachedTracking:    any            = null;
  let trackingUpdatedAt: Date | null    = null;
  let originCoords:      [number, number] | null = null;
  let destCoords:        [number, number] | null = null;
  let originCity = "Jakarta";

  const showTracking = !!(order.trackingNumber) ||
    ["SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status);

  if (showTracking) {
    const [cached, latSetting, lngSetting, citySettingRow, destGeo] = await Promise.all([
      order.trackingNumber
        ? prisma.setting.findUnique({ where: { key: `tracking:${id}` } })
        : null,
      prisma.setting.findUnique({ where: { key: "store.lat" } }),
      prisma.setting.findUnique({ where: { key: "store.lng" } }),
      prisma.setting.findUnique({ where: { key: "store.address" } }),
      geocodeCity(order.address.city, order.address.province),
    ]);

    if (cached) {
      try { cachedTracking = JSON.parse(cached.value); trackingUpdatedAt = cached.updatedAt; }
      catch {}
    }

    if (latSetting && lngSetting) {
      const lat = parseFloat(latSetting.value);
      const lng = parseFloat(lngSetting.value);
      if (!isNaN(lat) && !isNaN(lng)) originCoords = [lat, lng];
    }

    destCoords = destGeo;
    if (citySettingRow?.value) originCity = citySettingRow.value;
  }

  /* ── Reviews (only for COMPLETED / DELIVERED) ── */
  const canReview = order.status === "COMPLETED" || order.status === "DELIVERED";
  const canReturn = canReview;
  let reviewMap: Record<string, { id: string; rating: number; comment: string | null }> = {};

  const returnRequest = await prisma.returnRequest.findUnique({ where: { orderId: id } });

  if (canReview) {
    const productIds = [...new Set(order.items.map((i) => i.productId))];
    const reviews = await prisma.review.findMany({
      where: { userId: session.user.id, productId: { in: productIds } },
      select: { id: true, productId: true, rating: true, comment: true },
    });
    reviews.forEach((r) => { reviewMap[r.productId] = r; });
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen py-10">
      <div className="container-main max-w-3xl">
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-1 text-sm text-brand-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Pesanan Saya
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display tracking-widest uppercase">
              #{order.orderNumber}
            </h1>
            <p className="text-xs text-brand-gray-500 mt-1">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </span>
            <div className="flex gap-2 flex-wrap justify-end">
              <Link
                href={`/profile/orders/${order.id}/invoice`}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 hover:text-white border border-brand-gray-700 hover:border-white px-3 py-1.5 transition-colors"
              >
                <Printer className="w-3 h-3" />
                Invoice
              </Link>
              {["AWAITING_PAYMENT", "PROCESSING"].includes(order.status) && (
                <CancelOrderButton orderId={order.id} />
              )}
            </div>
          </div>
        </div>

        {/* Status timeline */}
        {!isCancelled && (
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-5 mb-5">
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => {
                const done   = i <= currentStepIndex;
                const isLast = i === STATUS_STEPS.length - 1;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${done ? "bg-white border-white text-black" : "border-brand-gray-600 text-brand-gray-600"}`}>
                        {i + 1}
                      </div>
                      <span className={`text-[9px] mt-1 text-center leading-tight max-w-[60px] ${done ? "text-white" : "text-brand-gray-600"}`}>
                        {step.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentStepIndex ? "bg-white" : "bg-brand-gray-700"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Items */}
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" /> Produk Dipesan
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-20 bg-brand-gray-800 flex-shrink-0 overflow-hidden">
                    {item.product.images[0] && (
                      <Image src={item.product.images[0].url} alt={item.product.name}
                             fill className="object-cover" sizes="64px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`}
                          className="font-semibold text-sm hover:text-brand-gray-300 transition-colors">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-brand-gray-400 mt-0.5">
                      Ukuran: {item.variant.size} &nbsp;·&nbsp; {item.quantity} pcs
                    </p>
                    <p className="text-xs text-brand-gray-400">{formatPrice(item.price)} / item</p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0">{formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping + Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Alamat Pengiriman
              </h2>
              <p className="text-sm font-semibold">{order.address.recipientName}</p>
              <p className="text-sm text-brand-gray-400">{order.address.phone}</p>
              <p className="text-sm text-brand-gray-400 mt-1 leading-relaxed">
                {order.address.street}, {order.address.district},{" "}
                {order.address.city}, {order.address.province} {order.address.postalCode}
              </p>
              {order.shippingMethod && (
                <p className="text-xs text-brand-gray-500 mt-2 uppercase tracking-wider">
                  Metode: {order.shippingMethod}
                </p>
              )}
            </div>

            <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Ringkasan Bayar
              </h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-gray-400">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray-400">Ongkir</span>
                  <span className={order.shippingCost === 0 ? "text-green-400" : ""}>
                    {order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Diskon{order.coupon ? ` (${order.coupon.code})` : ""}</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-brand-gray-700 pt-1.5 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
              {order.payment && (
                <div className="mt-3 pt-3 border-t border-brand-gray-800">
                  <p className="text-xs text-brand-gray-500">
                    Metode:{" "}
                    <span className="text-white">
                      {order.payment.method === "TRANSFER" ? "Transfer Bank" :
                       order.payment.method === "QRIS"     ? "QRIS"              :
                       order.payment.method === "EWALLET"  ? "E-Wallet"          :
                       order.payment.method === "MANUAL"   ? "Transfer / QRIS / E-Wallet" :
                       order.payment.method === "COD"      ? "COD — Bayar di Tempat"      :
                                                             "Midtrans"}
                    </span>
                  </p>
                  <p className="text-xs text-brand-gray-500 mt-0.5">
                    Status Bayar:{" "}
                    <span className={
                      order.payment.status === "SUCCESS"              ? "text-green-400"  :
                      order.payment.status === "REJECTED"             ? "text-red-400"    :
                      order.payment.status === "WAITING_CONFIRMATION" ? "text-yellow-400" :
                      order.payment.status === "FAILED"               ? "text-red-400"    :
                                                                        "text-brand-gray-400"
                    }>
                      {order.payment.status === "SUCCESS"              ? "Lunas"                   :
                       order.payment.status === "WAITING_CONFIRMATION" ? "Menunggu Konfirmasi"      :
                       order.payment.status === "REJECTED"             ? "Ditolak"                  :
                       order.payment.status === "MANUAL_PENDING"       ? "Belum Transfer"           :
                       order.payment.status === "COD_PENDING"          ? "Bayar saat diterima"      :
                       order.payment.status === "FAILED"               ? "Gagal"                    :
                                                                         "Pending"}
                    </span>
                  </p>
                  {order.payment.paidAt && (
                    <p className="text-xs text-brand-gray-500 mt-0.5">
                      Dibayar: {formatDate(order.payment.paidAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Manual payment panel */}
          {["MANUAL", "TRANSFER", "QRIS", "EWALLET"].includes(order.payment?.method ?? "") &&
           !["SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status) &&
           order.payment?.status !== "SUCCESS" && (
            <ManualPaymentPanel
              orderId={order.id}
              amount={order.total}
              status={order.payment!.status}
              paymentMethod={order.payment!.method}
              rejectedReason={order.payment!.rejectedReason}
              paymentDeadline={(order as any).paymentDeadline ? (order as any).paymentDeadline.toISOString() : null}
            />
          )}

          {/* COD panel */}
          {order.payment?.method === "COD" && (() => {
            const meetMatch = order.notes?.match(/\[COD\] Titik pertemuan: (.+?)(\n|$)/);
            const meetingPoint = meetMatch ? meetMatch[1].trim() : null;

            const waMsg = encodeURIComponent(
              `Halo admin DUTCH.IND! Saya ingin konfirmasi pesanan COD saya:\n` +
              `📦 No. Pesanan: #${order.orderNumber}\n` +
              `💰 Total: ${formatPrice(order.total)}\n` +
              (meetingPoint ? `📍 Titik Pertemuan: ${meetingPoint}\n` : "") +
              `\nMohon konfirmasi waktu pertemuannya. Terima kasih!`
            );
            const waLink = waNumber ? `https://wa.me/${waNumber.replace(/\D/g, "")}?text=${waMsg}` : null;
            const igLink = igHandle ? `https://instagram.com/${igHandle.replace("@", "")}` : null;

            return (
              <div className={`border p-5 space-y-3 ${
                order.payment.status === "SUCCESS"
                  ? "bg-brand-gray-900 border-green-800"
                  : "bg-amber-900/10 border-amber-800/50"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    {order.payment.status === "SUCCESS" ? "✅ COD — Sudah Lunas" : "📍 COD — Pertemuan Langsung"}
                  </span>
                </div>

                {order.payment.status !== "SUCCESS" ? (
                  <div className="space-y-3">
                    {meetingPoint && (
                      <div className="bg-amber-900/20 border border-amber-800/40 px-3 py-2">
                        <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-0.5">Titik Pertemuan</p>
                        <p className="text-sm text-white font-semibold">{meetingPoint}</p>
                      </div>
                    )}
                    <p className="text-sm text-amber-300/80">
                      {order.payment.status === "COD_PENDING"
                        ? <>Siapkan <span className="font-bold text-white">{formatPrice(order.total)}</span> (tunai) saat penjual tiba.</>
                        : <>Pembayaran via Transfer/QRIS — silakan selesaikan pembayaran.</>
                      }
                    </p>
                    <p className="text-xs text-brand-gray-500">
                      Admin akan menghubungi kamu via WhatsApp untuk konfirmasi waktu &amp; lokasi pertemuan.
                    </p>

                    {/* Tombol hubungi admin */}
                    {(waLink || igLink) && (
                      <div className="pt-1 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Hubungi Admin</p>
                        <div className="flex flex-wrap gap-2">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-green-900/40 border border-green-700 text-green-400 hover:bg-green-900/60 transition-colors text-xs font-bold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Chat WhatsApp
                            </a>
                          )}
                          {igLink && (
                            <a
                              href={igLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-pink-900/30 border border-pink-700/50 text-pink-400 hover:bg-pink-900/50 transition-colors text-xs font-bold"
                            >
                              <Instagram className="w-3.5 h-3.5" />
                              Instagram
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-green-400/80">Pembayaran COD telah diterima. Terima kasih!</p>
                )}
              </div>
            );
          })()}

          {/* Tracking panel — shows whenever SHIPPED/DELIVERED, resi optional */}
          {showTracking && (
            <TrackingPanel
              orderId={order.id}
              trackingNumber={order.trackingNumber ?? ""}
              trackingCarrier={order.trackingCarrier}
              orderStatus={order.status}
              initialTracking={cachedTracking}
              initialUpdatedAt={trackingUpdatedAt ? trackingUpdatedAt.toISOString() : null}
              originCity={originCity}
              destCity={order.address.city}
              originCoords={originCoords}
              destCoords={destCoords}
            />
          )}

          {/* Review section — COMPLETED or DELIVERED */}
          {canReview && (
            <OrderReviewSection
              items={order.items.map((item) => ({
                productId:     item.productId,
                productSlug:   item.product.slug,
                productName:   item.product.name,
                productImage:  item.product.images[0]?.url ?? null,
                variantSize:   item.variant.size,
                existingReview: reviewMap[item.productId] ?? null,
              }))}
            />
          )}

          {/* Return request */}
          {canReturn && (
            <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3">Return / Pengembalian</h2>
              <ReturnRequestButton
                orderId={order.id}
                existingReturn={returnRequest as any}
              />
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-1">Catatan Pesanan</p>
              <p className="text-sm text-brand-gray-400">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
