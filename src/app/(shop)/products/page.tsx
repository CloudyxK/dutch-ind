import { Suspense } from "react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
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

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-gray-400 text-sm">Tidak ada produk ditemukan</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-xs text-brand-gray-500 mb-6">
        Menampilkan {skip + 1}–{Math.min(skip + products.length, total)} dari {total} produk
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as any} />
        ))}
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

  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "popular", label: "Terpopuler" },
    { value: "price_asc", label: "Harga: Murah ke Mahal" },
    { value: "price_desc", label: "Harga: Mahal ke Murah" },
  ];

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
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Kategori</h3>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="/products"
                      className={`block text-sm py-1 transition-colors ${
                        !params.category
                          ? "text-white font-semibold"
                          : "text-brand-gray-400 hover:text-white"
                      }`}
                    >
                      Semua
                    </a>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <a
                        href={`/products?category=${cat.slug}`}
                        className={`block text-sm py-1 transition-colors ${
                          params.category === cat.slug
                            ? "text-white font-semibold"
                            : "text-brand-gray-400 hover:text-white"
                        }`}
                      >
                        {cat.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Filter checkboxes */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Filter</h3>
                <ul className="space-y-2">
                  {[
                    { key: "isNewArrival", label: "Koleksi Baru" },
                    { key: "isBestSeller", label: "Terlaris" },
                    { key: "isFeatured", label: "Pilihan Editor" },
                  ].map(({ key, label }) => (
                    <li key={key}>
                      <a
                        href={`/products?${key}=true`}
                        className={`block text-sm py-1 transition-colors ${
                          params[key as keyof typeof params] === "true"
                            ? "text-white font-semibold"
                            : "text-brand-gray-400 hover:text-white"
                        }`}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-gray-800">
              <div className="flex items-center gap-2 overflow-x-auto">
                {sortOptions.map((opt) => (
                  <a
                    key={opt.value}
                    href={`?${new URLSearchParams({ ...params, sort: opt.value }).toString()}`}
                    className={`text-xs whitespace-nowrap px-3 py-1.5 border transition-colors ${
                      (params.sort || "newest") === opt.value
                        ? "border-white text-white"
                        : "border-brand-gray-700 text-brand-gray-400 hover:border-white hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </a>
                ))}
              </div>
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
