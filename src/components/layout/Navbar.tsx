"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Search, User, Menu, X, Heart, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

const shopLinks = [
  { href: "/products",                         label: "Semua Produk" },
  { href: "/products?category=hoodie",         label: "Hoodie"       },
  { href: "/products?category=t-shirt",        label: "T-Shirt"      },
  { href: "/products?category=celana",         label: "Celana"       },
  { href: "/products?category=outerwear",      label: "Outerwear"    },
  { href: "/products?category=aksesori",       label: "Aksesori"     },
];

const navLinks = [
  { href: "/",          label: "Beranda"  },
  { href: "/lookbook",  label: "Lookbook" },
  { href: "/contact",   label: "Kontak"   },
];

export default function Navbar() {
  const { data: session }            = useSession();
  const { getTotalItems, toggleCart } = useCartStore();
  const [scrolled, setScrolled]      = useState(false);
  const [mobileOpen, setMobileOpen]  = useState(false);
  const [searchOpen, setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopOpen, setShopOpen]      = useState(false);
  const [logoSpinning, setLogoSpinning] = useState(false);
  const totalItems = getTotalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogoClick() {
    if (logoSpinning) return;
    setLogoSpinning(true);
    setTimeout(() => setLogoSpinning(false), 800);
  }

  const linkClass =
    "text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-gray-400 hover:text-white transition-colors duration-200";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-brand-black/90 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent border-b border-white/[0.04]"
        )}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-12">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0" style={{ perspective: "600px" }}>
              <div
                onClick={handleLogoClick}
                className="cursor-pointer logo-3d-wrap"
                style={{
                  transformStyle: "preserve-3d",
                  animation: logoSpinning
                    ? "logo3DSpin 0.8s cubic-bezier(0.22,1,0.36,1) forwards"
                    : undefined,
                }}
              >
                <Image
                  src="/logo.png"
                  alt="DUTCH.IND"
                  width={90}
                  height={45}
                  className="h-7 w-auto object-contain"
                  priority
                  style={{
                    filter:
                      "drop-shadow(0 2px 8px rgba(255,255,255,0.18)) drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                  }}
                />
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}

              {/* Shop dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <button className={cn(linkClass, "flex items-center gap-1")}>
                  Toko
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 transition-transform duration-200",
                      shopOpen && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {shopOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-44 bg-brand-black border border-white/[0.08] py-1 z-50"
                    >
                      {shopLinks.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setShopOpen(false)}
                          className="block px-4 py-2.5 text-[11px] uppercase tracking-widest text-brand-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-0.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 hover:bg-white/[0.06] transition-colors rounded-none"
                aria-label="Cari"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Wishlist */}
              {session && (
                <Link
                  href="/wishlist"
                  className="p-2.5 hover:bg-white/[0.06] transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-4 h-4" />
                </Link>
              )}

              {/* User */}
              {session ? (
                <div className="relative group">
                  <button className="p-2.5 hover:bg-white/[0.06] transition-colors">
                    <User className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-brand-black border border-white/[0.08] py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 text-[10px] text-brand-gray-500 border-b border-white/[0.06] uppercase tracking-widest">
                      {session.user?.name}
                    </div>
                    <Link href="/profile"        className="block px-4 py-2.5 text-xs hover:bg-white/[0.04] transition-colors">Profil Saya</Link>
                    <Link href="/profile/orders" className="block px-4 py-2.5 text-xs hover:bg-white/[0.04] transition-colors">Pesanan Saya</Link>
                    {(session.user as any)?.role === "ADMIN" && (
                      <Link href="/admin" className="block px-4 py-2.5 text-xs hover:bg-white/[0.04] transition-colors text-yellow-400">
                        Dashboard Admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-white/[0.04] transition-colors"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="p-2.5 hover:bg-white/[0.06] transition-colors" aria-label="Login">
                  <User className="w-4 h-4" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2.5 hover:bg-white/[0.06] transition-colors"
                aria-label="Keranjang"
              >
                <ShoppingBag className="w-4 h-4" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 w-3.5 h-3.5 bg-white text-black text-[9px] font-bold flex items-center justify-center rounded-full"
                    >
                      {totalItems > 9 ? "9+" : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 hover:bg-white/[0.06] transition-colors ml-1"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-white/[0.06]"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim())
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                  }}
                  className="flex gap-2 py-3"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden border-t border-white/[0.06] bg-brand-black"
            >
              <nav className="container-main py-6 flex flex-col gap-1">
                {[...navLinks, { href: "/products", label: "Toko" }].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-3 text-sm font-bold uppercase tracking-[0.25em] text-brand-gray-300 hover:text-white border-b border-white/[0.04] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {shopLinks.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2 pl-4 text-xs font-semibold uppercase tracking-widest text-brand-gray-500 hover:text-white border-b border-white/[0.03] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {!session && (
                  <div className="flex gap-3 mt-5">
                    <Link href="/login"    className="btn-secondary flex-1 text-center" onClick={() => setMobileOpen(false)}>Masuk</Link>
                    <Link href="/register" className="btn-primary  flex-1 text-center" onClick={() => setMobileOpen(false)}>Daftar</Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
