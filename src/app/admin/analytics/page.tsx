import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, ShoppingCart, Users, UserPlus } from "lucide-react";

async function getAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    revenueThisMonth,
    revenueLast30Days,
    ordersByStatus,
    topProducts,
    salesByDay,
    totalUsers,
    totalOrders,
    newUsersThisMonth,
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

    // Total pengguna aktif
    prisma.user.count({ where: { role: "CUSTOMER", isActive: true } }),

    // Total semua pesanan
    prisma.order.count(),

    // Pengguna baru bulan ini
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
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

  // Group sales by day (7 days — orders)
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

  // Group payment revenue by day (last 14 days)
  const revenueMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    revenueMap[d.toISOString().split("T")[0]] = 0;
  }
  revenueLast30Days.forEach((payment) => {
    if (!payment.paidAt) return;
    const key = payment.paidAt.toISOString().split("T")[0];
    if (key in revenueMap) revenueMap[key] = (revenueMap[key] || 0) + payment.amount;
  });

  const completedOrders = ordersByStatus.find((s) => ["DELIVERED", "COMPLETED"].includes(s.status))?._count ?? 0;
  const conversionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : "0";

  return {
    revenueThisMonth: revenueThisMonth._sum.amount || 0,
    transactionsThisMonth: revenueThisMonth._count,
    ordersByStatus,
    topProducts: enrichedTopProducts,
    salesByDay: Object.entries(salesMap).map(([date, revenue]) => ({ date, revenue })),
    revenueByDay: Object.entries(revenueMap).map(([date, amount]) => ({ date, amount })),
    totalUsers,
    newUsersThisMonth,
    conversionRate,
  };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu", AWAITING_PAYMENT: "Menunggu Bayar",
  PAID: "Dibayar", PROCESSING: "Diproses",
  SHIPPED: "Dikirim", DELIVERED: "Terkirim", CANCELLED: "Dibatalkan",
};

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#6b7280",
  AWAITING_PAYMENT: "#f59e0b",
  PAID: "#3b82f6",
  PROCESSING: "#8b5cf6",
  SHIPPED: "#06b6d4",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
};

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  const maxRevenue = Math.max(...data.salesByDay.map((d) => d.revenue), 1);
  const maxDailyAmount = Math.max(...data.revenueByDay.map((d) => d.amount), 1);
  const maxStatusCount = Math.max(...data.ordersByStatus.map((s) => s._count), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display tracking-widest uppercase text-white">Analitik</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-brand-gray-500" />
            <span className="text-xs text-brand-gray-500 uppercase tracking-wider">Revenue</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(data.revenueThisMonth)}</p>
          <p className="text-xs text-brand-gray-500 mt-1">{data.transactionsThisMonth} transaksi bulan ini</p>
        </div>

        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-brand-gray-500" />
            <span className="text-xs text-brand-gray-500 uppercase tracking-wider">Pengguna</span>
          </div>
          <p className="text-2xl font-bold">{data.totalUsers.toLocaleString("id-ID")}</p>
          <p className="text-xs text-brand-gray-500 mt-1">+{data.newUsersThisMonth} baru bulan ini</p>
        </div>

        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <UserPlus className="w-5 h-5 text-brand-gray-500" />
            <span className="text-xs text-brand-gray-500 uppercase tracking-wider">Konversi</span>
          </div>
          <p className="text-2xl font-bold">{data.conversionRate}%</p>
          <p className="text-xs text-brand-gray-500 mt-1">Pesanan selesai / total</p>
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

      {/* Pendapatan 30 Hari — vertical bar chart */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-1">
          Pendapatan 14 Hari Terakhir
        </h2>
        <p className="text-[10px] text-brand-gray-500 mb-6">Berdasarkan pembayaran sukses</p>

        {/* Y-axis grid lines */}
        <div className="relative">
          {/* Grid lines */}
          <div className="absolute inset-x-0 top-0 bottom-[52px] flex flex-col justify-between pointer-events-none">
            {[100, 75, 50, 25, 0].map((pct) => (
              <div key={pct} className="border-t border-brand-gray-800 w-full" />
            ))}
          </div>

          {/* Bars */}
          <div className="flex items-end gap-1.5" style={{ height: "160px" }}>
            {data.revenueByDay.map(({ date, amount }) => {
              const heightPct = maxDailyAmount > 0 ? (amount / maxDailyAmount) * 100 : 0;
              const amountFormatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(amount);
              return (
                <div
                  key={date}
                  className="flex-1 flex flex-col items-center justify-end gap-1"
                  style={{ height: "100%" }}
                >
                  <div
                    className="w-full relative group"
                    style={{ height: `${Math.max(heightPct, amount > 0 ? 3 : 0)}%`, minHeight: amount > 0 ? "3px" : "0" }}
                    title={amountFormatted}
                  >
                    <div
                      className="absolute inset-0 bg-white opacity-90 transition-opacity group-hover:opacity-100"
                      style={{ backgroundColor: "#ffffff" }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 whitespace-nowrap bg-black border border-brand-gray-700 px-2 py-1 text-[10px] text-white">
                      {amountFormatted}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Date labels */}
          <div className="flex gap-1.5 mt-2">
            {data.revenueByDay.map(({ date }) => {
              const label = formatDayLabel(date);
              return (
                <div key={date} className="flex-1 text-center">
                  <span className="text-[9px] text-brand-gray-600 leading-tight" style={{ fontSize: "9px" }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-3 border-t border-brand-gray-800 pt-4">
          <div className="w-3 h-3 bg-white" />
          <span className="text-[10px] text-brand-gray-500 uppercase tracking-wider">Pendapatan harian (Rp)</span>
        </div>
      </div>

      {/* Pesanan per Status — horizontal bar chart */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-6">
          Pesanan per Status
        </h2>
        <div className="space-y-3">
          {data.ordersByStatus
            .sort((a, b) => b._count - a._count)
            .map((item) => {
              const widthPct = maxStatusCount > 0 ? (item._count / maxStatusCount) * 100 : 0;
              const barColor = STATUS_COLOR[item.status] || "#6b7280";
              const label = STATUS_LABEL[item.status] || item.status;
              return (
                <div key={item.status} className="flex items-center gap-3">
                  {/* Status label */}
                  <div className="w-28 flex-shrink-0">
                    <span className="text-xs text-brand-gray-400 uppercase tracking-wider">{label}</span>
                  </div>
                  {/* Bar track */}
                  <div className="flex-1 bg-brand-gray-800 relative" style={{ height: "22px" }}>
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-500 flex items-center"
                      style={{ width: `${Math.max(widthPct, item._count > 0 ? 2 : 0)}%`, backgroundColor: barColor, opacity: 0.85 }}
                    />
                    {item._count > 0 && (
                      <span
                        className="absolute inset-y-0 flex items-center text-[10px] font-bold text-white"
                        style={{
                          left: `${Math.max(widthPct, 2)}%`,
                          paddingLeft: "6px",
                        }}
                      >
                        {item._count}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          {data.ordersByStatus.length === 0 && (
            <p className="text-sm text-brand-gray-500">Belum ada data pesanan</p>
          )}
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
