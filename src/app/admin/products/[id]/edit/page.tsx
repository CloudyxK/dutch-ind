import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminProductForm from "@/components/admin/AdminProductForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
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
    }),
  ]);

  if (!product) notFound();

  const initialData = {
    ...product,
    images: product.images,
    variants: product.variants.map((v) => ({ size: v.size, stock: v.stock })),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display tracking-widest uppercase">Edit Produk</h1>
      <AdminProductForm categories={categories} initialData={initialData} />
    </div>
  );
}
