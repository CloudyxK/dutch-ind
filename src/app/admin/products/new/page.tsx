import prisma from "@/lib/prisma";
import AdminProductForm from "@/components/admin/AdminProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display tracking-widest uppercase">Tambah Produk Baru</h1>
      <AdminProductForm categories={categories} />
    </div>
  );
}
