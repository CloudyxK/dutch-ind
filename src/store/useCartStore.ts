import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductVariant } from "@/types";
import toast from "react-hot-toast";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.variantId === variant.id);

        if (variant.stock <= 0) {
          toast.error("Stok habis!");
          return;
        }

        if (existingItem) {
          const newQty = existingItem.quantity + quantity;
          if (newQty > variant.stock) {
            toast.error(`Stok tersedia hanya ${variant.stock} item`);
            return;
          }
          set({
            items: items.map((item) =>
              item.variantId === variant.id
                ? { ...item, quantity: newQty }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${variant.id}`,
            cartId: "local",
            productId: product.id,
            variantId: variant.id,
            quantity,
            product,
            variant,
          };
          set({ items: [...items, newItem] });
        }

        toast.success("Produk ditambahkan ke keranjang");
        set({ isOpen: true });
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((item) => item.variantId !== variantId) });
        toast.success("Produk dihapus dari keranjang");
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      closeCart: () => set({ isOpen: false }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),
    }),
    {
      name: "dutch-ind-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Wishlist store
interface WishlistState {
  items: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (productId) => {
        const { items } = get();
        const isIn = items.includes(productId);
        if (isIn) {
          set({ items: items.filter((id) => id !== productId) });
          toast.success("Dihapus dari wishlist");
        } else {
          set({ items: [...items, productId] });
          toast.success("Ditambahkan ke wishlist");
        }
      },

      isWishlisted: (productId) => get().items.includes(productId),
    }),
    { name: "dutch-ind-wishlist" }
  )
);
