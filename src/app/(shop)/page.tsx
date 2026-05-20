import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategorySection from "@/components/home/CategorySection";
import PromoBanner from "@/components/home/PromoBanner";
import BestSellers from "@/components/home/BestSellers";
import NewArrivals from "@/components/home/NewArrivals";
import BrandFeatures from "@/components/home/BrandFeatures";
import MarqueeTicker from "@/components/home/MarqueeTicker";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DUTCH.IND — Brand Streetwear Premium Indonesia",
};

async function getHomeData() {
  const [featured, newArrivals, bestSellers, categories, flashSaleRow] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
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
      // Only expose if active and not expired
      if (cfg.active && cfg.endAt && new Date(cfg.endAt) > new Date()) {
        flashSale = cfg;
      }
    } catch {
      // ignore malformed config
    }
  }

  return { featured, newArrivals, bestSellers, categories, flashSale };
}

export default async function HomePage() {
  const { featured, newArrivals, bestSellers, categories, flashSale } = await getHomeData();

  return (
    <>
      <HeroSection />
      <MarqueeTicker />
      <CategorySection categories={categories as any} />
      <FeaturedProducts products={featured as any} />
      <MarqueeTicker />
      <PromoBanner flashSale={flashSale} />
      <NewArrivals products={newArrivals as any} />
      <BestSellers products={bestSellers as any} />
      <BrandFeatures />
    </>
  );
}
