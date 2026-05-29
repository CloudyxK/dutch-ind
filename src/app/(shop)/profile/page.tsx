import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Package, Heart, MapPin, ShoppingBag } from "lucide-react";
import ProfileCard from "@/components/profile/ProfileCard";
import { RankBadge, LoyaltyBadge } from "@/components/profile/RankBadge";
import RankIcon from "@/components/profile/RankIcon";
import { RANKS, RANK_MAP, nextRank, rankProgress, type RankKey } from "@/lib/rank";
import { formatPrice } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 3 },
      addresses: { where: { isDefault: true }, take: 1 },
      _count: { select: { orders: true, wishlist: true } },
    },
  });

  if (!user) redirect("/login");

  const pendingOrderCount = await prisma.order.count({
    where: {
      userId: session.user.id,
      status: { in: ["PENDING", "PROCESSING"] },
    },
  });

  const rank      = (user.rank ?? "BRONZE") as RankKey;
  const cfg       = RANK_MAP[rank];
  const isLoyal   = (user.orderCount ?? 0) >= 2;
  const next      = nextRank(rank);
  const progress  = rankProgress(user.totalSpend ?? 0, rank);
  const remaining = next ? Math.max(0, next.minSpend - (user.totalSpend ?? 0)) : 0;

  return (
    <div className="min-h-screen py-10">
      <div className="container-main max-w-4xl">
        <h1 className="section-title mb-8">Profil Saya</h1>

        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
          {/* ── Left column ──────────────────────────── */}
          <div className="space-y-6">
            {/* Profile card with rank + avatar upload */}
            <ProfileCard
              name        = {user.name}
              email       = {user.email}
              phone       = {user.phone}
              instagram   = {(user as any).instagram}
              avatar      = {user.avatar}
              rank        = {rank}
              totalSpend  = {user.totalSpend ?? 0}
              orderCount  = {user.orderCount ?? 0}
              memberSince = {formatDate(user.createdAt)}
            />

            {/* Badges row */}
            {isLoyal && (
              <div className="flex flex-wrap gap-3">
                <RankBadge rank={rank} size="md" />
                <LoyaltyBadge size="md" />
              </div>
            )}

            {/* Stats — 3 columns (compact on small screens) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-brand-gray-900 border border-brand-gray-700 p-3 sm:p-4 text-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 text-brand-gray-400" />
                <p className="text-xl sm:text-2xl font-bold">{user._count.orders}</p>
                <p className="text-[10px] sm:text-xs text-brand-gray-400 mt-0.5 leading-tight">Total Pesanan</p>
              </div>
              <div className="bg-brand-gray-900 border border-brand-gray-700 p-3 sm:p-4 text-center">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 text-brand-gray-400" />
                <p className="text-xl sm:text-2xl font-bold">{user._count.wishlist}</p>
                <p className="text-[10px] sm:text-xs text-brand-gray-400 mt-0.5 leading-tight">Wishlist</p>
              </div>
              <div className="bg-brand-gray-900 border border-brand-gray-700 p-3 sm:p-4 text-center">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 text-brand-gray-400" />
                <p className="text-sm sm:text-base font-bold leading-tight">{formatPrice(user.totalSpend ?? 0)}</p>
                <p className="text-[10px] sm:text-xs text-brand-gray-400 mt-0.5 leading-tight">Total Belanja</p>
              </div>
            </div>

            {/* Rank progress bar */}
            <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
              {next ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">
                      Menuju {next.label}
                    </p>
                    <p className="text-xs text-brand-gray-500 font-mono">{progress}%</p>
                  </div>
                  <div className="w-full h-2 bg-brand-gray-800 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${cfg.bgClass} transition-all duration-700`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-brand-gray-500 mt-2">
                    Belanja{" "}
                    <span className="text-white font-semibold">{formatPrice(remaining)}</span>{" "}
                    lagi untuk naik ke level{" "}
                    <span className={`font-bold ${next.textClass}`}>{next.label}</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-2">
                    Level Tertinggi
                  </p>
                  <div className="w-full h-2 bg-gradient-to-r from-cyan-700 to-cyan-400" />
                  <p className="text-[11px] text-brand-gray-500 mt-2">
                    Kamu sudah berada di level{" "}
                    <span className={`font-bold ${cfg.textClass}`}>{cfg.label}</span> — level tertinggi!
                  </p>
                </>
              )}
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-6 lg:pb-0">
              <Link href="/profile/orders" className="bg-brand-gray-900 border border-brand-gray-700 hover:border-white p-4 flex items-center gap-3 transition-colors relative">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Pesanan Saya</span>
                {pendingOrderCount > 0 && (
                  <span className="ml-auto flex-shrink-0 bg-white text-black text-[10px] font-bold px-2 py-0.5 min-w-[20px] text-center">
                    {pendingOrderCount}
                  </span>
                )}
              </Link>
              <Link href="/wishlist" className="bg-brand-gray-900 border border-brand-gray-700 hover:border-white p-4 flex items-center gap-3 transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium">Wishlist</span>
              </Link>
              <Link href="/profile/addresses" className="bg-brand-gray-900 border border-brand-gray-700 hover:border-white p-4 flex items-center gap-3 transition-colors">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">Alamat Saya</span>
              </Link>
            </div>
          </div>

          {/* ── Right column: rank levels list ───────── */}
          <div className="mt-6 lg:mt-0">
            <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-4 text-brand-gray-400">Semua Level Member</p>
              <div className="space-y-2">
                {RANKS.map((r) => {
                  const isCurrent = r.key === rank;
                  const isUnlocked = (user.totalSpend ?? 0) >= r.minSpend;
                  return (
                    <div
                      key={r.key}
                      className={`flex items-center gap-3 p-3 border transition-colors ${
                        isCurrent
                          ? `border-current ${r.borderClass} bg-brand-gray-800`
                          : "border-brand-gray-800"
                      }`}
                    >
                      <RankIcon rank={r.key} size={36} className={!isUnlocked ? "opacity-30 grayscale" : ""} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isCurrent ? r.textClass : isUnlocked ? "text-white" : "text-brand-gray-600"}`}>
                            {r.label}
                          </span>
                          {isCurrent && <span className="text-[10px] bg-white text-black px-2 py-0.5 font-bold uppercase">Level Kamu</span>}
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isUnlocked ? "text-brand-gray-400" : "text-brand-gray-700"}`}>
                          {r.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-[10px] font-mono ${isUnlocked ? "text-brand-gray-400" : "text-brand-gray-700"}`}>
                          {`≥ ${formatPrice(r.minSpend)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
