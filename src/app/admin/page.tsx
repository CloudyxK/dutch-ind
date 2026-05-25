import prisma from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { ShoppingCart, Users, Package, TrendingUp, AlertCircle, Crown } from "lucide-react";
import RecentOrdersWidget from "@/components/admin/RecentOrdersWidget";
import { RankBadge, LoyaltyBadge } from "@/components/profile/RankBadge";
import type { RankKey } from "@/lib/rank";

async function getDashboardStats() {
  const today        = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    monthRevenue,
    recentOrders,
    lowStockProducts,
    topMembers,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS", paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.order.findMany({
      take: 8, orderBy: { createdAt: "desc" },
      include: {
        user:    { select: { name: true, email: true } },
        address: true,
        items:   { select: { id: true } },
        payment: { select: { status: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true, totalStock: { lte: 5 } },
      orderBy: { totalStock: "asc" }, take: 5,
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER", rank: { in: ["DIAMOND", "PLATINUM", "GOLD", "SILVER"] } },
      orderBy: [{ rank: "desc" }, { totalSpend: "desc" }],
      take: 8,
      select: {
        id: true, name: true, email: true, avatar: true,
        rank: true, totalSpend: true, orderCount: true, createdAt: true,
      },
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
    topMembers,
  };
}

// Sort rank untuk display order
const RANK_ORDER: Record<string, number> = { DIAMOND: 5, PLATINUM: 4, GOLD: 3, SILVER: 2, BRONZE: 1 };

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  // Sort topMembers by rank weight then spend
  const topMembers = [...stats.topMembers].sort((a, b) => {
    const rDiff = (RANK_ORDER[b.rank] ?? 0) - (RANK_ORDER[a.rank] ?? 0);
    return rDiff !== 0 ? rDiff : b.totalSpend - a.totalSpend;
  });

  const cards = [
    { title: "Total Pendapatan",    value: formatPrice(stats.totalRevenue),              icon: TrendingUp, desc: "Semua waktu"        },
    { title: "Pendapatan Bulan Ini",value: formatPrice(stats.monthRevenue),              icon: TrendingUp, desc: "Bulan berjalan"     },
    { title: "Total Pesanan",       value: stats.totalOrders.toLocaleString("id-ID"),    icon: ShoppingCart,desc: "Semua pesanan"     },
    { title: "Total Pelanggan",     value: stats.totalUsers.toLocaleString("id-ID"),     icon: Users,       desc: "Pelanggan terdaftar"},
    { title: "Produk Aktif",        value: stats.totalProducts.toLocaleString("id-ID"),  icon: Package,     desc: "Produk tersedia"   },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display tracking-widest uppercase">Dashboard</h1>
        <p className="text-brand-gray-400 text-sm mt-1">Selamat datang kembali di panel admin DUTCH.IND</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(({ title, value, icon: Icon, desc }) => (
          <div key={title} className="bg-brand-gray-900 border border-brand-gray-700 p-5 hover:border-brand-gray-500 transition-colors">
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

        {/* Low stock */}
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
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-brand-gray-800 last:border-0">
                  <p className="text-sm">{product.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 ${product.totalStock === 0 ? "bg-red-900/40 text-red-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                    {product.totalStock === 0 ? "Habis" : `${product.totalStock} sisa`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Members */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Crown className="w-4 h-4 text-yellow-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest">Member Teratas</h2>
          <span className="text-xs text-brand-gray-500 ml-auto">Silver ke atas · diurutkan berdasarkan rank & spend</span>
        </div>

        {topMembers.length === 0 ? (
          <p className="text-sm text-brand-gray-500">Belum ada member dengan rank Silver ke atas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-gray-700 text-[11px] text-brand-gray-500 uppercase tracking-wider">
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">Member</th>
                  <th className="text-left py-2 pr-4">Rank</th>
                  <th className="text-left py-2 pr-4">Badge</th>
                  <th className="text-right py-2 pr-4">Total Belanja</th>
                  <th className="text-right py-2 pr-4">Pesanan</th>
                  <th className="text-left py-2">Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-800">
                {topMembers.map((member, idx) => {
                  const isLoyal = (member.orderCount ?? 0) >= 2;
                  return (
                    <tr key={member.id} className="hover:bg-brand-gray-800 transition-colors">
                      <td className="py-3 pr-4 text-brand-gray-500 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-brand-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-brand-gray-400">
                            {member.avatar
                              ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                              : member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate max-w-[150px]">{member.name}</p>
                            <p className="text-xs text-brand-gray-500 truncate max-w-[150px]">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <RankBadge rank={member.rank as RankKey} size="sm" />
                      </td>
                      <td className="py-3 pr-4">
                        {isLoyal && <LoyaltyBadge size="sm" />}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold font-mono">
                        {formatPrice(member.totalSpend ?? 0)}
                      </td>
                      <td className="py-3 pr-4 text-right text-brand-gray-400">
                        {member.orderCount ?? 0}x
                      </td>
                      <td className="py-3 text-brand-gray-500 text-xs">
                        {formatDate(member.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
