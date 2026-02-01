import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";

/**
 * Cart Management Functions
 *
 * Queries and mutations for managing shopping carts
 * in the Createconomy marketplace.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get the current user's cart
 *
 * @param tenantId - Optional tenant ID for multi-tenant support
 * @param sessionId - Optional session ID for guest carts
 * @returns Cart with items or null
 */
export const getCart = query({
  args: {
    tenantId: v.optional(v.id("tenants")),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    let cart;

    if (userId) {
      // Get user's cart
      if (args.tenantId) {
        cart = await ctx.db
          .query("carts")
          .withIndex("by_tenant_user", (q) =>
            q.eq("tenantId", args.tenantId).eq("userId", userId)
          )
          .first();
      } else {
        cart = await ctx.db
          .query("carts")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();
      }
    } else if (args.sessionId) {
      // Get guest cart by session
      cart = await ctx.db
        .query("carts")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();
    }

    if (!cart) {
      return null;
    }

    // Get cart items with product details
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    const itemsWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product || product.isDeleted || product.status !== "active") {
          return null; // Product no longer available
        }

        const primaryImage = await ctx.db
          .query("productImages")
          .withIndex("by_product_primary", (q) =>
            q.eq("productId", product._id).eq("isPrimary", true)
          )
          .first();

        return {
          id: item._id,
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          primaryImage: primaryImage?.url,
          inStock:
            !product.trackInventory ||
            (product.inventory !== undefined && product.inventory >= item.quantity),
          maxQuantity: product.trackInventory ? product.inventory : undefined,
          addedAt: item.addedAt,
        };
      })
    );

    // Filter out unavailable products
    const validItems = itemsWithProducts.filter(Boolean);

    // Recalculate totals if items were removed
    const subtotal = validItems.reduce((sum, item) => sum + (item?.subtotal || 0), 0);
    const itemCount = validItems.reduce((sum, item) => sum + (item?.quantity || 0), 0);

    return {
      id: cart._id,
      tenantId: cart.tenantId,
      currency: cart.currency,
      subtotal,
      itemCount,
      items: validItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  },
});

/**
 * Get cart item count (for header badge)
 *
 * @param tenantId - Optional tenant ID
 * @param sessionId - Optional session ID for guests
 * @returns Item count
 */
