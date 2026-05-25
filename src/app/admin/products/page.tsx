import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2 } from "lucide-react";
import AdminProductActions from "@/components/admin/AdminProductActions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
            <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.28)" }}>Admin</span>
          </div>
          <h1 className="text-3xl font-display tracking-widest uppercase text-white">Produk</h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary text-sm gap-2 flex items-center">
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Link>
      </div>

      {/* Table */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-gray-700 bg-brand-gray-800">
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">
                Produk
              </th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden md:table-cell">
                Kategori
              </th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">
                Harga
              </th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden sm:table-cell">
                Stok
              </th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden lg:table-cell">
                Status
              </th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-800">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-brand-gray-800/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-12 bg-brand-gray-800 flex-shrink-0 overflow-hidden">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-brand-gray-500 font-mono">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-brand-gray-400 hidden md:table-cell">
                  {product.category.name}
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm font-bold">{formatPrice(product.price)}</p>
                    {product.comparePrice && (
                      <p className="text-xs text-brand-gray-500 line-through">
                        {formatPrice(product.comparePrice)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <span
                    className={`text-xs font-bold px-2 py-1 ${
                      product.totalStock === 0
                        ? "bg-red-900/40 text-red-400"
                        : product.totalStock <= 5
                        ? "bg-yellow-900/40 text-yellow-400"
                        : "bg-green-900/40 text-green-400"
                    }`}
                  >
                    {product.totalStock}
                  </span>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {product.isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-900/30 text-green-400">Aktif</span>
                    )}
                    {product.isFeatured && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/30 text-blue-400">Featured</span>
                    )}
                    {product.isBestSeller && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-yellow-900/30 text-yellow-400">Terlaris</span>
                    )}
                    {product.isNewArrival && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-900/30 text-purple-400">Baru</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <AdminProductActions productId={product.id} productSlug={product.slug} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
