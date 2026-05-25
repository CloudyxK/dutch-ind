import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react";

async function getAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    revenueThisMonth,
    revenueLast30Days,
    ordersByStatus,
    topProducts,
    salesByDay,
  ] = await Promise.all([
    // Pendapatan bulan ini
    prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
      _count: true,
    }),

    // 30 hari terakhir
    prisma.payment.findMany({
      where: { status: "SUCCESS", paidAt: { gte: thirtyDaysAgo } },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: "asc" },
    }),

    // Pesanan per status
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),

    // Produk terlaris
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    }),

    // Penjualan 7 hari terakhir
    prisma.order.findMany({
      where: {
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: { total: true, createdAt: true },
    }),
  ]);

  // Enrichi data top products
  const enrichedTopProducts = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, price: true },
      });
      return { ...item, product };
    })
  );

  // Group sales by day
  const salesMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    salesMap[d.toISOString().split("T")[0]] = 0;
  }
  salesByDay.forEach((order) => {
    const key = order.createdAt.toISOString().split("T")[0];
    if (key in salesMap) salesMap[key] = (salesMap[key] || 0) + order.total;
  });

  return {
    revenueThisMonth: revenueThisMonth._sum.amount || 0,
    transactionsThisMonth: revenueThisMonth._count,
    ordersByStatus,
    topProducts: enrichedTopProducts,
    salesByDay: Object.entries(salesMap).map(([date, revenue]) => ({ date, revenue })),
  };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu", AWAITING_PAYMENT: "Menunggu Bayar",
  PAID: "Dibayar", PROCESSING: "Diproses",
  SHIPPED: "Dikirim", DELIVERED: "Terkirim", CANCELLED: "Dibatalkan",
};

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  const maxRevenue = Math.max(...data.salesByDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display tracking-widest uppercase text-white">Analitik</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-brand-gray-500" />
            <span className="text-xs text-brand-gray-500 uppercase tracking-wider">Bulan Ini</span>
          </div>
          <p className="text-3xl font-bold">{formatPrice(data.revenueThisMonth)}</p>
          <p className="text-xs text-brand-gray-500 mt-1">
            dari {data.transactionsThisMonth} transaksi
          </p>
        </div>

        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <ShoppingCart className="w-5 h-5 text-brand-gray-500" />
            <span className="text-xs text-brand-gray-500 uppercase tracking-wider">Status Pesanan</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {data.ordersByStatus.slice(0, 4).map((item) => (
              <div key={item.status} className="flex justify-between text-xs">
                <span className="text-brand-gray-400">{STATUS_LABEL[item.status]}</span>
                <span className="font-bold">{item._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue chart — 7 hari */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-6">
          Pendapatan 7 Hari Terakhir
        </h2>
        <div className="flex items-end gap-2 h-40">
          {data.salesByDay.map(({ date, revenue }) => {
            const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
            const day = new Date(date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-xs text-brand-gray-500 font-mono">
                  {revenue > 0 ? formatPrice(revenue).replace("Rp", "") : "—"}
                </p>
                <div className="w-full bg-brand-gray-800 relative" style={{ height: "80px" }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-white transition-all duration-500"
                    style={{ height: `${Math.max(height, revenue > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <p className="text-[10px] text-brand-gray-500">{day}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-5">
          Produk Terlaris
        </h2>
        <div className="space-y-3">
          {data.topProducts.map((item, index) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 py-2 border-b border-brand-gray-800 last:border-0"
            >
              <span className="text-2xl font-display text-brand-gray-700 w-8">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.product?.name || "Produk"}
                </p>
                <p className="text-xs text-brand-gray-500">
                  {item._sum.quantity} terjual
                </p>
              </div>
              <p className="text-sm font-bold">
                {formatPrice(item._sum.subtotal || 0)}
              </p>
            </div>
          ))}
          {data.topProducts.length === 0 && (
            <p className="text-sm text-brand-gray-500">Belum ada data penjualan</p>
          )}
        </div>
      </div>
    </div>
  );
}
