"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { centsToDollars } from "@/lib/utils";

const TAX_RATE = 0.08; // 8% tax rate

/**
 * Cart item shape returned by the Convex getCart query.
 * All prices are in **cents**.
 */
export interface ConvexCartItem {
  id: string; // Id<"cartItems">
  productId: string; // Id<"products">
  name: string;
  slug: string;
  price: number; // cents
  quantity: number;
  subtotal: number; // cents
  primaryImage?: string;
  inStock: boolean;
  maxQuantity?: number;
  addedAt: number;
}

export function useCart() {
  const { isAuthenticated } = useAuth();

  // Local UI state for cart drawer open/close
  const [isOpen, setIsOpen] = useState(false);

  // Convex queries — only run when authenticated
  const cart = useQuery(
    api.functions.cart.getCart,
    isAuthenticated ? {} : "skip"
  );
  const cartItemCount = useQuery(
    api.functions.cart.getCartItemCount,
    isAuthenticated ? {} : "skip"
  );

  // Convex mutations
  const addToCartMutation = useMutation(api.functions.cart.addToCart);
  const updateCartItemMutation = useMutation(api.functions.cart.updateCartItem);
  const removeFromCartMutation = useMutation(api.functions.cart.removeFromCart);
  const clearCartMutation = useMutation(api.functions.cart.clearCart);

  // ---- Derived data ----
  const items: ConvexCartItem[] = useMemo(
    () => (cart?.items as ConvexCartItem[] | undefined) ?? [],
    [cart]
  );

  const isLoading = isAuthenticated && cart === undefined;

  // Prices in dollars (converted from cents)
  const subtotal = useMemo(
    () => centsToDollars(cart?.subtotal ?? 0),
    [cart]
  );
  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);
  const itemCount = cartItemCount ?? 0;

  // ---- Actions ----

  /**
   * Add a product to the cart.
   * @param productId — plain string; will be cast to Id<"products">
   * @param quantity — defaults to 1
   */
  const addItem = useCallback(
    async (productId: string, quantity: number = 1) => {
      if (!isAuthenticated) {
        // Redirect to sign-in; callers can also handle this before calling
        window.location.href = "/auth/signin?redirect=/cart";
        return;
      }
      await addToCartMutation({
        productId: productId as Id<"products">,
        quantity,
      });
    },
    [isAuthenticated, addToCartMutation]
  );

  /**
   * Remove an item from the cart.
   * @param cartItemId — the `item.id` from getCart (Id<"cartItems">)
   */
  const removeItem = useCallback(
    async (cartItemId: string) => {
      await removeFromCartMutation({
        cartItemId: cartItemId as Id<"cartItems">,
      });
    },
    [removeFromCartMutation]
  );

  /**
   * Update the quantity of a cart item.
   * @param cartItemId — the `item.id` from getCart
   * @param quantity — new quantity; if ≤ 0 the item is removed
   */
  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(cartItemId);
        return;
      }
      await updateCartItemMutation({
        cartItemId: cartItemId as Id<"cartItems">,
        quantity,
      });
    },
    [removeItem, updateCartItemMutation]
  );

  /**
   * Clear the entire cart.
   */
  const clearCart = useCallback(async () => {
    await clearCartMutation({});
  }, [clearCartMutation]);

  /**
   * Check whether a product is already in the cart.
   */
  const isInCart = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items]
  );

  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);
  const setCartOpen = useCallback((open: boolean) => setIsOpen(open), []);

  return {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
    isInCart,
    subtotal,
    tax,
    total,
    itemCount,
    isLoading,
    isAuthenticated,
  };
}
