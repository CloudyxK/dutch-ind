"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Search, User, Menu, X, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/products", label: "Semua Produk" },
  { href: "/products?category=hoodie", label: "Hoodie" },
  { href: "/products?category=t-shirt", label: "T-Shirt" },
  { href: "/products?category=celana", label: "Celana" },
  { href: "/products?category=outerwear", label: "Outerwear" },
  { href: "/products?category=aksesori", label: "Aksesori" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const { getTotalItems, toggleCart } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-white text-black text-center py-2 text-xs tracking-widest uppercase font-semibold">
        Gratis Ongkir untuk Pembelian di atas Rp500.000 &nbsp;|&nbsp; Gunakan kode{" "}
        <span className="underline">WELCOME10</span> untuk diskon 10%
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-brand-black/95 backdrop-blur-md border-b border-brand-gray-800"
            : "bg-brand-black border-b border-brand-gray-800"
        )}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl font-display tracking-widest hover:opacity-80 transition-opacity"
            >
              DUTCH.IND
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-widest text-brand-gray-400 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-brand-gray-800 transition-colors"
                aria-label="Cari produk"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              {session && (
                <Link
                  href="/wishlist"
                  className="p-2 hover:bg-brand-gray-800 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              {/* User */}
              {session ? (
                <div className="relative group">
                  <button className="p-2 hover:bg-brand-gray-800 transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-brand-gray-900 border border-brand-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 text-xs text-brand-gray-400 border-b border-brand-gray-700">
                      {session.user?.name}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-brand-gray-800 transition-colors"
                    >
                      Profil Saya
                    </Link>
                    <Link
                      href="/profile/orders"
                      className="block px-4 py-2 text-sm hover:bg-brand-gray-800 transition-colors"
                    >
                      Pesanan Saya
                    </Link>
                    {(session.user as any)?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm hover:bg-brand-gray-800 transition-colors text-yellow-400"
                      >
                        Dashboard Admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-brand-gray-800 transition-colors"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 hover:bg-brand-gray-800 transition-colors"
                  aria-label="Login"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 hover:bg-brand-gray-800 transition-colors"
                aria-label="Keranjang belanja"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-white text-black text-[10px] font-bold flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 hover:bg-brand-gray-800 transition-colors ml-1"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="py-3 border-t border-brand-gray-800 animate-slide-down">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="input-field flex-1"
                  autoFocus
                />
                <button type="submit" className="btn-primary px-4">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-brand-gray-800 animate-slide-down">
            <nav className="container-main py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-semibold uppercase tracking-widest text-brand-gray-300 hover:text-white border-b border-brand-gray-800 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {!session && (
                <div className="flex gap-3 mt-4">
                  <Link href="/login" className="btn-secondary flex-1 text-center">
                    Masuk
                  </Link>
                  <Link href="/register" className="btn-primary flex-1 text-center">
                    Daftar
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
