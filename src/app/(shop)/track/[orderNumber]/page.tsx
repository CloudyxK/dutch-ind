import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { orderNumber: string };
}) {
  return {
    title: `Lacak #${params.orderNumber} — DUTCH.IND`,
  };
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  PENDING: {
    label: "Menunggu Pembayaran",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
  },
  PROCESSING: {
    label: "Diproses",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
  },
  SHIPPED: {
    label: "Dikirim",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
  },
  DELIVERED: {
    label: "Diterima",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
  },
};

// Timeline steps (exclude CANCELLED and PENDING for payment)
const TIMELINE_STEPS = [
  { key: "PENDING",    label: "Pesanan Diterima" },
  { key: "PROCESSING", label: "Diproses" },
  { key: "SHIPPED",    label: "Dikirim" },
  { key: "DELIVERED",  label: "Diterima" },
];

const STEP_ORDER: Record<string, number> = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function TrackOrderPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const { orderNumber } = params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: { select: { name: true } },
          variant:  { select: { size: true } },
        },
      },
      payment: { select: { method: true, status: true } },
    },
  });

  // Not found state
  if (!order) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gray-500 mb-4">
            404
          </p>
          <h1 className="text-2xl font-display font-bold tracking-widest uppercase text-white mb-3">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-sm text-brand-gray-400 mb-8">
            Pesanan dengan nomor{" "}
            <span className="font-mono text-white">{orderNumber}</span> tidak
            ditemukan. Pastikan nomor pesanan sudah benar.
          </p>

          {/* Search again */}
          <form action="/track" method="GET" className="flex gap-2 mb-6">
            <input
              name="q"
              type="text"
              placeholder="Coba nomor lain…"
              className="flex-1 bg-brand-gray-900 border border-brand-gray-700 text-white text-sm px-3 py-2.5 placeholder-brand-gray-600 focus:outline-none focus:border-white font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-white text-black text-sm font-semibold uppercase tracking-wider hover:bg-brand-gray-200 transition-colors"
            >
              Cari
            </button>
          </form>

          <Link href="/" className="text-xs text-brand-gray-500 hover:text-white transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const currentStep = STEP_ORDER[order.status] ?? 0;
  const isCancelled = order.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-black px-4 py-12 md:py-20">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gray-500 mb-2">
            Order Tracking
          </p>
          <h1 className="text-2xl font-display font-bold tracking-widest uppercase text-white">
            Lacak Pesanan
          </h1>
        </div>

        {/* Order summary card */}
        <div className="border border-brand-gray-700 bg-brand-gray-900/40">
          {/* Card header */}
          <div className="px-5 py-4 border-b border-brand-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-1">
                Nomor Pesanan
              </p>
              <p className="font-mono font-bold text-white text-lg tracking-wider">
                #{order.orderNumber}
              </p>
              <p className="text-xs text-brand-gray-500 mt-1">
                {formatDateTime(order.createdAt)}
              </p>
            </div>
            <span
              className={`self-start sm:self-center px-3 py-1.5 text-xs font-semibold uppercase tracking-widest border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}
            >
              {statusCfg.label}
            </span>
          </div>

          {/* Details grid */}
          <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-brand-gray-700">
            {order.payment?.method && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-1">
                  Metode Bayar
                </p>
                <p className="text-sm text-white font-medium">{order.payment.method}</p>
              </div>
            )}
            {order.shippingMethod && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-1">
                  Kurir
                </p>
                <p className="text-sm text-white font-medium">{order.shippingMethod}</p>
              </div>
            )}
            {order.trackingNumber && (
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-1">
                  Nomor Resi
                </p>
                <p className="text-sm text-white font-mono font-bold tracking-wider">
                  {order.trackingNumber}
                  {order.trackingCarrier && (
                    <span className="ml-2 text-brand-gray-500 font-normal text-xs">
                      ({order.trackingCarrier})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          {!isCancelled && (
            <div className="px-5 py-5 border-b border-brand-gray-700">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-5">
                Status Pengiriman
              </p>
              <div className="flex items-start gap-0">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = currentStep >= idx;
                  const isCurrent = currentStep === idx;
                  const isLast = idx === TIMELINE_STEPS.length - 1;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center">
                      <div className="flex items-center w-full">
                        {/* Dot */}
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ring-2 transition-colors ${
                            isCompleted
                              ? "bg-white ring-white"
                              : "bg-transparent ring-brand-gray-700"
                          } ${isCurrent ? "ring-offset-1 ring-offset-black" : ""}`}
                        />
                        {/* Line */}
                        {!isLast && (
                          <div
                            className={`flex-1 h-px transition-colors ${
                              currentStep > idx ? "bg-white" : "bg-brand-gray-700"
                            }`}
                          />
                        )}
                      </div>
                      <p
                        className={`mt-2 text-[10px] text-center leading-tight w-full pr-1 ${
                          isCurrent
                            ? "text-white font-semibold"
                            : isCompleted
                            ? "text-brand-gray-400"
                            : "text-brand-gray-600"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="px-5 py-4 border-b border-brand-gray-700">
            <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-3">
              Item Pesanan
            </p>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="text-white">{item.product.name}</span>
                    <span className="text-brand-gray-500 ml-2 text-xs">
                      {item.variant.size}
                    </span>
                    <span className="text-brand-gray-600 ml-1 text-xs">
                      × {item.quantity}
                    </span>
                  </div>
                  <span className="text-brand-gray-300 font-mono text-xs">
                    {formatPrice(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-gray-400">
              Total
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/track"
            className="flex-1 text-center py-2.5 text-sm border border-brand-gray-700 text-brand-gray-400 hover:text-white hover:border-brand-gray-500 transition-colors uppercase tracking-widest"
          >
            Lacak Pesanan Lain
          </Link>
          <Link
            href="/products"
            className="flex-1 text-center py-2.5 text-sm bg-white text-black hover:bg-brand-gray-200 transition-colors uppercase tracking-widest font-semibold"
          >
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </main>
  );
}
