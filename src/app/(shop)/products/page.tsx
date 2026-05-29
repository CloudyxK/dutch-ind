import { Suspense } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import SortDropdown from "@/components/product/SortDropdown";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Semua Produk — Streetwear Collection",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    sizes?: string;
    page?: string;
    isFeatured?: string;
    isNewArrival?: string;
    isBestSeller?: string;
  }>;
}

const ITEMS_PER_PAGE = 12;

async function ProductGrid({ searchParams }: { searchParams: Awaited<PageProps["searchParams"]> }) {
  const page = parseInt(searchParams.page || "1");
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: any = { isActive: true };

  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
      { tags: { contains: searchParams.search.toLowerCase() } },
    ];
  }
  if (searchParams.minPrice) where.price = { gte: parseFloat(searchParams.minPrice) };
  if (searchParams.maxPrice) where.price = { ...where.price, lte: parseFloat(searchParams.maxPrice) };
  if (searchParams.sizes) {
    const sizeList = searchParams.sizes.split(",").filter(Boolean);
    if (sizeList.length) where.variants = { some: { size: { in: sizeList }, stock: { gt: 0 } } };
  }
  if (searchParams.isFeatured === "true") where.isFeatured = true;
  if (searchParams.isNewArrival === "true") where.isNewArrival = true;
  if (searchParams.isBestSeller === "true") where.isBestSeller = true;

  const sortMap: Record<string, any> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    popular: { soldCount: "desc" },
  };
  const orderBy = sortMap[searchParams.sort || "newest"];

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
      },
      orderBy,
      take: ITEMS_PER_PAGE,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  const productIds = products.map((p) => p.id);
  const reviewStats = productIds.length > 0
    ? await prisma.review.groupBy({
        by: ["productId"],
        _avg: { rating: true },
        _count: { rating: true },
        where: { productId: { in: productIds } },
      })
    : [];

  const statsMap = Object.fromEntries(
    reviewStats.map((s) => [s.productId, { avg: s._avg.rating ?? 0, count: s._count.rating }])
  );

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (products.length === 0) {
    const hasActiveFilter =
      searchParams.search ||
      searchParams.category ||
      searchParams.minPrice ||
      searchParams.maxPrice ||
      searchParams.sizes ||
      searchParams.isFeatured ||
      searchParams.isNewArrival ||
      searchParams.isBestSeller;

    return (
      <div className="text-center py-24 space-y-4">
        <div className="flex justify-center">
          <ShoppingBag className="w-16 h-16 text-brand-gray-700" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-widest">
          Tidak ada produk ditemukan
        </h2>
        <p className="text-sm text-brand-gray-400 max-w-xs mx-auto">
          {searchParams.search
            ? "Coba kata kunci lain atau hapus filter"
            : "Semua produk sedang habis. Kunjungi lagi nanti."}
        </p>
        {hasActiveFilter && (
          <Link
            href="/products"
            className="inline-flex items-center gap-2 btn-secondary text-xs uppercase tracking-widest mt-2"
          >
            Lihat Semua Produk
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="text-xs text-brand-gray-500 mb-6">
        Menampilkan {skip + 1}–{Math.min(skip + products.length, total)} dari {total} produk
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const stats = statsMap[product.id];
          const enriched = { ...product, averageRating: stats?.avg ?? 0, _count: { reviews: stats?.count ?? 0 } };
          return <ProductCard key={product.id} product={enriched as any} />;
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?${new URLSearchParams({ ...searchParams, page: String(p) }).toString()}`}
              className={`w-9 h-9 flex items-center justify-center text-sm font-medium border transition-colors
                ${page === p
                  ? "bg-white text-black border-white"
                  : "border-brand-gray-700 text-brand-gray-400 hover:border-white hover:text-white"
                }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen py-10">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">
            {params.search
              ? `Hasil: "${params.search}"`
              : params.category
              ? categories.find((c) => c.slug === params.category)?.name || "Koleksi"
              : "Semua Produk"}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <ProductFilters categories={categories} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4 min-h-[36px]">
              <span className="text-[10px] uppercase tracking-widest text-brand-gray-500">Urutkan</span>
              <Suspense fallback={<div className="w-28 h-9 bg-brand-gray-800 animate-pulse" />}>
                <SortDropdown />
              </Suspense>
            </div>
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
