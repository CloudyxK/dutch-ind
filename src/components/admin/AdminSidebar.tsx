"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import PushNotificationSetup from "./PushNotificationSetup";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Truck,
  LogOut,
  Zap,
  Banknote,
  MessageCircle,
  Crown,
  ExternalLink,
  FolderOpen,
  Star,
  Boxes,
  Rocket,
  RotateCcw,
  Mail,
  Bell,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Utama",
    items: [
      { href: "/admin",            label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics",  label: "Analitik",  icon: BarChart3 },
    ],
  },
  {
    label: "Katalog",
    items: [
      { href: "/admin/products",   label: "Produk",    icon: Package },
      { href: "/admin/categories", label: "Kategori",  icon: FolderOpen },
      { href: "/admin/inventory",  label: "Inventori", icon: Boxes },
      { href: "/admin/coupons",    label: "Kupon",     icon: Tag },
      { href: "/admin/flashsale",  label: "Flash Sale",icon: Zap },
      { href: "/admin/drops",               label: "Drops",           icon: Rocket },
      { href: "/admin/stock-notifications", label: "Notifikasi Stok", icon: Bell },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/admin/orders",    label: "Pesanan",    icon: ShoppingCart },
      { href: "/admin/returns",   label: "Returns",    icon: RotateCcw },
      { href: "/admin/shipping",  label: "Pengiriman", icon: Truck },
      { href: "/admin/users",     label: "Pengguna",   icon: Users },
      { href: "/admin/reviews",    label: "Ulasan",      icon: Star },
      { href: "/admin/newsletter", label: "Newsletter",  icon: Mail },
      { href: "/admin/membership", label: "Membership",  icon: Crown },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { href: "/admin/payment-settings", label: "Pembayaran",icon: Banknote },
      { href: "/admin/contact-settings", label: "Kontak & CS",icon: MessageCircle },
    ],
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  // Close drawer on route change (mobile nav)
  useEffect(() => {
    if (onClose) onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay — shown when drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          // Desktop: always visible fixed sidebar
          "fixed top-0 left-0 h-full w-56 flex flex-col z-40 flex-shrink-0 transition-transform duration-300",
          // Mobile: slide in/out
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          background: "#050507",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
      {/* Logo */}
      <div
        className="px-5 py-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link href="/admin" className="block">
          <p className="font-display tracking-[0.18em] text-base text-white uppercase">
            DUTCH.IND
          </p>
          <p
            className="text-[9px] uppercase tracking-[0.45em] mt-0.5"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Admin Panel
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={group.label} className={cn("px-3", gi > 0 && "mt-5")}>
            {/* Group label */}
            <p
              className="text-[8px] uppercase tracking-[0.55em] px-2 mb-1.5"
              style={{ color: "rgba(255,255,255,0.18)" }}
            >
              {group.label}
            </p>

            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== "/admin" && pathname.startsWith(href));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-2 text-xs font-medium transition-all duration-200 relative group",
                        isActive
                          ? "bg-white text-black"
                          : "hover:bg-white/[0.04]"
                      )}
                      style={
                        !isActive
                          ? { color: "rgba(255,255,255,0.45)" }
                          : undefined
                      }
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate tracking-wide">{label}</span>

                      {/* Active bar */}
                      {isActive && (
                        <span className="ml-auto w-1 h-1 rounded-full bg-black/40" />
                      )}

                      {/* Hover left accent */}
                      {!isActive && (
                        <span
                          className="absolute left-0 top-1 bottom-1 w-px scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top"
                          style={{ background: "rgba(255,255,255,0.2)" }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Push notification toggle */}
      <PushNotificationSetup />

      {/* Bottom actions */}
      <div
        className="p-3 space-y-0.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-2 py-2 text-xs font-medium transition-all duration-200 hover:bg-white/[0.04]"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Lihat Toko
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2.5 px-2 py-2 text-xs font-medium w-full transition-all duration-200 hover:bg-red-500/[0.08]"
          style={{ color: "rgba(239,68,68,0.7)" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar
        </button>
      </div>
    </aside>
    </>
  );
}