export const getCartItemCount = query({
  args: {
    tenantId: v.optional(v.id("tenants")),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    let cart;

    if (userId) {
      if (args.tenantId) {
        cart = await ctx.db
          .query("carts")
          .withIndex("by_tenant_user", (q) =>
            q.eq("tenantId", args.tenantId).eq("userId", userId)
          )
          .first();
      } else {
        cart = await ctx.db
          .query("carts")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();
      }
    } else if (args.sessionId) {
      cart = await ctx.db
        .query("carts")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();
    }

    return cart?.itemCount ?? 0;
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Add item to cart
 *
 * @param productId - Product to add
 * @param quantity - Quantity to add
 * @param tenantId - Optional tenant ID
 * @param sessionId - Optional session ID for guests
 * @returns Updated cart
 */
export const addToCart = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    tenantId: v.optional(v.id("tenants")),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId && !args.sessionId) {
      throw new Error("Authentication or session ID required");
    }

    if (args.quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    // Validate product
    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted || product.status !== "active") {
      throw new Error("Product not available");
    }

    // Check inventory
    if (product.trackInventory && product.inventory !== undefined) {
      if (product.inventory < args.quantity) {
        throw new Error("Insufficient inventory");
      }
    }

    const now = Date.now();

    // Get or create cart
    let cart;

    if (userId) {
      if (args.tenantId) {
        cart = await ctx.db
          .query("carts")
          .withIndex("by_tenant_user", (q) =>
            q.eq("tenantId", args.tenantId).eq("userId", userId)
          )
          .first();
      } else {
        cart = await ctx.db
          .query("carts")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();
      }
    } else if (args.sessionId) {
      cart = await ctx.db
        .query("carts")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .first();
    }

    if (!cart) {
      // Create new cart
      const cartId = await ctx.db.insert("carts", {
        tenantId: args.tenantId,
        userId: userId ?? undefined,
        sessionId: userId ? undefined : args.sessionId,
        currency: product.currency,
        subtotal: 0,
        itemCount: 0,
        expiresAt: userId ? undefined : now + 7 * 24 * 60 * 60 * 1000, // 7 days for guest carts
        createdAt: now,
        updatedAt: now,
      });

      cart = await ctx.db.get(cartId);
    }

    if (!cart) {
      throw new Error("Failed to create cart");
    }

    // Check if product already in cart
    const existingItem = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_product", (q) =>
        q.eq("cartId", cart._id).eq("productId", args.productId)
      )
      .first();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + args.quantity;

      // Check inventory for new quantity
      if (product.trackInventory && product.inventory !== undefined) {
        if (product.inventory < newQuantity) {
          throw new Error("Insufficient inventory for requested quantity");
        }
      }

      const newSubtotal = product.price * newQuantity;

      await ctx.db.patch(existingItem._id, {
        quantity: newQuantity,
        subtotal: newSubtotal,
        updatedAt: now,
      });

      // Update cart totals
      const cartSubtotalDiff = product.price * args.quantity;
      await ctx.db.patch(cart._id, {
        subtotal: cart.subtotal + cartSubtotalDiff,
        itemCount: cart.itemCount + args.quantity,
        updatedAt: now,
      });
    } else {
      // Add new item
      const itemSubtotal = product.price * args.quantity;

      await ctx.db.insert("cartItems", {
        cartId: cart._id,
        productId: args.productId,
        quantity: args.quantity,
        price: product.price,
        subtotal: itemSubtotal,
        addedAt: now,
        updatedAt: now,
      });

      // Update cart totals
      await ctx.db.patch(cart._id, {
        subtotal: cart.subtotal + itemSubtotal,
        itemCount: cart.itemCount + args.quantity,
        updatedAt: now,
      });
    }

    return { success: true, cartId: cart._id };
  },
});

/**
 * Update cart item quantity
 *
 * @param cartItemId - Cart item ID
 * @param quantity - New quantity
 * @returns Success boolean
 */
export const updateCartItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    const cart = await ctx.db.get(cartItem.cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Verify ownership
    if (cart.userId && cart.userId !== userId) {
      throw new Error("Not authorized");
    }

    if (args.quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    // Validate product
    const product = await ctx.db.get(cartItem.productId);
    if (!product || product.isDeleted || product.status !== "active") {
      throw new Error("Product no longer available");
    }

    // Check inventory
    if (product.trackInventory && product.inventory !== undefined) {
      if (product.inventory < args.quantity) {
        throw new Error("Insufficient inventory");
      }
    }

    const now = Date.now();
    const oldSubtotal = cartItem.subtotal;
    const newSubtotal = product.price * args.quantity;
    const quantityDiff = args.quantity - cartItem.quantity;

    // Update cart item
    await ctx.db.patch(args.cartItemId, {
      quantity: args.quantity,
      price: product.price, // Update price in case it changed
      subtotal: newSubtotal,
      updatedAt: now,
    });

    // Update cart totals
    await ctx.db.patch(cart._id, {
      subtotal: cart.subtotal - oldSubtotal + newSubtotal,
      itemCount: cart.itemCount + quantityDiff,
      updatedAt: now,
    });

    return true;
  },
});

/**
 * Remove item from cart
 *
 * @param cartItemId - Cart item ID
 * @returns Success boolean
 */
