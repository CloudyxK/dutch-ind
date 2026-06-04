import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import TrackingActions from "./TrackingActions";

export async function generateMetadata({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return { title: `Lacak #${orderNumber} — DUTCH.IND` };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:          { label: "Menunggu Pembayaran", color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/30"  },
  AWAITING_PAYMENT: { label: "Menunggu Pembayaran", color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/30"  },
  PAID:             { label: "Pembayaran Diterima",  color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/30"    },
  PROCESSING:       { label: "Sedang Diproses",      color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30"  },
  SHIPPED:          { label: "Dalam Pengiriman",     color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30"  },
  DELIVERED:        { label: "Sudah Diterima",       color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/30"   },
  COMPLETED:        { label: "Selesai",              color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/30"   },
  CANCELLED:        { label: "Dibatalkan",           color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/30"     },
};

const TIMELINE_STEPS = [
  { key: "AWAITING_PAYMENT", keys: ["PENDING", "AWAITING_PAYMENT"], label: "Pesanan Diterima", icon: "📋" },
  { key: "PROCESSING",       keys: ["PAID", "PROCESSING"],          label: "Diproses",         icon: "📦" },
  { key: "SHIPPED",          keys: ["SHIPPED"],                     label: "Dikirim",           icon: "🚚" },
  { key: "DELIVERED",        keys: ["DELIVERED", "COMPLETED"],      label: "Diterima",          icon: "✅" },
];

const STEP_ORDER: Record<string, number> = {
  PENDING: 0, AWAITING_PAYMENT: 0, PAID: 1, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3, COMPLETED: 3, CANCELLED: -1,
};

// Carrier tracking links
const CARRIER_LINKS: Record<string, (resi: string) => string> = {
  jne:          (r) => `https://www.jne.co.id/id/tracking/trace/${r}`,
  jnt:          (r) => `https://jet.id/shipment-tracking?awb=${r}`,
  sicepat:      (r) => `https://www.sicepat.com/checkAwb?awb=${r}`,
  pos:          (r) => `https://www.posindonesia.co.id/en/tracking?awb=${r}`,
  anteraja:     (r) => `https://anteraja.id/tracking?awb=${r}`,
  gosend:       (r) => `https://driver.gojek.com/en/track-package?waybill=${r}`,
};

function getCarrierLink(carrier: string | null, resi: string): string | null {
  if (!carrier || !resi) return null;
  const key = carrier.toLowerCase().replace(/[^a-z]/g, "");
  for (const [k, fn] of Object.entries(CARRIER_LINKS)) {
    if (key.includes(k)) return fn(resi);
  }
  return null;
}

export default async function TrackOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;

  const [order, trackingCache] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true } },
            variant: { select: { size: true } },
          },
        },
        payment: { select: { method: true, status: true } },
        address: { select: { recipientName: true, city: true, province: true } },
      },
    }),
    // Will be fetched after we know the order id
    null as any,
  ]);

  if (!order) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gray-500 mb-4">404</p>
          <h1 className="text-2xl font-display font-bold tracking-widest uppercase text-white mb-3">Pesanan Tidak Ditemukan</h1>
          <p className="text-sm text-brand-gray-400 mb-8">
            Pesanan nomor <span className="font-mono text-white">{orderNumber}</span> tidak ditemukan.
          </p>
          <form action="/track" method="GET" className="flex gap-2 mb-6">
            <input name="q" type="text" placeholder="Coba nomor lain…"
              className="flex-1 bg-brand-gray-900 border border-brand-gray-700 text-white text-sm px-3 py-2.5 placeholder-brand-gray-600 focus:outline-none focus:border-white font-mono" />
            <button type="submit" className="px-4 py-2.5 bg-white text-black text-sm font-semibold uppercase tracking-wider hover:bg-brand-gray-200 transition-colors">
              Cari
            </button>
          </form>
          <Link href="/" className="text-xs text-brand-gray-500 hover:text-white transition-colors">← Beranda</Link>
        </div>
      </main>
    );
  }

  // Fetch cached tracking data
  let trackingEvents: Array<{ date: string; description: string; location?: string }> = [];
  if (order.trackingNumber) {
    try {
      const cached = await prisma.setting.findUnique({ where: { key: `tracking:${order.id}` } });
      if (cached?.value) {
        const data = JSON.parse(cached.value);
        if (data.events && Array.isArray(data.events)) {
          trackingEvents = data.events.slice(0, 10);
        }
      }
    } catch {}
  }

  const statusCfg  = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const currentStep = STEP_ORDER[order.status] ?? 0;
  const isCancelled = order.status === "CANCELLED";
  const carrierLink = getCarrierLink(order.trackingCarrier, order.trackingNumber ?? "");

  return (
    <main className="min-h-screen bg-black px-4 py-12 md:py-20">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gray-500 mb-2">Order Tracking</p>
          <h1 className="text-2xl font-display font-bold tracking-widest uppercase text-white">Lacak Pesanan</h1>
        </div>

        {/* Main card */}
        <div className="border border-brand-gray-700 bg-brand-gray-900/40 overflow-hidden">

          {/* Order header */}
          <div className="px-5 py-4 border-b border-brand-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-1">Nomor Pesanan</p>
              <p className="font-mono font-bold text-white text-lg tracking-wider">#{order.orderNumber}</p>
              <p className="text-xs text-brand-gray-500 mt-1">{formatDateTime(order.createdAt)}</p>
            </div>
            <span className={`self-start sm:self-center px-3 py-1.5 text-xs font-semibold uppercase tracking-widest border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Tracking number + carrier */}
          {order.trackingNumber && (
            <div className="px-5 py-4 border-b border-brand-gray-700 bg-brand-gray-800/30">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-2">Nomor Resi</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono font-bold text-white text-base tracking-wider">{order.trackingNumber}</span>
                {order.trackingCarrier && (
                  <span className="text-xs text-brand-gray-500 bg-brand-gray-800 px-2 py-0.5 uppercase tracking-wider">
                    {order.trackingCarrier}
                  </span>
                )}
                {/* Copy + carrier link — client component */}
                <TrackingActions
                  trackingNumber={order.trackingNumber}
                  carrierLink={carrierLink}
                />
              </div>
            </div>
          )}

          {/* Visual timeline */}
          {!isCancelled && (
            <div className="px-5 py-6 border-b border-brand-gray-700">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-6">Status Pengiriman</p>
              <div className="relative">
                {/* Horizontal connector line */}
                <div className="absolute top-4 left-4 right-4 h-px bg-brand-gray-700 hidden sm:block" />
                <div
                  className="absolute top-4 left-4 h-px bg-white hidden sm:block transition-all duration-700"
                  style={{ width: `${Math.max(0, (currentStep / (TIMELINE_STEPS.length - 1)) * 100)}%` }}
                />

                <div className="flex items-start justify-between gap-2">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isReached = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                        <div className={`relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all duration-300 ${
                          isReached
                            ? isCurrent
                              ? "border-white bg-white shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                              : "border-white bg-white"
                            : "border-brand-gray-700 bg-brand-gray-900"
                        }`}>
                          <span style={{ filter: isReached ? "none" : "grayscale(1) opacity(0.3)" }}>
                            {step.icon}
                          </span>
                        </div>
                        <p className={`text-[10px] text-center leading-tight ${
                          isCurrent ? "text-white font-bold" : isReached ? "text-brand-gray-400" : "text-brand-gray-600"
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Carrier tracking events */}
          {trackingEvents.length > 0 && (
            <div className="px-5 py-5 border-b border-brand-gray-700">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-4">Riwayat Pengiriman</p>
              <div className="relative pl-5 space-y-4">
                <div className="absolute left-1.5 top-0 bottom-0 w-px bg-brand-gray-700" />
                {trackingEvents.map((event, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                      i === 0 ? "border-white bg-white" : "border-brand-gray-600 bg-brand-gray-900"
                    }`} />
                    <div>
                      <p className={`text-xs font-medium ${i === 0 ? "text-white" : "text-brand-gray-300"}`}>
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {event.location && (
                          <span className="text-[10px] text-brand-gray-500">{event.location}</span>
                        )}
                        {event.date && (
                          <span className="text-[10px] text-brand-gray-600">{event.date}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping + Payment details */}
          <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-brand-gray-700 text-xs">
            {order.shippingMethod && (
              <div>
                <p className="text-brand-gray-500 uppercase tracking-widest text-[10px] mb-1">Kurir</p>
                <p className="text-white">{order.shippingMethod}</p>
              </div>
            )}
            {order.payment?.method && (
              <div>
                <p className="text-brand-gray-500 uppercase tracking-widest text-[10px] mb-1">Pembayaran</p>
                <p className="text-white">{order.payment.method}</p>
              </div>
            )}
            {order.address?.recipientName && (
              <div className="col-span-2">
                <p className="text-brand-gray-500 uppercase tracking-widest text-[10px] mb-1">Dikirim ke</p>
                <p className="text-white">{order.address.recipientName}</p>
                {order.address.city && (
                  <p className="text-brand-gray-400">{order.address.city}, {order.address.province}</p>
                )}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="px-5 py-4 border-b border-brand-gray-700">
            <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-3">Item Pesanan</p>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm gap-2">
                  <div className="min-w-0">
                    <Link href={`/products/${item.product.slug}`} className="text-white hover:text-brand-gray-300 transition-colors truncate block">
                      {item.product.name}
                    </Link>
                    <span className="text-brand-gray-500 text-xs">{item.variant.size} × {item.quantity}</span>
                  </div>
                  <span className="text-brand-gray-300 font-mono text-xs flex-shrink-0">{formatPrice(item.subtotal)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">Total</span>
            <span className="text-lg font-bold text-white font-mono">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/track" className="flex-1 text-center py-2.5 text-sm border border-brand-gray-700 text-brand-gray-400 hover:text-white hover:border-brand-gray-500 transition-colors uppercase tracking-widest">
            Lacak Pesanan Lain
          </Link>
          <Link href="/products" className="flex-1 text-center py-2.5 text-sm bg-white text-black hover:bg-brand-gray-200 transition-colors uppercase tracking-widest font-semibold">
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </main>
  );
}
