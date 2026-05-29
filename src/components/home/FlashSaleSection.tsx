"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import CountdownTimer from "@/components/ui/CountdownTimer";
import type { Product } from "@/types";

type FlashSaleConfig = {
  active: boolean;
  title: string;
  subtitle: string;
  endAt: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  couponCode: string;
};

interface Props {
  flashSale: FlashSaleConfig;
  products: Product[];
}

function getSalePrice(originalPrice: number, cfg: FlashSaleConfig): number {
  if (cfg.discountType === "PERCENTAGE") {
    return Math.round(originalPrice * (1 - cfg.discountValue / 100));
  }
  return Math.max(0, originalPrice - cfg.discountValue);
}

export default function FlashSaleSection({ flashSale, products }: Props) {
  const { addItem } = useCartStore();

  // Show at most 6 products in the strip
  const displayProducts = products.slice(0, 6);

  const discountLabel =
    flashSale.discountType === "PERCENTAGE"
      ? `${flashSale.discountValue}% OFF`
      : `Rp${flashSale.discountValue.toLocaleString("id-ID")} OFF`;

  return (
    <section
      className="relative overflow-hidden py-10 md:py-14"
      style={{ background: "linear-gradient(135deg, #1a0505 0%, #0d0d0d 50%, #150505 100%)" }}
    >
      {/* Grain texture */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.035 }}
        aria-hidden
      >
        <filter id="fs-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#fs-grain)" />
      </svg>

      {/* Red ambient glow — top left */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "-20%",
          left: "-10%",
          width: "60%",
          height: "160%",
          background: "radial-gradient(ellipse at center, rgba(220,38,38,0.08) 0%, transparent 65%)",
        }}
      />

      {/* Border rules */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "rgba(220,38,38,0.2)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "rgba(220,38,38,0.2)" }} />

      <div className="container-main relative z-10 space-y-8">

        {/* ── Header row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Left — label + title + coupon */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 fill-red-500 text-red-500" />
              <span
                className="text-[10px] font-black uppercase tracking-[0.5em]"
                style={{ color: "rgba(220,38,38,0.95)" }}
              >
                Flash Sale
              </span>
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 ml-1"
                style={{
                  background: "rgba(220,38,38,0.15)",
                  border: "1px solid rgba(220,38,38,0.35)",
                  color: "rgba(220,38,38,0.9)",
                }}
              >
                {discountLabel}
              </span>
            </div>

            <h2
              className="font-display uppercase leading-none text-white"
              style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)" }}
            >
              {flashSale.title}
            </h2>

            <p className="mt-1.5 text-xs text-white/35">
              {flashSale.subtitle}. Pakai kode{" "}
              <span className="font-mono font-bold text-white/70 tracking-wider">
                {flashSale.couponCode}
              </span>{" "}
              saat checkout.
            </p>
          </div>

          {/* Right — countdown + CTA */}
          <div className="flex flex-col sm:items-end gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/25 mb-1 sm:text-right">Berakhir dalam</p>
              <CountdownTimer
                endAt={flashSale.endAt}
                className="inline-flex items-start gap-0.5 text-lg"
              />
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 hover:text-white transition-colors"
            >
              Lihat Semua
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* ── Product strip ── */}
        {displayProducts.length > 0 && (
          <div className="relative">
            {/* Fade edges on desktop */}
            <div
              className="hidden md:block absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #0d0d0d, transparent)" }}
            />
            <div
              className="hidden md:block absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, #0d0d0d, transparent)" }}
            />

            <div
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {displayProducts.map((product) => (
                <FlashProductCard
                  key={product.id}
                  product={product}
                  flashSale={flashSale}
                  onAddToCart={addItem}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Individual flash sale product card ──────────────────────────────────────

interface CardProps {
  product: Product;
  flashSale: FlashSaleConfig;
  onAddToCart: (product: Product, variant: import("@/types").ProductVariant) => void;
}

function FlashProductCard({ product, flashSale, onAddToCart }: CardProps) {
  const salePrice = getSalePrice(product.price, flashSale);
  const image = product.images[0]?.url || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600";
  const isOutOfStock = product.totalStock === 0;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (isOutOfStock || product.variants.length === 0) return;
    // Pick first in-stock variant
    const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    onAddToCart(product, variant);
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex-none snap-start"
      style={{ width: "clamp(140px, 28vw, 200px)" }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#111]" style={{ border: "1px solid rgba(220,38,38,0.15)" }}>
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          sizes="(max-width: 640px) 42vw, 200px"
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* SALE badge — top-left */}
        <div
          className="absolute top-2 left-2 z-10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
          style={{ background: "rgba(220,38,38,0.95)", color: "#fff" }}
        >
          SALE
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Habis</span>
          </div>
        )}

        {/* Quick add — slides up on hover */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-0 inset-x-0 z-10 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            style={{ background: "rgba(220,38,38,0.95)" }}
          >
            + Keranjang
          </button>
        )}
      </div>

      {/* Info */}
      <div className="pt-2 px-0.5">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 truncate">
          {product.category?.name ?? ""}
        </p>
        <h3 className="text-[11px] font-semibold text-white/85 truncate mt-0.5 group-hover:text-white transition-colors">
          {product.name}
        </h3>

        {/* Prices */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-xs font-bold text-red-400">{formatPrice(salePrice)}</span>
          <span className="text-[10px] text-white/25 line-through">{formatPrice(product.price)}</span>
        </div>

        {/* Low stock warning */}
        {!isOutOfStock && product.totalStock <= 5 && (
          <p className="text-[9px] text-red-400/70 mt-0.5">Sisa {product.totalStock}</p>
        )}
      </div>
    </Link>
  );
}
