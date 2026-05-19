"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const total = getTotalPrice();
  const shippingThreshold = 500000;
  const freeShipping = total >= shippingThreshold;
  const remaining = shippingThreshold - total;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 py-20">
        <ShoppingBag className="w-16 h-16 text-brand-gray-700" />
        <div className="text-center">
          <h1 className="text-2xl font-display tracking-widest uppercase">Keranjang Kosong</h1>
          <p className="text-brand-gray-400 text-sm mt-2">
            Tambahkan produk ke keranjang dan mulai belanja.
          </p>
        </div>
        <Link href="/products" className="btn-primary">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container-main">
        <div className="flex items-center justify-between mb-8">
          <h1 className="section-title">Keranjang ({items.length})</h1>
          <button
            onClick={clearCart}
            className="text-xs text-brand-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest"
          >
            Kosongkan Semua
          </button>
        </div>

        {/* Free shipping progress */}
        {!freeShipping && (
          <div className="mb-6 p-4 bg-brand-gray-900 border border-brand-gray-700">
            <p className="text-xs text-brand-gray-400">
              Tambahkan{" "}
              <span className="text-white font-semibold">{formatPrice(remaining)}</span>{" "}
              lagi untuk gratis ongkir!
            </p>
            <div className="mt-2 h-1 bg-brand-gray-700 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${Math.min((total / shippingThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {freeShipping && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800">
            <p className="text-xs text-green-400">
              Selamat! Kamu mendapatkan <strong>gratis ongkir</strong>.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-0 divide-y divide-brand-gray-800">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4 py-4">
                <div className="relative w-24 h-28 bg-brand-gray-800 flex-shrink-0 overflow-hidden">
                  <Image
                    src={item.product.images[0]?.url || ""}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div className="min-w-0 pr-2">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-semibold hover:text-brand-gray-300 transition-colors block truncate"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-brand-gray-500 mt-0.5">
                        Ukuran: <span className="text-brand-gray-300">{item.variant.size}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-brand-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-brand-gray-700">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-brand-gray-800 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.variant.stock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-brand-gray-800 transition-colors disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-brand-gray-500">
                          {formatPrice(item.product.price)} /item
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-6">
                Ringkasan Pesanan
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-gray-400">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray-400">Ongkir</span>
                  <span className={freeShipping ? "text-green-400" : ""}>
                    {freeShipping ? "Gratis" : "Dihitung saat checkout"}
                  </span>
                </div>
                <div className="border-t border-brand-gray-700 pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full text-center mt-6 group">
                Lanjut Checkout
                <ArrowRight className="ml-2 w-4 h-4 inline group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products" className="btn-ghost w-full text-center mt-2 text-xs">
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
