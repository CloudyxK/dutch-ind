import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Star, ArrowLeft, Gift, TrendingUp, ShoppingBag, Award, ChevronRight } from "lucide-react";
import { RANKS, RANK_MAP, nextRank, rankProgress, type RankKey } from "@/lib/rank";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poin & Reward — DUTCH.IND",
};

export default async function PointsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      points: true,
      totalSpend: true,
      orderCount: true,
      rank: true,
      name: true,
    },
  });

  if (!user) redirect("/login");

  const points      = user.points ?? 0;
  const pointsValue = points * 100; // 1 poin = Rp 100
  const rank        = (user.rank ?? "BRONZE") as RankKey;
  const cfg         = RANK_MAP[rank];
  const next        = nextRank(rank);
  const progress    = rankProgress(user.totalSpend ?? 0, rank);
  const remaining   = next ? Math.max(0, next.minSpend - (user.totalSpend ?? 0)) : 0;

  // Recent orders that earned points
  const recentOrders = await prisma.order.findMany({
    where: {
      userId: (session.user as any).id,
      status: { in: ["DELIVERED", "COMPLETED", "CONFIRMED"] },
    },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      createdAt: true,
      status: true,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="min-h-screen py-10">
      <div className="container-main max-w-2xl">
        <Link href="/profile" className="inline-flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Profil
        </Link>

        <h1 className="text-3xl font-display tracking-widest uppercase mb-8">Poin &amp; Reward</h1>

        {/* Points balance */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gray-500 mb-2">Poin Kamu</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold tabular-nums">{points.toLocaleString("id-ID")}</span>
                <Star className="w-6 h-6 text-amber-400 mb-1.5 fill-amber-400" />
              </div>
              <p className="text-sm text-brand-gray-400 mt-2">
                Senilai <span className="text-white font-semibold">{formatPrice(pointsValue)}</span> untuk digunakan saat checkout
              </p>
            </div>
            <div className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${cfg.borderClass} ${cfg.textClass}`}>
              {cfg.icon} {cfg.label}
            </div>
          </div>

          {/* Rank progress */}
          {next && (
            <div className="mt-6 pt-5 border-t border-brand-gray-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-brand-gray-400">Level berikutnya: <span className="text-white font-semibold">{next.icon} {next.label}</span></span>
                <span className="text-brand-gray-500">Belanja lagi {formatPrice(remaining)}</span>
              </div>
              <div className="h-1.5 bg-brand-gray-800 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${cfg.bgClass} transition-all duration-700`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-brand-gray-600 mt-1.5">
                Total belanja: {formatPrice(user.totalSpend ?? 0)} / {formatPrice(next.minSpend)}
              </p>
            </div>
          )}
          {!next && (
            <div className="mt-4 pt-4 border-t border-brand-gray-800">
              <p className="text-sm text-amber-400 font-medium">🏆 Kamu sudah di rank tertinggi — Diamond!</p>
            </div>
          )}
        </div>

        {/* How to earn */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Cara Mendapatkan Poin
          </h2>
          <div className="space-y-4">
            {[
              { icon: ShoppingBag, title: "Setiap Pembelian", desc: "Dapatkan 1 poin setiap Rp 1.000 yang kamu belanjakan. Poin dihitung saat pesanan selesai (Delivered/Completed).", highlight: "1 poin / Rp 1.000" },
              { icon: Award, title: "Naik Rank", desc: "Rank lebih tinggi memberikan diskon otomatis dan keuntungan eksklusif di setiap pesanan.", highlight: cfg.discountPct > 0 ? `${cfg.discountPct}% diskon aktif` : "Terus belanja untuk naik level" },
              { icon: Gift, title: "Gunakan Poin", desc: "Tukar poin di halaman checkout. 1 poin = Rp 100. Maks. 50% dari total pesanan per transaksi.", highlight: `Min. 10 poin untuk digunakan` },
            ].map(({ icon: Icon, title, desc, highlight }) => (
              <div key={title} className="flex gap-4 p-3 border border-brand-gray-800 hover:border-brand-gray-600 transition-colors">
                <div className="w-9 h-9 bg-brand-gray-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-brand-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-1.5">{highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rank benefits */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
            <Award className="w-4 h-4" /> Keuntungan per Level
          </h2>
          <div className="space-y-2">
            {RANKS.map((r) => (
              <div key={r.key} className={`flex items-start gap-3 p-3 border transition-colors ${r.key === rank ? `${r.borderClass} bg-white/[0.03]` : "border-brand-gray-800"}`}>
                <span className="text-lg flex-shrink-0">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-bold ${r.key === rank ? r.textClass : "text-brand-gray-400"}`}>
                      {r.label}
                      {r.key === rank && <span className="ml-2 text-[10px] bg-white/10 px-1.5 py-0.5 text-white font-normal">Level kamu</span>}
                    </p>
                    <p className="text-[10px] text-brand-gray-600 flex-shrink-0">
                      {r.minSpend === 0 ? "Mulai" : `≥ ${formatPrice(r.minSpend)}`}
                    </p>
                  </div>
                  <p className="text-xs text-brand-gray-500 mt-0.5">{r.description}</p>
                  {r.discountPct > 0 && (
                    <p className="text-[10px] text-green-400 mt-1">✓ Diskon {r.discountPct}% otomatis</p>
                  )}
                  {r.freeShipping.length > 0 && (
                    <p className="text-[10px] text-blue-400 mt-0.5">✓ Gratis ongkir {r.freeShipping.join(", ")}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Points history (from completed orders) */}
        {recentOrders.length > 0 && (
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-5">Riwayat Poin dari Pesanan</h2>
            <div className="space-y-0 divide-y divide-brand-gray-800">
              {recentOrders.map((order) => {
                const earnedPoints = Math.floor(order.total / 1000);
                return (
                  <Link
                    key={order.id}
                    href={`/profile/orders/${order.id}`}
                    className="flex items-center justify-between py-3 hover:bg-white/[0.03] -mx-1 px-1 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium group-hover:text-white transition-colors">#{order.orderNumber}</p>
                      <p className="text-xs text-brand-gray-500">
                        {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(order.createdAt))}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-brand-gray-400">{formatPrice(order.total)}</p>
                        {earnedPoints > 0 && (
                          <p className="text-xs text-amber-400 font-bold">+{earnedPoints} poin</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-brand-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 text-center">
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Belanja &amp; Kumpulkan Poin
          </Link>
        </div>
      </div>
    </div>
  );
}
