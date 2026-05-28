import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dutch-indd.vercel.app";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, images: true, price: true, category: { select: { name: true } } },
  });
  if (!product) return { title: "Produk Tidak Ditemukan" };

  const imageUrl = product.images[0]?.url ?? null;
  const description = `${product.description.slice(0, 130)} — Rp${product.price.toLocaleString("id-ID")}`;

  return {
    title: `${product.name} — DUTCH.IND`,
    description,
    openGraph: {
      title: `${product.name} — DUTCH.IND`,
      description,
      type: "website",
      url: `${APP_URL}/products/${slug}`,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 1200, alt: product.name }]
        : [],
      siteName: "DUTCH.IND",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — DUTCH.IND`,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { size: "asc" } },
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) notFound();

  // Increment view count
  await prisma.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  });

  // Related products
  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: product.id },
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
    },
    take: 4,
  });

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const session = await auth();
  let hasPurchased = false;
  if (session?.user?.id) {
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: session.user.id,
          status: { in: ["DELIVERED", "COMPLETED"] },
        },
      },
    });
    hasPurchased = !!purchase;
  }

  // JSON-LD structured data
  const inStock = product.totalStock > 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    sku: product.sku ?? undefined,
    brand: { "@type": "Brand", name: "DUTCH.IND" },
    category: product.category?.name,
    url: `${APP_URL}/products/${slug}`,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "IDR",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${APP_URL}/products/${slug}`,
      seller: { "@type": "Organization", name: "DUTCH.IND" },
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={{ ...product, averageRating: avgRating } as any}
        related={related as any}
        hasPurchased={hasPurchased}
      />
    </>
  );
}
