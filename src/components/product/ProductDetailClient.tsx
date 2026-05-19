"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Star, Share2, ChevronDown, Minus, Plus } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/store/useCartStore";
import { formatPrice, calculateDiscount, formatDate } from "@/lib/utils";
import ProductCard from "./ProductCard";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  product: Product & { averageRating: number };
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>("deskripsi");

  const wishlisted = isWishlisted(product.id);
  const discount = product.comparePrice
    ? calculateDiscount(product.price, product.comparePrice)
    : 0;

  const selectedVariantObj = product.variants.find((v) => v.id === selectedVariant);

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
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-brand-gray-800 py-3">
        <div className="container-main">
          <nav className="flex items-center gap-2 text-xs text-brand-gray-500">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-white transition-colors">Produk</Link>
            <span>/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-white transition-colors"
            >
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square bg-brand-gray-800 overflow-hidden">
              <Image
                src={product.images[activeImage]?.url || ""}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="badge-sale">-{discount}%</span>
                </div>
              )}
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

          {/* Product Info */}
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-gray-500">
              {product.category.name}
            </p>
            <h1 className="text-3xl md:text-4xl font-display tracking-wider uppercase mt-2">
              {product.name}
            </h1>

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(product.averageRating)
                          ? "fill-white text-white"
                          : "text-brand-gray-600"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-brand-gray-400">
                  {product.averageRating.toFixed(1)} ({product.reviews?.length} ulasan)
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
                <button className="text-xs text-brand-gray-400 hover:text-white underline">
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
                      "w-12 h-12 text-sm font-bold border-2 transition-all duration-200",
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

            {/* Actions */}
            <div className="flex gap-3 mt-6">
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
              <button className="w-12 h-12 border-2 border-brand-gray-600 hover:border-white flex items-center justify-center transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
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
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16 border-t border-brand-gray-800 pt-12">
            <h2 className="section-title mb-8">Ulasan Pembeli</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((review) => (
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
          </div>
        )}

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
      </div>
    </div>
  );
}
