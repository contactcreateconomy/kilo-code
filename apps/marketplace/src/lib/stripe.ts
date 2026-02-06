import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * Client-side Stripe Utilities for Marketplace
 *
 * This module provides utilities for loading Stripe.js,
 * redirecting to checkout, and formatting prices.
 */

// ============================================================================
// Stripe.js Loading
// ============================================================================

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get the Stripe.js instance
 * Lazily loads Stripe.js on first call
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"];

    if (!publishableKey) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}

// ============================================================================
// Checkout Helpers
// ============================================================================

/**
 * Redirect to Stripe Checkout via URL
 * @param url - Stripe Checkout session URL
 * @deprecated Use initiateCheckout which handles URL redirection directly
 */
export function redirectToCheckoutUrl(url: string): void {
  window.location.href = url;
}

/**
 * Create checkout session and redirect
 * @param items - Cart items to checkout
 */
export async function initiateCheckout(
  items: Array<{ productId: string; quantity: number }>
): Promise<void> {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create checkout session");
    }

    const { sessionId, url } = await response.json();

    // If we have a URL, redirect directly (Stripe Checkout URL)
    if (url) {
      window.location.href = url;
      return;
    }

    // If we have a sessionId but no URL, construct the checkout URL
    if (sessionId) {
      throw new Error("Checkout session URL is required for redirection");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    throw error;
  }
}

// ============================================================================
// Price Formatting
// ============================================================================

/**
 * Format price for display
 * @param amountInCents - Amount in cents
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPrice(
  amountInCents: number,
  currency: string = "usd"
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });

  return formatter.format(amountInCents / 100);
}

/**
 * Format price from dollars
 * @param amountInDollars - Amount in dollars
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPriceFromDollars(
  amountInDollars: number,
  currency: string = "usd"
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });

  return formatter.format(amountInDollars);
}

/**
 * Convert cents to dollars
 * @param cents - Amount in cents
 * @returns Amount in dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert dollars to cents
 * @param dollars - Amount in dollars
 * @returns Amount in cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

// ============================================================================
// Cart Helpers
// ============================================================================

/**
 * Calculate cart total
 * @param items - Cart items with prices
 * @returns Total in cents
 */
export function calculateCartTotal(
  items: Array<{ priceInCents: number; quantity: number }>
): number {
  return items.reduce((total, item) => total + item.priceInCents * item.quantity, 0);
}

/**
 * Calculate cart total from dollar prices
 * @param items - Cart items with dollar prices
 * @returns Total in dollars
 */
export function calculateCartTotalDollars(
  items: Array<{ price: number; quantity: number }>
): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// ============================================================================
// Session Verification
// ============================================================================

/**
 * Verify checkout session status
 * @param sessionId - Stripe Checkout session ID
 * @returns Session verification result
 */
export async function verifyCheckoutSession(sessionId: string): Promise<{
  success: boolean;
  session?: {
    id: string;
    paymentStatus: string;
    customerEmail?: string;
    amountTotal?: number;
    currency?: string;
  };
  error?: string;
}> {
  try {
    const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    const data = await response.json();
    return { success: true, session: data.session };
  } catch (error) {
    console.error("Session verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Get user-friendly error message for Stripe errors
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getStripeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for common Stripe error messages
    const message = error.message.toLowerCase();

    if (message.includes("card was declined")) {
      return "Your card was declined. Please try a different payment method.";
    }

    if (message.includes("expired")) {
      return "Your card has expired. Please use a different card.";
    }

    if (message.includes("insufficient funds")) {
      return "Your card has insufficient funds.";
    }

    if (message.includes("incorrect cvc")) {
      return "The security code is incorrect. Please check and try again.";
    }

    if (message.includes("processing error")) {
      return "There was an error processing your card. Please try again.";
    }

    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

// ============================================================================
// Types
// ============================================================================

export interface CheckoutItem {
  productId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number; // in dollars
  quantity: number;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}
