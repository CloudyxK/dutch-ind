import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Users, Package, TrendingUp, AlertCircle } from "lucide-react";
import RecentOrdersWidget from "@/components/admin/RecentOrdersWidget";

async function getDashboardStats() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    monthRevenue,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        paidAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        address: true,
        items: { select: { id: true } },
        payment: { select: { status: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true, totalStock: { lte: 5 } },
      orderBy: { totalStock: "asc" },
      take: 5,
    }),
  ]);

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    totalOrders,
    totalUsers,
    totalProducts,
    monthRevenue: monthRevenue._sum.amount || 0,
    recentOrders,
    lowStockProducts,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Total Pendapatan",
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      desc: "Semua waktu",
    },
    {
      title: "Pendapatan Bulan Ini",
      value: formatPrice(stats.monthRevenue),
      icon: TrendingUp,
      desc: "Bulan berjalan",
    },
    {
      title: "Total Pesanan",
      value: stats.totalOrders.toLocaleString("id-ID"),
      icon: ShoppingCart,
      desc: "Semua pesanan",
    },
    {
      title: "Total Pelanggan",
      value: stats.totalUsers.toLocaleString("id-ID"),
      icon: Users,
      desc: "Pelanggan terdaftar",
    },
    {
      title: "Produk Aktif",
      value: stats.totalProducts.toLocaleString("id-ID"),
      icon: Package,
      desc: "Produk tersedia",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display tracking-widest uppercase">Dashboard</h1>
        <p className="text-brand-gray-400 text-sm mt-1">
          Selamat datang kembali di panel admin DUTCH.IND
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(({ title, value, icon: Icon, desc }) => (
          <div
            key={title}
            className="bg-brand-gray-900 border border-brand-gray-700 p-5 hover:border-brand-gray-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-brand-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-xl font-bold mt-2">{value}</p>
                <p className="text-xs text-brand-gray-600 mt-1">{desc}</p>
              </div>
              <Icon className="w-5 h-5 text-brand-gray-600" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2">
          <RecentOrdersWidget orders={stats.recentOrders as any} />
        </div>

        {/* Low stock warning */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Stok Menipis</h2>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-brand-gray-500">Semua produk stok aman</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b border-brand-gray-800 last:border-0"
                >
                  <p className="text-sm">{product.name}</p>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 ${
                      product.totalStock === 0
                        ? "bg-red-900/40 text-red-400"
                        : "bg-yellow-900/40 text-yellow-400"
                    }`}
                  >
                    {product.totalStock === 0 ? "Habis" : `${product.totalStock} sisa`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
