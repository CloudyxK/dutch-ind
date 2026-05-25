"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Truck,
  LogOut,
  ChevronRight,
  Zap,
  Banknote,
  MessageCircle,
  Crown,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingCart },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/coupons", label: "Kupon", icon: Tag },
  { href: "/admin/shipping", label: "Pengiriman", icon: Truck },
  { href: "/admin/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/admin/flashsale",         label: "Flash Sale",        icon: Zap      },
  { href: "/admin/payment-settings",  label: "Pembayaran Manual", icon: Banknote      },
  { href: "/admin/contact-settings",  label: "Kontak & CS",       icon: MessageCircle },
  { href: "/admin/membership",        label: "Membership",         icon: Crown         },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-brand-gray-900 border-r border-brand-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-brand-gray-700">
        <Link href="/admin" className="text-lg font-display tracking-widest">
          DUTCH.IND
        </Link>
        <p className="text-[10px] text-brand-gray-500 mt-0.5 uppercase tracking-wider">
          Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-black"
                  : "text-brand-gray-400 hover:text-white hover:bg-brand-gray-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {isActive && <ChevronRight className="ml-auto w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-brand-gray-700 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-brand-gray-400 hover:text-white transition-colors"
        >
          <Package className="w-4 h-4" />
          Lihat Toko
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
