"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Star, Share2, ChevronDown, Minus, Plus, X, ZoomIn, Copy, Check, MessageCircle, Loader2 } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/store/useCartStore";
import { useSession } from "next-auth/react";
import { formatPrice, calculateDiscount, formatDate } from "@/lib/utils";
import ProductCard from "./ProductCard";
import ReviewForm from "./ReviewForm";
import RecentlyViewedSection from "./RecentlyViewedSection";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Props {
  product: Product & { averageRating: number };
  related: Product[];
  hasPurchased?: boolean;
}

export default function ProductDetailClient({ product, related, hasPurchased = false }: Props) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { data: session } = useSession();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>("deskripsi");
  const [reviews, setReviews] = useState<any[]>(product.reviews || []);
  const [avgRating, setAvgRating] = useState(product.averageRating);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sizeGuideOpen,    setSizeGuideOpen]    = useState(false);
  const [notifyEmail,      setNotifyEmail]      = useState("");
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifyDone,       setNotifyDone]       = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const buyButtonRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // IntersectionObserver: show sticky bar when buy button scrolls out of view
  useEffect(() => {
    const el = buyButtonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Close share dropdown on outside click
  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareOpen]);

  // Lock scroll when zoom is open
  useEffect(() => {
    document.body.style.overflow = zoomOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [zoomOpen]);

  const userReview = session?.user
    ? reviews.find((r) => r.user?.id === (session.user as any).id) ?? null
    : null;

  function handleReviewAdded(review: any) {
    setReviews((prev) => [review, ...prev]);
    const newAvg = [...reviews, review].reduce((s, r) => s + r.rating, 0) / (reviews.length + 1);
    setAvgRating(newAvg);
  }

  const wishlisted = isWishlisted(product.id);
  const discount = product.comparePrice
    ? calculateDiscount(product.price, product.comparePrice)
    : 0;

  const selectedVariantObj = product.variants.find((v) => v.id === selectedVariant);

  const productUrl = typeof window !== "undefined"
    ? window.location.href
    : `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`;

  function handleShareWA() {
    const text = `Cek produk ini di DUTCH.IND 👀\n*${product.name}* — ${formatPrice(product.price)}\n${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setShareOpen(false);
  }

  async function handleNotifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifySubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.slug}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notifyEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendaftar");
      setNotifyDone(true);
      toast.success("Kami akan beritahu kamu saat stok tersedia!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setNotifySubmitting(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(productUrl).then(() => {
      setCopied(true);
      toast.success("Link disalin!");
      setTimeout(() => setCopied(false), 2000);
    });
    setShareOpen(false);
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert("Pilih ukuran terlebih dahulu");
      return;
    }
    if (!selectedVariantObj) return;
    addItem(product, selectedVariantObj, quantity);
  };

  const sections = [
    {
      key: "deskripsi",
      title: "Deskripsi Produk",
      content: product.description,
    },
    {
      key: "ukuran",
      title: "Panduan Ukuran",
      content: "S: Lingkar dada 86-90cm | M: 90-96cm | L: 96-102cm | XL: 102-108cm",
    },
    {
      key: "pengiriman",
      title: "Pengiriman & Pengembalian",
      content:
        "Pengiriman 1-3 hari kerja (Jabodetabek), 3-7 hari kerja (luar Jabodetabek). Pengembalian gratis dalam 14 hari.",
    },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      {/* Breadcrumb */}
      <div className="border-b border-brand-gray-800 py-3">
        <div className="container-main">
          <nav className="flex items-center gap-1.5 text-xs text-brand-gray-500">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span className="text-brand-gray-600">›</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-white transition-colors"
            >
              {product.category.name}
            </Link>
            <span className="text-brand-gray-600">›</span>
            <span className="text-white truncate max-w-[160px] sm:max-w-[280px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-10 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-3">
            {/* Mobile: Swiper touch gallery */}
            <div className="lg:hidden">
              <Swiper
                modules={[Pagination]}
                pagination={{ clickable: true }}
                loop={product.images.length > 1}
                onSlideChange={(swiper) => setActiveImage(swiper.realIndex)}
                style={{
                  // @ts-ignore css variables
                  "--swiper-pagination-color": "#fff",
                  "--swiper-pagination-bullet-inactive-color": "rgba(255,255,255,0.3)",
                  "--swiper-pagination-bullet-inactive-opacity": "1",
                } as React.CSSProperties}
                className="w-full aspect-square bg-brand-gray-800 overflow-hidden"
              >
                {product.images.map((img, i) => (
                  <SwiperSlide key={img.id}>
                    <div
                      className="relative w-full aspect-square cursor-zoom-in group"
                      onClick={() => setZoomOpen(true)}
                    >
                      <Image
                        src={img.url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={i === 0}
                      />
                      {discount > 0 && i === 0 && (
                        <div className="absolute top-4 left-4">
                          <span className="badge-sale">-{discount}%</span>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop: click-based thumbnail + main image */}
            <div className="hidden lg:block space-y-3">
              {/* Main image */}
              <div
                className="relative aspect-square bg-brand-gray-800 overflow-hidden cursor-zoom-in group"
                onClick={() => setZoomOpen(true)}
              >
                <Image
                  src={product.images[activeImage]?.url || ""}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="50vw"
                  priority
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="badge-sale">-{discount}%</span>
                  </div>
                )}
                {/* Zoom hint */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <ZoomIn className="w-3 h-3 text-white/70" />
                  <span className="text-[10px] text-white/70 uppercase tracking-wider">Zoom</span>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "relative w-20 h-20 flex-shrink-0 overflow-hidden bg-brand-gray-800 border-2 transition-colors",
                        activeImage === i ? "border-white" : "border-transparent hover:border-brand-gray-500"
                      )}
                    >
                      <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-gray-500">
              {product.category.name}
            </p>
            <h1 className="text-3xl md:text-4xl font-display tracking-wider uppercase mt-2">
              {product.name}
            </h1>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(avgRating)
                          ? "fill-white text-white"
                          : "text-brand-gray-600"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-brand-gray-400">
                  {avgRating.toFixed(1)} ({reviews.length} ulasan)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <>
                  <span className="text-brand-gray-500 line-through text-sm">
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="badge-sale">Hemat {discount}%</span>
                </>
              )}
            </div>

            {/* Stock */}
            <p className="text-xs text-brand-gray-400 mt-2">
              Stok: <span className={product.totalStock > 0 ? "text-green-400" : "text-red-400"}>
                {product.totalStock > 0 ? `${product.totalStock} item tersedia` : "Habis"}
              </span>
            </p>

            {/* Size selection */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest">
                  Pilih Ukuran
                  {selectedVariantObj && (
                    <span className="text-brand-gray-400 ml-2 normal-case font-normal">
                      — {selectedVariantObj.size} ({selectedVariantObj.stock} tersedia)
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-brand-gray-400 hover:text-white underline"
                >
                  Panduan Ukuran
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    disabled={variant.stock === 0}
                    className={cn(
                      "h-11 min-w-[44px] px-3 text-sm font-bold border-2 transition-all duration-200",
                      variant.stock === 0
                        ? "border-brand-gray-700 text-brand-gray-600 cursor-not-allowed line-through"
                        : selectedVariant === variant.id
                        ? "border-white bg-white text-black"
                        : "border-brand-gray-600 hover:border-white"
                    )}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-3">Jumlah</p>
              <div className="flex items-center border border-brand-gray-600 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-brand-gray-800 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(
                      selectedVariantObj
                        ? Math.min(selectedVariantObj.stock, quantity + 1)
                        : quantity + 1
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center hover:bg-brand-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Out of stock — notify form */}
            {product.totalStock === 0 && (
              <div className="mt-6 border border-brand-gray-700 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400">Stok Habis</p>
                {notifyDone ? (
                  <p className="text-sm text-green-400">Kami akan beritahu kamu lewat email saat stok kembali tersedia.</p>
                ) : (
                  <>
                    <p className="text-xs text-brand-gray-400">Masukkan email kamu — kami akan beritahu saat stok kembali.</p>
                    <form onSubmit={handleNotifySubmit} className="flex gap-2">
                      <input
                        type="email"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="email@kamu.com"
                        className="input-field flex-1 text-sm"
                        required
                      />
                      <button
                        type="submit"
                        disabled={notifySubmitting}
                        className="btn-primary px-4 text-xs disabled:opacity-50 whitespace-nowrap"
                      >
                        {notifySubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Beritahu Saya"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* Actions */}
            <div ref={buyButtonRef} className="flex gap-3 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={product.totalStock === 0}
                className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {product.totalStock === 0 ? "Habis Terjual" : "Tambah ke Keranjang"}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "w-12 h-12 border-2 flex items-center justify-center transition-all",
                  wishlisted
                    ? "border-white bg-white text-black"
                    : "border-brand-gray-600 hover:border-white"
                )}
                aria-label="Tambah ke wishlist"
              >
                <Heart className={cn("w-4 h-4", wishlisted && "fill-current")} />
              </button>
              {/* Share button + dropdown */}
              <div className="relative" ref={shareRef}>
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  className="w-12 h-12 border-2 border-brand-gray-600 hover:border-white flex items-center justify-center transition-colors"
                  aria-label="Bagikan produk"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {shareOpen && (
                  <div className="absolute right-0 bottom-14 w-48 bg-brand-black border border-brand-gray-700 py-1 z-20 shadow-xl">
                    <button
                      onClick={handleShareWA}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-white/[0.06] transition-colors text-left"
                    >
                      <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Bagikan ke WhatsApp
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-white/[0.06] transition-colors text-left"
                    >
                      {copied
                        ? <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        : <Copy className="w-4 h-4 text-brand-gray-400 flex-shrink-0" />}
                      {copied ? "Link Tersalin!" : "Salin Link Produk"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-brand-gray-600 mt-4">SKU: {product.sku}</p>
            )}

            {/* Accordion sections */}
            <div className="mt-8 border-t border-brand-gray-800">
              {sections.map((section) => (
                <div key={section.key} className="border-b border-brand-gray-800">
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === section.key ? null : section.key
                      )
                    }
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {section.title}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-brand-gray-400 transition-transform",
                        expandedSection === section.key && "rotate-180"
                      )}
                    />
                  </button>
                  {expandedSection === section.key && (
                    <div className="pb-4 text-sm text-brand-gray-400 leading-relaxed">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 border-t border-brand-gray-800 pt-12">
          <h2 className="section-title mb-8">
            Ulasan Pembeli
            {reviews.length > 0 && (
              <span className="ml-3 text-sm font-sans font-normal text-brand-gray-500 normal-case tracking-normal">
                ({reviews.length} ulasan)
              </span>
            )}
          </h2>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-brand-gray-900 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{review.user.name}</p>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-3 h-3",
                              star <= review.rating
                                ? "fill-white text-white"
                                : "text-brand-gray-600"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-brand-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm text-brand-gray-300 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  {review.isVerified && (
                    <p className="mt-2 text-[10px] text-green-500 uppercase tracking-wider">
                      ✓ Pembelian Terverifikasi
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-gray-500 text-sm">Belum ada ulasan untuk produk ini.</p>
          )}

          {/* Review form — verified buyers only */}
          {session?.user && hasPurchased && (
            <ReviewForm
              productSlug={product.slug}
              userId={(session.user as any).id}
              existingReview={userReview}
              onReviewAdded={handleReviewAdded}
            />
          )}
          {session?.user && !hasPurchased && (
            <p className="text-xs text-brand-gray-500 mt-6 border border-brand-gray-800 px-4 py-3">
              Hanya pembeli yang sudah menerima produk ini yang dapat menulis ulasan.
            </p>
          )}
          {!session && (
            <p className="text-xs text-brand-gray-500 mt-6">
              <Link href="/login" className="underline hover:text-white">Login</Link> untuk memberi ulasan.
            </p>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-brand-gray-800 pt-12">
            <h2 className="section-title mb-8">Produk Terkait</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Recently viewed */}
        <RecentlyViewedSection
          currentProductId={product.id}
          current={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            comparePrice: product.comparePrice,
            imageUrl: product.images[0]?.url || "",
            category: product.category?.name,
          }}
        />
      </div>

      {/* ── Size Guide Modal ─────────────────────────────── */}
      {sizeGuideOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSizeGuideOpen(false)}
        >
          <div
            className="w-full sm:max-w-lg bg-brand-black border border-brand-gray-700 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-800">
              <p className="text-xs font-bold uppercase tracking-widest">Panduan Ukuran</p>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="p-1 hover:text-brand-gray-400 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* How to measure */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-3">Cara Mengukur</p>
                <div className="grid grid-cols-1 gap-2 text-xs text-brand-gray-400">
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 border border-brand-gray-600 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">A</span>
                    <span><strong className="text-white">Lingkar Dada</strong> — Ukur melingkar bagian terlebar dada, tepat di bawah ketiak</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 border border-brand-gray-600 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">B</span>
                    <span><strong className="text-white">Lebar Bahu</strong> — Ukur dari ujung bahu kiri ke ujung bahu kanan</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 border border-brand-gray-600 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">C</span>
                    <span><strong className="text-white">Panjang Baju</strong> — Ukur dari leher belakang hingga ujung bawah baju</span>
                  </div>
                </div>
              </div>

              {/* Size chart */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-3">Tabel Ukuran (cm)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-brand-gray-700">
                        <th className="text-left py-2.5 pr-4 text-brand-gray-500 font-semibold uppercase tracking-widest text-[10px]">Ukuran</th>
                        <th className="py-2.5 px-3 text-brand-gray-500 font-semibold uppercase tracking-widest text-[10px]">A — Dada</th>
                        <th className="py-2.5 px-3 text-brand-gray-500 font-semibold uppercase tracking-widest text-[10px]">B — Bahu</th>
                        <th className="py-2.5 px-3 text-brand-gray-500 font-semibold uppercase tracking-widest text-[10px]">C — Panjang</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: "XS", chest: "82–86",  shoulder: "40–42", length: "65–67" },
                        { size: "S",  chest: "86–91",  shoulder: "42–44", length: "67–69" },
                        { size: "M",  chest: "91–97",  shoulder: "44–46", length: "69–71" },
                        { size: "L",  chest: "97–103", shoulder: "46–48", length: "71–73" },
                        { size: "XL", chest: "103–109",shoulder: "48–50", length: "73–75" },
                        { size: "XXL",chest: "109–116",shoulder: "50–52", length: "75–77" },
                      ].map((row) => {
                        const isSelected = selectedVariantObj?.size === row.size;
                        return (
                          <tr
                            key={row.size}
                            className={`border-b border-brand-gray-800 transition-colors ${
                              isSelected ? "bg-white/10 text-white" : "text-brand-gray-400"
                            }`}
                          >
                            <td className="py-2.5 pr-4 font-bold text-white">{row.size}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{row.chest}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{row.shoulder}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{row.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-brand-gray-900 border border-brand-gray-800 px-4 py-3 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500">Tips Memilih Ukuran</p>
                <p className="text-xs text-brand-gray-400">Jika ukuran tubuhmu berada di antara dua ukuran, pilih yang <strong className="text-white">lebih besar</strong> untuk tampilan lebih longgar, atau yang <strong className="text-white">lebih kecil</strong> untuk fit yang lebih ketat.</p>
                <p className="text-xs text-brand-gray-400">Semua produk DUTCH.IND menggunakan potongan <strong className="text-white">oversized</strong> — jika kamu biasa pakai M, pertimbangkan S untuk fit standar.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Zoom Modal ───────────────────────────────────── */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setZoomOpen(false)}
        >
          <button
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-none"
            onClick={() => setZoomOpen(false)}
            aria-label="Tutup zoom"
          >
            <X className="w-5 h-5" />
          </button>
          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                  className={cn(
                    "w-12 h-12 border-2 overflow-hidden flex-shrink-0 transition-colors",
                    activeImage === i ? "border-white" : "border-white/20 hover:border-white/60"
                  )}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div
            className="relative w-full h-full flex items-center justify-center p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: "pinch-zoom" }}
          >
            <img
              src={product.images[activeImage]?.url || ""}
              alt={product.name}
              className="max-w-full max-h-full object-contain select-none"
              style={{ maxHeight: "calc(100vh - 120px)" }}
              draggable={false}
              onClick={() => setZoomOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Sticky Buy Bar (mobile only, appears when main buy button scrolls out of view) ── */}
      {product.totalStock > 0 && (
        <div
          className={cn(
            "lg:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-gray-900 border-t border-brand-gray-700 transition-transform duration-300 ease-in-out",
            showStickyBar ? "translate-y-0" : "translate-y-full"
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Product info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider truncate">{product.name}</p>
              <p className="text-sm font-bold text-white mt-0.5">{formatPrice(product.price)}</p>
            </div>
            {/* Beli button */}
            <button
              onClick={handleAddToCart}
              className="flex-shrink-0 flex items-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-widest px-5 py-3 hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              {selectedVariant ? "Beli" : "Pilih Ukuran"}
            </button>
          </div>
          {/* Compact size chips shown only when no size is selected */}
          {!selectedVariant && (
            <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto">
              {product.variants.filter(v => v.stock > 0).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  className="w-9 h-9 text-xs font-bold border border-brand-gray-600 hover:border-white flex-shrink-0 transition-all"
                >
                  {v.size}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
