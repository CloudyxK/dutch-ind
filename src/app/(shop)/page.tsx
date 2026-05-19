import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategorySection from "@/components/home/CategorySection";
import PromoBanner from "@/components/home/PromoBanner";
import BestSellers from "@/components/home/BestSellers";
import NewArrivals from "@/components/home/NewArrivals";
import BrandFeatures from "@/components/home/BrandFeatures";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DUTCH.IND — Brand Streetwear Premium Indonesia",
};

async function getHomeData() {
  const [featured, newArrivals, bestSellers, categories] = await Promise.all([
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
  ]);

  return { featured, newArrivals, bestSellers, categories };
}

export default async function HomePage() {
  const { featured, newArrivals, bestSellers, categories } = await getHomeData();

  return (
    <>
      <HeroSection />
      <CategorySection categories={categories as any} />
      <FeaturedProducts products={featured as any} />
      <PromoBanner />
      <NewArrivals products={newArrivals as any} />
      <BestSellers products={bestSellers as any} />
      <BrandFeatures />
    </>
  );
}
