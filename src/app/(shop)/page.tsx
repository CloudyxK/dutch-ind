import StoreHeader from "@/components/home/StoreHeader";
import AllProductsShowcase from "@/components/home/AllProductsShowcase";
import CategorySection from "@/components/home/CategorySection";
import PromoBanner from "@/components/home/PromoBanner";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import BestSellers from "@/components/home/BestSellers";
import BrandFeatures from "@/components/home/BrandFeatures";
import MarqueeTicker from "@/components/home/MarqueeTicker";
import RevealSection from "@/components/ui/RevealSection";
import InstagramSection from "@/components/home/InstagramSection";
import { Suspense } from "react";
import BundleSection from "@/components/home/BundleSection";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DUTCH.IND — Brand Streetwear Premium Indonesia",
};

async function getRecentReviews() {
  return prisma.review.findMany({
    where: { isVerified: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true } },
      product: { select: { name: true, slug: true } },
    },
  });
}

function formatReviewDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(date);
}

function formatReviewerName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

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

  // Collect all unique product IDs across sections and fetch review stats once
  const allIds = Array.from(new Set([
    ...allProducts.map((p) => p.id),
    ...featured.map((p) => p.id),
    ...bestSellers.map((p) => p.id),
  ]));

  const reviewStats = allIds.length > 0
    ? await prisma.review.groupBy({
        by: ["productId"],
        _avg: { rating: true },
        _count: { rating: true },
        where: { productId: { in: allIds } },
      })
    : [];

  const statsMap = Object.fromEntries(
    reviewStats.map((s) => [s.productId, { avg: s._avg.rating ?? 0, count: s._count.rating }])
  );

  function enrichProducts(products: typeof allProducts) {
    return products.map((p) => {
      const stats = statsMap[p.id];
      return { ...p, averageRating: stats?.avg ?? 0, _count: { reviews: stats?.count ?? 0 } };
    });
  }

  return {
    allProducts: enrichProducts(allProducts),
    featured: enrichProducts(featured),
    bestSellers: enrichProducts(bestSellers),
    categories,
    flashSale,
  };
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dutch-indd.vercel.app";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DUTCH.IND",
  url: APP_URL,
  logo: `${APP_URL}/logo.png`,
  description: "Brand streetwear premium dari Samarinda, Kalimantan Timur.",
  contactPoint: { "@type": "ContactPoint", contactType: "customer service", availableLanguage: "Indonesian" },
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DUTCH.IND",
  url: APP_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/products?search={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default async function HomePage() {
  const [{ allProducts, featured, bestSellers, categories, flashSale }, recentReviews] =
    await Promise.all([getHomeData(), getRecentReviews()]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      {/* Compact brand header — not full screen */}
      <StoreHeader />

      {/* Scrolling ticker */}
      <MarqueeTicker />

      {/* Flash sale section — shown prominently if active */}
      {flashSale && (
        <FlashSaleSection flashSale={flashSale as any} products={allProducts as any} />
      )}

      {/* ── Products directly — Hellstar style ── */}
      <AllProductsShowcase
        products={allProducts as any}
        title="Limited Edition"
        label="Latest Drop"
        viewAllHref="/products"
      />

      {/* Divider ticker */}
      <MarqueeTicker />

      {/* Flash sale promo banner (coupon reminder) if active */}
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

      {/* Bundle Outfit */}
      <RevealSection direction="up">
        <Suspense fallback={null}>
          <BundleSection />
        </Suspense>
      </RevealSection>

      {/* Customer reviews */}
      {recentReviews.length > 0 && (
        <RevealSection direction="up">
          <section className="py-16 md:py-24 bg-brand-gray-900">
            <div className="container-main">
              {/* Section header */}
              <div className="mb-10 md:mb-14">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-px bg-white/30" />
                  <span className="text-[9px] uppercase tracking-[0.5em] text-white/28">Ulasan Pelanggan</span>
                </div>
                <h2 className="section-title">Apa Kata Mereka</h2>
                <p className="mt-2 text-sm text-brand-gray-400">Review jujur dari pembeli yang sudah buktikan kualitasnya.</p>
              </div>

              {/* Review grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-black border border-brand-gray-700 p-6 flex flex-col gap-4"
                  >
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          className={`w-4 h-4 ${s <= review.rating ? "fill-white text-white" : "fill-brand-gray-700 text-brand-gray-700"}`}
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-brand-gray-300 leading-relaxed line-clamp-3">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-end justify-between mt-auto pt-2 border-t border-brand-gray-800">
                      <div>
                        <p className="text-xs font-medium text-white">
                          {formatReviewerName(review.user.name)}
                        </p>
                        <p className="text-[11px] text-brand-gray-500 mt-0.5">
                          {review.product.name}
                        </p>
                      </div>
                      <span className="text-[11px] text-brand-gray-600">
                        {formatReviewDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      {/* Instagram feed */}
      <RevealSection direction="up">
        <InstagramSection />
      </RevealSection>

      {/* Brand features */}
      <RevealSection direction="up">
        <BrandFeatures />
      </RevealSection>
    </>
  );
}
