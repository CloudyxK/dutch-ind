import StoreHeader from "@/components/home/StoreHeader";
import AllProductsShowcase from "@/components/home/AllProductsShowcase";
import CategorySection from "@/components/home/CategorySection";
import PromoBanner from "@/components/home/PromoBanner";
import BestSellers from "@/components/home/BestSellers";
import BrandFeatures from "@/components/home/BrandFeatures";
import MarqueeTicker from "@/components/home/MarqueeTicker";
import RevealSection from "@/components/ui/RevealSection";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DUTCH.IND — Brand Streetwear Premium Indonesia",
};

async function getHomeData() {
  const [allProducts, featured, bestSellers, categories, flashSaleRow] = await Promise.all([
    /* Show all latest products directly — Hellstar style */
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        images:   { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        images:   { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      include: {
        images:   { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
      },
      take: 4,
      orderBy: { soldCount: "desc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.setting.findUnique({ where: { key: "flashsale.config" } }),
  ]);

  let flashSale = null;
  if (flashSaleRow?.value) {
    try {
      const cfg = JSON.parse(flashSaleRow.value);
      if (cfg.active && cfg.endAt && new Date(cfg.endAt) > new Date()) flashSale = cfg;
    } catch { /* ignore */ }
  }

  return { allProducts, featured, bestSellers, categories, flashSale };
}

export default async function HomePage() {
  const { allProducts, featured, bestSellers, categories, flashSale } = await getHomeData();

  return (
    <>
      {/* Compact brand header — not full screen */}
      <StoreHeader />

      {/* Scrolling ticker */}
      <MarqueeTicker />

      {/* ── Products directly — Hellstar style ── */}
      <AllProductsShowcase
        products={allProducts as any}
        title="Limited Edition"
        label="Latest Drop"
        viewAllHref="/products"
      />

      {/* Divider ticker */}
      <MarqueeTicker />

      {/* Flash sale if active */}
      <RevealSection direction="none">
        <PromoBanner flashSale={flashSale} />
      </RevealSection>

      {/* Categories */}
      <RevealSection direction="up">
        <CategorySection categories={categories as any} />
      </RevealSection>

      {/* Best sellers */}
      <RevealSection direction="up">
        <BestSellers products={bestSellers as any} />
      </RevealSection>

      {/* Brand features */}
      <RevealSection direction="up">
        <BrandFeatures />
      </RevealSection>
    </>
  );
}
