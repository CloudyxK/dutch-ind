"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } =
    useCartStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      if (e.target === el) closeCart();
    };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPrice = getTotalPrice();

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-brand-gray-900 border-l border-brand-gray-700 flex flex-col animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Keranjang ({items.length})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1 hover:bg-brand-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <ShoppingBag className="w-12 h-12 text-brand-gray-600" />
              <p className="text-brand-gray-400 text-sm">Keranjang kamu kosong</p>
              <button onClick={closeCart} className="btn-secondary text-xs">
                Lanjut Belanja
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-brand-gray-800">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="relative w-20 h-24 bg-brand-gray-800 flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.product.images[0]?.url || "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.product.name}</p>
                    <p className="text-xs text-brand-gray-400 mt-0.5">
                      Ukuran: {item.variant.size}
                    </p>
                    <p className="text-sm font-bold mt-1">
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center border border-brand-gray-700">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-brand-gray-700 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.variant.stock}
                          className="w-7 h-7 flex items-center justify-center hover:bg-brand-gray-700 transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="p-1 text-brand-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-brand-gray-700 p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-brand-gray-400">Subtotal</span>
              <span className="font-bold">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-xs text-brand-gray-500">
              Ongkir dan diskon dihitung saat checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="btn-secondary w-full text-center"
            >
              Lihat Keranjang
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
