import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminProductForm from "@/components/admin/AdminProductForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, rawCategories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { size: "asc" } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const categories = rawCategories;

  if (!product) notFound();

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    comparePrice: product.comparePrice,
    sku: product.sku ?? "",
    categoryId: product.categoryId,
    weight: product.weight,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    tags: (() => { try { return JSON.parse(product.tags || "[]"); } catch { return []; } })(),
    images: product.images.map((img) => ({ url: img.url })),
    variants: product.variants.map((v) => ({ size: v.size, stock: v.stock })),
    salePrice: product.salePrice,
    saleStartAt: product.saleStartAt,
    saleEndAt: product.saleEndAt,
    bulkDiscountQty: product.bulkDiscountQty,
    bulkDiscountPct: product.bulkDiscountPct,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display tracking-widest uppercase">Edit Produk</h1>
      <AdminProductForm categories={categories} initialData={initialData} />
    </div>
  );
}
