import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { User, Package, Heart, MapPin } from "lucide-react";

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

  const stats = [
    { icon: Package, label: "Total Pesanan", value: user._count.orders },
    { icon: Heart, label: "Wishlist", value: user._count.wishlist },
  ];

  return (
    <div className="min-h-screen py-10">
      <div className="container-main max-w-3xl">
        <h1 className="section-title mb-8">Profil Saya</h1>

        {/* User card */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-brand-gray-700 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{user.name}</p>
            <p className="text-sm text-brand-gray-400">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-brand-gray-500">{user.phone}</p>
            )}
            <p className="text-xs text-brand-gray-600 mt-1">
              Member sejak {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-brand-gray-900 border border-brand-gray-700 p-4 text-center">
              <Icon className="w-5 h-5 mx-auto mb-2 text-brand-gray-400" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-brand-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/profile/orders"
            className="bg-brand-gray-900 border border-brand-gray-700 hover:border-white p-4 flex items-center gap-3 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span className="text-sm font-medium">Pesanan Saya</span>
          </Link>
          <Link
            href="/wishlist"
            className="bg-brand-gray-900 border border-brand-gray-700 hover:border-white p-4 flex items-center gap-3 transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">Wishlist</span>
          </Link>
          <Link
            href="/profile/addresses"
            className="bg-brand-gray-900 border border-brand-gray-700 hover:border-white p-4 flex items-center gap-3 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">Alamat Saya</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
