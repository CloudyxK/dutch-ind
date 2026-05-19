"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCartStore, useWishlistStore } from "@/store/useCartStore";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizes, setShowSizes] = useState(false);

  const discount = product.comparePrice
    ? calculateDiscount(product.price, product.comparePrice)
    : 0;

  const isOutOfStock = product.totalStock === 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    if (product.variants.length === 1) {
      addItem(product, product.variants[0]);
      return;
    }

    setShowSizes(true);
  };

  const handleSizeSelect = (e: React.MouseEvent, variantId: string) => {
    e.preventDefault();
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) {
      addItem(product, variant);
      setShowSizes(false);
    }
  };

  const primaryImage = product.images[0]?.url || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600";
  const secondaryImage = product.images[1]?.url || primaryImage;

  return (
    <Link href={`/products/${product.slug}`} className={cn("product-card group block", className)}>
      {/* Image container */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-brand-gray-800"
        onMouseEnter={() => setImageIndex(1)}
        onMouseLeave={() => setImageIndex(0)}
      >
        <Image
          src={imageIndex === 0 ? primaryImage : secondaryImage}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNewArrival && (
            <span className="badge-new text-[10px]">Baru</span>
          )}
          {product.isBestSeller && (
            <span className="badge bg-brand-gray-800/90 text-white text-[10px]">Terlaris</span>
          )}
          {discount > 0 && (
            <span className="badge-sale text-[10px]">-{discount}%</span>
          )}
          {isOutOfStock && (
            <span className="badge-sold-out text-[10px]">Habis</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className={cn(
              "w-8 h-8 flex items-center justify-center bg-brand-black/80 backdrop-blur-sm",
              "opacity-0 group-hover:opacity-100 transition-all duration-200",
              wishlisted && "opacity-100"
            )}
            aria-label={wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                wishlisted ? "fill-white text-white" : "text-white"
              )}
            />
          </button>
        </div>

        {/* Add to cart */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            {showSizes ? (
              <div
                className="bg-brand-black/95 p-3"
                onClick={(e) => e.preventDefault()}
              >
                <p className="text-[10px] uppercase tracking-wider text-brand-gray-400 mb-2 text-center">
                  Pilih Ukuran
                </p>
                <div className="flex gap-1 justify-center">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={(e) => handleSizeSelect(e, variant.id)}
                      disabled={variant.stock === 0}
                      className={cn(
                        "w-9 h-9 text-xs font-bold border transition-colors",
                        variant.stock === 0
                          ? "border-brand-gray-700 text-brand-gray-600 cursor-not-allowed"
                          : "border-white text-white hover:bg-white hover:text-black"
                      )}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-3 h-3" />
                Tambah ke Keranjang
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-3">
        <p className="text-[10px] uppercase tracking-wider text-brand-gray-500">
          {product.category?.name}
        </p>
        <h3 className="text-sm font-semibold mt-0.5 truncate group-hover:text-brand-gray-200 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-brand-gray-500 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {!isOutOfStock && product.totalStock <= 5 && (
          <p className="text-[10px] text-red-400 mt-1">
            Sisa {product.totalStock} item
          </p>
        )}
      </div>
    </Link>
  );
}
