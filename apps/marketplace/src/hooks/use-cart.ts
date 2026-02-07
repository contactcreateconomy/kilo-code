"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => Promise<void>;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  isInCart: (productId: string) => boolean;
}

const TAX_RATE = 0.08; // 8% tax rate

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: async (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === item.id);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }],
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      setCartOpen: (open) => {
        set({ isOpen: open });
      },

      isInCart: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
    }),
    {
      name: "createconomy-cart",
    }
  )
);

// Hook with computed values
export function useCart() {
  const store = useCartStore();

  const subtotal = store.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const itemCount = store.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...store,
    subtotal,
    tax,
    total,
    itemCount,
  };
}
