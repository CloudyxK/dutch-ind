import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Package, Heart, MapPin } from "lucide-react";
import ProfileCard from "@/components/profile/ProfileCard";
import { RankBadge, LoyaltyBadge } from "@/components/profile/RankBadge";
import RankIcon from "@/components/profile/RankIcon";
import { RANKS, RANK_MAP, type RankKey } from "@/lib/rank";
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

  const rank      = (user.rank ?? "BRONZE") as RankKey;
  const cfg       = RANK_MAP[rank];
  const isLoyal   = (user.orderCount ?? 0) >= 2;

  return (
    <div className="min-h-screen py-10">
      <div className="container-main max-w-3xl">
        <h1 className="section-title mb-8">Profil Saya</h1>

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
          <div className="flex flex-wrap gap-3 mb-6">
            <RankBadge rank={rank} size="md" />
            <LoyaltyBadge size="md" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-4 text-center">
            <Package className="w-5 h-5 mx-auto mb-2 text-brand-gray-400" />
            <p className="text-2xl font-bold">{user._count.orders}</p>
            <p className="text-xs text-brand-gray-400 mt-0.5">Total Pesanan</p>
          </div>
          <div className="bg-brand-gray-900 border border-brand-gray-700 p-4 text-center">
            <Heart className="w-5 h-5 mx-auto mb-2 text-brand-gray-400" />
            <p className="text-2xl font-bold">{user._count.wishlist}</p>
            <p className="text-xs text-brand-gray-400 mt-0.5">Wishlist</p>
          </div>
        </div>

        {/* Semua Level Rank */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-5 mb-6">
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
                      {r.maxSpend ? `≥ ${formatPrice(r.minSpend)}` : `≥ ${formatPrice(r.minSpend)}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/profile/orders" className="bg-brand-gray-900 border border-brand-gray-700 hover:border-white p-4 flex items-center gap-3 transition-colors">
            <Package className="w-5 h-5" />
            <span className="text-sm font-medium">Pesanan Saya</span>
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
    </div>
  );
}
