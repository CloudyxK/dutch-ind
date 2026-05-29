import prisma from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { ShoppingCart, Users, Package, TrendingUp, AlertCircle, Crown, AlertTriangle } from "lucide-react";
import Link from "next/link";
import RecentOrdersWidget from "@/components/admin/RecentOrdersWidget";
import { RankBadge, LoyaltyBadge } from "@/components/profile/RankBadge";
import RankIcon from "@/components/profile/RankIcon";
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
    lowStockVariantCount,
    outOfStockVariantCount,
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
    prisma.productVariant.count({ where: { stock: { lte: 5, gt: 0 } } }),
    prisma.productVariant.count({ where: { stock: 0 } }),
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
    lowStockVariantCount,
    outOfStockVariantCount,
  };
}

const RANK_ORDER: Record<string, number> = { DIAMOND: 5, PLATINUM: 4, GOLD: 3, SILVER: 2, BRONZE: 1 };

/* ── shared styles ───────────────────────────────────── */
const card = {
  background: "#0a0a0c",
  border: "1px solid rgba(255,255,255,0.07)",
} as const;

const labelStyle = {
  color: "rgba(255,255,255,0.25)",
  fontSize: "9px",
  letterSpacing: "0.45em",
} as const;

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const topMembers = [...stats.topMembers].sort((a, b) => {
    const rDiff = (RANK_ORDER[b.rank] ?? 0) - (RANK_ORDER[a.rank] ?? 0);
    return rDiff !== 0 ? rDiff : b.totalSpend - a.totalSpend;
  });

  const cards = [
    { num: "01", title: "Total Pendapatan",     value: formatPrice(stats.totalRevenue),              desc: "Semua waktu"         },
    { num: "02", title: "Pendapatan Bulan Ini", value: formatPrice(stats.monthRevenue),              desc: "Bulan berjalan"      },
    { num: "03", title: "Total Pesanan",        value: stats.totalOrders.toLocaleString("id-ID"),    desc: "Semua pesanan"       },
    { num: "04", title: "Total Pelanggan",      value: stats.totalUsers.toLocaleString("id-ID"),     desc: "Terdaftar"           },
    { num: "05", title: "Produk Aktif",         value: stats.totalProducts.toLocaleString("id-ID"),  desc: "Tersedia di toko"    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.5rem" }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
          <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.28)" }}>
            Admin Panel
          </span>
        </div>
        <h1 className="font-display text-3xl uppercase tracking-widest text-white">
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          Selamat datang kembali, DUTCH.IND
        </p>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {cards.map(({ num, title, value, desc }) => (
          <div
            key={num}
            className="group relative p-5 transition-all duration-300 overflow-hidden"
            style={card}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)",
              }}
            />

            {/* Number */}
            <p className="font-mono text-[9px] mb-3" style={{ color: "rgba(255,255,255,0.18)" }}>
              {num}
            </p>

            {/* Value */}
            <p className="text-xl font-black text-white mb-1 tabular-nums leading-none">
              {value}
            </p>

            {/* Title */}
            <p className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              {title}
            </p>

            {/* Desc */}
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              {desc}
            </p>

            {/* Bottom accent on hover */}
            <div
              className="absolute bottom-0 left-4 right-4 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
          </div>
        ))}
      </div>

      {/* ── Low Stock Warning Banner ── */}
      {(stats.lowStockVariantCount > 0 || stats.outOfStockVariantCount > 0) && (
        <Link href="/admin/low-stock" className="block group">
          <div className="flex items-center gap-4 p-4 border transition-colors duration-200"
               style={{
                 background: "rgba(245,158,11,0.06)",
                 borderColor: "rgba(245,158,11,0.25)",
               }}>
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Alert Stok
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                {stats.lowStockVariantCount > 0 && (
                  <span>{stats.lowStockVariantCount} varian stok kritis</span>
                )}
                {stats.lowStockVariantCount > 0 && stats.outOfStockVariantCount > 0 && (
                  <span className="mx-2 text-brand-gray-600">·</span>
                )}
                {stats.outOfStockVariantCount > 0 && (
                  <span>{stats.outOfStockVariantCount} varian habis</span>
                )}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-amber-400/60 group-hover:text-amber-400 transition-colors flex-shrink-0">
              Lihat Detail →
            </span>
          </div>
        </Link>
      )}

      {/* ── Orders + Low Stock ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent orders */}
        <div className="xl:col-span-2">
          <RecentOrdersWidget orders={stats.recentOrders as any} />
        </div>

        {/* Low stock */}
        <div className="p-5" style={card}>
          <div
            className="flex items-center gap-2.5 mb-5 pb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <AlertCircle className="w-3.5 h-3.5 text-yellow-400/80" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">
              Stok Menipis
            </h2>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Semua produk stok aman
            </p>
          ) : (
            <div className="space-y-0">
              {stats.lowStockProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-3"
                  style={{
                    borderBottom:
                      i < stats.lowStockProducts.length - 1
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "none",
                  }}
                >
                  <p className="text-xs text-white truncate max-w-[140px]">
                    {product.name}
                  </p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 flex-shrink-0"
                    style={{
                      background:
                        product.totalStock === 0
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(234,179,8,0.12)",
                      color:
                        product.totalStock === 0
                          ? "rgba(248,113,113,0.9)"
                          : "rgba(234,179,8,0.9)",
                    }}
                  >
                    {product.totalStock === 0 ? "Habis" : `${product.totalStock} sisa`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Top Members ── */}
      <div className="p-5" style={card}>
        <div
          className="flex items-center gap-2.5 mb-5 pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Crown className="w-3.5 h-3.5 text-yellow-400/80" />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">
            Member Teratas
          </h2>
          <span
            className="text-[9px] ml-auto uppercase tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            Silver ke atas
          </span>
        </div>

        {topMembers.length === 0 ? (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Belum ada member dengan rank Silver ke atas
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["#", "Member", "Rank", "Badge", "Total Belanja", "Pesanan", "Bergabung"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`py-2 pr-4 font-medium ${
                          i >= 4 ? "text-right" : "text-left"
                        }`}
                        style={{ ...labelStyle }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {topMembers.map((member, idx) => {
                  const isLoyal = (member.orderCount ?? 0) >= 2;
                  return (
                    <tr
                      key={member.id}
                      className="group transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <td
                        className="py-3 pr-4 font-mono"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                      >
                        {idx + 1}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.5)",
                            }}
                          >
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              member.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-[140px]">
                              {member.name}
                            </p>
                            <p
                              className="text-[10px] truncate max-w-[140px]"
                              style={{ color: "rgba(255,255,255,0.3)" }}
                            >
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <RankBadge rank={member.rank as RankKey} size="sm" />
                      </td>
                      <td className="py-3 pr-4">
                        {isLoyal && <LoyaltyBadge size="sm" />}
                      </td>
                      <td
                        className="py-3 pr-4 text-right font-bold tabular-nums text-white"
                      >
                        {formatPrice(member.totalSpend ?? 0)}
                      </td>
                      <td
                        className="py-3 pr-4 text-right"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {member.orderCount ?? 0}×
                      </td>
                      <td
                        className="py-3"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
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
