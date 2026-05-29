"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import ImageWithShimmer from "@/components/ui/ImageWithShimmer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useWishlistStore } from "@/store/useCartStore";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  className?: string;
  rank?: number;
}

export default function ProductCard({ product, className, rank }: Props) {
  const { addItem }                         = useCartStore();
  const { toggleWishlist, isWishlisted }    = useWishlistStore();
  const [hovered, setHovered]              = useState(false);
  const [selectedSize, setSelectedSize]    = useState<string | null>(null);
  const [showSizes, setShowSizes]          = useState(false);
  const [added, setAdded]                  = useState(false);

  const discount    = product.comparePrice ? calculateDiscount(product.price, product.comparePrice) : 0;
  const isOutOfStock = product.totalStock === 0;
  const wishlisted   = isWishlisted(product.id);

  const primaryImage   = product.images[0]?.url || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600";
  const secondaryImage = product.images[1]?.url || primaryImage;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (isOutOfStock) return;
    if (product.variants.length === 1) {
      addItem(product, product.variants[0]);
      setAdded(true);
      setTimeout(() => setAdded(false), 1400);
      return;
    }
    setShowSizes(true);
  }

  function handleSizeSelect(e: React.MouseEvent, variantId: string) {
    e.preventDefault();
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) {
      addItem(product, variant);
      setShowSizes(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1400);
    }
  }

  return (
    <motion.div
      className={cn("group block", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div
          className="relative aspect-[3/4] overflow-hidden bg-[#111]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setShowSizes(false); }}
        >
          {/* Primary image */}
          <ImageWithShimmer
            src={primaryImage}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-700",
              hovered ? "scale-[1.07] opacity-0" : "scale-100 opacity-100"
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {/* Secondary image (crossfade) */}
          <Image
            src={secondaryImage}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-700",
              hovered ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Dark overlay */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-400",
              hovered ? "bg-black/25" : "bg-black/0"
            )}
          />

          {/* Rank badge */}
          {rank && (
            <div className="absolute top-3 left-3 z-10">
              <span className="font-display text-[28px] leading-none text-white/10 select-none">
                {String(rank).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Product badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10" style={{ left: rank ? "auto" : "12px", right: rank ? "auto" : "auto" }}>
            {!rank && product.isNewArrival  && <span className="badge-new text-[10px]">Baru</span>}
            {!rank && product.isBestSeller  && <span className="badge bg-brand-gray-800/90 text-white text-[10px]">Terlaris</span>}
            {discount > 0                   && <span className="badge-sale text-[10px]">-{discount}%</span>}
            {isOutOfStock                   && <span className="badge-sold-out text-[10px]">Habis</span>}
          </div>

          {/* Wishlist — always visible on mobile, hover-only on desktop */}
          <motion.button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className="absolute top-3 right-3 z-10 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: wishlisted || hovered ? 1 : 0 }}
            style={{ opacity: undefined }}
            whileTap={{ scale: 0.85 }}
            aria-label={wishlisted ? "Hapus wishlist" : "Tambah wishlist"}
          >
            <Heart
              className={cn("w-4 h-4 transition-colors", wishlisted ? "fill-white text-white" : "text-white")}
            />
          </motion.button>
          {/* Mobile-only permanent wishlist button (not affected by hover animation) */}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className="sm:hidden absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            aria-label={wishlisted ? "Hapus wishlist" : "Tambah wishlist"}
          >
            <Heart
              className={cn("w-4 h-4 transition-colors", wishlisted ? "fill-white text-white" : "text-white")}
            />
          </button>

          {/* Add to cart — slides up on desktop hover, always visible on mobile */}
          {!isOutOfStock && (
            <>
              {/* Desktop: slide-up on hover */}
              <AnimatePresence>
                {hovered && (
                  <motion.div
                    key="cart-bar"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="hidden sm:block absolute bottom-0 inset-x-0 z-10"
                    onClick={(e) => e.preventDefault()}
                  >
                    {showSizes ? (
                      <div className="bg-black/95 p-3">
                        <p className="text-[9px] uppercase tracking-[0.35em] text-white/40 mb-2 text-center">Pilih Ukuran</p>
                        <div className="flex gap-1 justify-center flex-wrap">
                          {product.variants.map((v) => (
                            <motion.button
                              key={v.id}
                              onClick={(e) => handleSizeSelect(e, v.id)}
                              disabled={v.stock === 0}
                              whileHover={v.stock > 0 ? { scale: 1.08 } : {}}
                              whileTap={v.stock > 0 ? { scale: 0.94 } : {}}
                              className={cn(
                                "w-9 h-9 text-xs font-bold border transition-colors",
                                v.stock === 0
                                  ? "border-white/10 text-white/20 cursor-not-allowed"
                                  : "border-white/60 text-white hover:bg-white hover:text-black"
                              )}
                            >
                              {v.size}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <motion.button
                        onClick={handleAddToCart}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors duration-200",
                          added
                            ? "bg-white text-black"
                            : "bg-black/90 text-white hover:bg-white hover:text-black"
                        )}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {added ? "Ditambahkan ✓" : "Tambah ke Keranjang"}
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile: permanent bottom button */}
              <div
                className="sm:hidden absolute bottom-0 inset-x-0 z-10"
                onClick={(e) => e.preventDefault()}
              >
                {showSizes ? (
                  <div className="bg-black/95 p-2.5">
                    <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1.5 text-center">Ukuran</p>
                    <div className="flex gap-1 justify-center flex-wrap">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={(e) => handleSizeSelect(e, v.id)}
                          disabled={v.stock === 0}
                          className={cn(
                            "w-8 h-8 text-[10px] font-bold border transition-colors",
                            v.stock === 0
                              ? "border-white/10 text-white/20 cursor-not-allowed"
                              : "border-white/60 text-white active:bg-white active:text-black"
                          )}
                        >
                          {v.size}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className={cn(
                      "w-full py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors",
                      added ? "bg-white text-black" : "bg-black/85 text-white"
                    )}
                  >
                    <ShoppingBag className="w-3 h-3" />
                    {added ? "✓ Ditambahkan" : "Keranjang"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="pt-2 pb-1 px-0">
          {product.category ? (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-[9px] uppercase tracking-[0.22em] text-white/30 hover:text-white/60 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {product.category.name}
            </Link>
          ) : (
            <p className="text-[9px] uppercase tracking-[0.22em] text-white/30">&nbsp;</p>
          )}
          <h3 className="text-xs font-semibold mt-0.5 truncate group-hover:text-white/80 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-bold">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-[10px] text-white/30 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
          {(product.averageRating ?? 0) > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-3 h-3 ${star <= Math.round(product.averageRating ?? 0) ? 'text-yellow-400' : 'text-white/15'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-[9px] text-white/30">({product._count?.reviews ?? 0})</span>
            </div>
          )}
          {!isOutOfStock && product.totalStock <= 5 && (
            <p className="text-[9px] text-red-400/80 mt-0.5">Sisa {product.totalStock}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