export const removeFromCart = mutation({
  args: {
    cartItemId: v.id("cartItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    const cart = await ctx.db.get(cartItem.cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Verify ownership
    if (cart.userId && cart.userId !== userId) {
      throw new Error("Not authorized");
    }

    const now = Date.now();

    // Update cart totals
    await ctx.db.patch(cart._id, {
      subtotal: cart.subtotal - cartItem.subtotal,
      itemCount: cart.itemCount - cartItem.quantity,
      updatedAt: now,
    });

    // Delete cart item
    await ctx.db.delete(args.cartItemId);

    return true;
  },
});

/**
 * Clear entire cart
 *
 * @param tenantId - Optional tenant ID
 * @returns Success boolean
 */
export const clearCart = mutation({
  args: {
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    let cart;

    if (args.tenantId) {
      cart = await ctx.db
        .query("carts")
        .withIndex("by_tenant_user", (q) =>
          q.eq("tenantId", args.tenantId).eq("userId", userId)
        )
        .first();
    } else {
      cart = await ctx.db
        .query("carts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
    }

    if (!cart) {
      return true; // No cart to clear
    }

    // Delete all cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    // Reset cart totals
    await ctx.db.patch(cart._id, {
      subtotal: 0,
      itemCount: 0,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Merge guest cart into user cart after login
 *
 * @param sessionId - Guest session ID
 * @param tenantId - Optional tenant ID
 * @returns Success boolean
 */
export const mergeGuestCart = mutation({
  args: {
    sessionId: v.string(),
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Get guest cart
    const guestCart = await ctx.db
      .query("carts")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!guestCart) {
      return true; // No guest cart to merge
    }

    // Get or create user cart
    let userCart;

    if (args.tenantId) {
      userCart = await ctx.db
        .query("carts")
        .withIndex("by_tenant_user", (q) =>
          q.eq("tenantId", args.tenantId).eq("userId", userId)
        )
        .first();
    } else {
      userCart = await ctx.db
        .query("carts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
    }

    const now = Date.now();

    if (!userCart) {
      // Convert guest cart to user cart
      await ctx.db.patch(guestCart._id, {
        userId,
        sessionId: undefined,
        expiresAt: undefined,
        updatedAt: now,
      });

      return true;
    }

    // Merge items from guest cart to user cart
    const guestItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", guestCart._id))
      .collect();

    for (const guestItem of guestItems) {
      // Check if product already in user cart
      const existingItem = await ctx.db
        .query("cartItems")
        .withIndex("by_cart_product", (q) =>
          q.eq("cartId", userCart._id).eq("productId", guestItem.productId)
        )
        .first();

      if (existingItem) {
        // Add quantities
        const product = await ctx.db.get(guestItem.productId);
        if (product && !product.isDeleted && product.status === "active") {
          let newQuantity = existingItem.quantity + guestItem.quantity;

          // Check inventory
          if (product.trackInventory && product.inventory !== undefined) {
            newQuantity = Math.min(newQuantity, product.inventory);
          }

          await ctx.db.patch(existingItem._id, {
            quantity: newQuantity,
            subtotal: product.price * newQuantity,
            updatedAt: now,
          });
        }
      } else {
        // Move item to user cart
        const product = await ctx.db.get(guestItem.productId);
        if (product && !product.isDeleted && product.status === "active") {
          await ctx.db.insert("cartItems", {
            cartId: userCart._id,
            productId: guestItem.productId,
            quantity: guestItem.quantity,
            price: product.price,
            subtotal: product.price * guestItem.quantity,
            addedAt: guestItem.addedAt,
            updatedAt: now,
          });
        }
      }

      // Delete guest item
      await ctx.db.delete(guestItem._id);
    }

    // Recalculate user cart totals
    const userItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", userCart._id))
      .collect();

    const subtotal = userItems.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = userItems.reduce((sum, item) => sum + item.quantity, 0);

    await ctx.db.patch(userCart._id, {
      subtotal,
      itemCount,
      updatedAt: now,
    });

    // Delete guest cart
    await ctx.db.delete(guestCart._id);

    return true;
  },
});
