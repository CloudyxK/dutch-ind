import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

interface CategorySectionProps {
  categories: (Category & { _count: { products: number } })[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="py-16 bg-brand-black">
      <div className="container-main">
        <div className="flex items-end justify-between mb-8">
          <h2 className="section-title">Kategori</h2>
          <Link
            href="/products"
            className="text-xs uppercase tracking-widest text-brand-gray-400 hover:text-white transition-colors"
          >
            Lihat Semua
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative aspect-square overflow-hidden bg-brand-gray-800"
            >
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
              )}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-sm font-bold uppercase tracking-widest text-white">
                  {cat.name}
                </p>
                <p className="text-xs text-brand-gray-300 mt-1">
                  {cat._count.products} produk
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
