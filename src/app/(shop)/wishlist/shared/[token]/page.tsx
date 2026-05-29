import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Heart } from "lucide-react";

export default async function SharedWishlistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/wishlist/share/${token}`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { ownerName, products } = await res.json();

  return (
    <div className="min-h-screen py-10">
      <div className="container-main max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            <h1 className="section-title">Wishlist {ownerName}</h1>
          </div>
          <p className="text-sm text-brand-gray-400">{products.length} produk dalam wishlist ini</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-brand-gray-500">Wishlist ini kosong.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {products.map((p: any) => {
              const inStock = p.variants.some((v: any) => v.stock > 0);
              return (
                <Link key={p.id} href={`/products/${p.slug}`} className="group bg-brand-gray-900 border border-brand-gray-800 hover:border-white transition-colors">
                  <div className="relative aspect-[3/4] overflow-hidden bg-brand-gray-800">
                    {p.images[0] ? (
                      <Image src={p.images[0].url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
                    ) : (
                      <div className="w-full h-full bg-brand-gray-700" />
                    )}
                    {!inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">Habis</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium line-clamp-2 leading-snug">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-sm font-bold">{formatPrice(p.price)}</p>
                      {p.comparePrice && <p className="text-xs text-brand-gray-500 line-through">{formatPrice(p.comparePrice)}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/products" className="inline-block px-6 py-3 border border-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
            Belanja Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
