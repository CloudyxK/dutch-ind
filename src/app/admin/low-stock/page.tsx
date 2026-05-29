import prisma from "@/lib/prisma";
import Link from "next/link";
import { AlertTriangle, Package } from "lucide-react";

const THRESHOLD = 5; // configurable

export default async function LowStockPage() {
  const variants = await prisma.productVariant.findMany({
    where: { stock: { lte: THRESHOLD, gt: 0 } },
    include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } },
    orderBy: { stock: "asc" },
  });
  const outOfStock = await prisma.productVariant.findMany({
    where: { stock: 0 },
    include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } },
    orderBy: [{ product: { name: "asc" } }],
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display tracking-widest uppercase flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400" /> Alert Stok Rendah
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">Produk dengan stok ≤ {THRESHOLD} unit</p>
      </div>

      {/* Low stock */}
      <div className="bg-brand-gray-900 border border-amber-500/30 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Stok Kritis ({variants.length} varian)
        </h2>
        {variants.length === 0 ? (
          <p className="text-brand-gray-500 text-sm">Semua stok aman ✓</p>
        ) : (
          <div className="space-y-2">
            {variants.map(v => (
              <div key={v.id} className="flex items-center gap-4 p-3 bg-brand-gray-800 border border-brand-gray-700">
                {v.product.images[0] && (
                  <img src={v.product.images[0].url} alt="" className="w-10 h-10 object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{v.product.name}</p>
                  <p className="text-xs text-brand-gray-400">Ukuran: {v.size}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-bold font-mono ${v.stock <= 2 ? "text-red-400" : "text-amber-400"}`}>{v.stock}</p>
                  <p className="text-[10px] text-brand-gray-500">tersisa</p>
                </div>
                <Link href={`/admin/products/${v.productId}/edit`}
                      className="text-xs border border-brand-gray-600 hover:border-white px-3 py-1.5 transition-colors flex-shrink-0">
                  Edit Stok
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Out of stock */}
      <div className="bg-brand-gray-900 border border-red-500/20 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4" /> Habis ({outOfStock.length} varian)
        </h2>
        {outOfStock.length === 0 ? (
          <p className="text-brand-gray-500 text-sm">Tidak ada varian yang habis ✓</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {outOfStock.map(v => (
              <div key={v.id} className="flex items-center gap-3 p-3 bg-brand-gray-800 border border-brand-gray-700">
                {v.product.images[0] && (
                  <img src={v.product.images[0].url} alt="" className="w-8 h-8 object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{v.product.name}</p>
                  <p className="text-[10px] text-brand-gray-500">Ukuran {v.size} — HABIS</p>
                </div>
                <Link href={`/admin/products/${v.productId}/edit`}
                      className="text-xs border border-brand-gray-600 hover:border-white px-2 py-1 transition-colors flex-shrink-0">
                  Isi
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
