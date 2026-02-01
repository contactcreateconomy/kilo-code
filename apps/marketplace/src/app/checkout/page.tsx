"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initiateCheckout, formatPriceFromDollars } from "@/lib/stripe";

/**
 * Checkout Page
 *
 * This page handles the checkout flow:
 * 1. Fetches cart items
 * 2. Creates a Stripe Checkout session
 * 3. Redirects to Stripe Checkout
 */

interface CartItem {
  productId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    async function loadCartAndCheckout() {
      try {
        // In a real implementation, fetch cart items from Convex
        // For now, we'll get them from localStorage or redirect if empty
        const storedCart = localStorage.getItem("cart");

        if (!storedCart) {
          // No cart items, redirect to cart page
          router.push("/cart");
          return;
        }

        const items: CartItem[] = JSON.parse(storedCart);

        if (items.length === 0) {
          router.push("/cart");
          return;
        }

        setCartItems(items);

        // Initiate checkout with Stripe
        await initiateCheckout(
          items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }))
        );

        // Note: If successful, the user will be redirected to Stripe
        // This code will only run if there's an issue
      } catch (err) {
        console.error("Checkout error:", err);
        setError(err instanceof Error ? err.message : "Failed to start checkout");
        setIsLoading(false);
      }
    }

    loadCartAndCheckout();
  }, [router]);

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (error) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ErrorIcon className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Checkout Error</h1>
          <p className="mt-4 text-muted-foreground">{error}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                window.location.reload();
              }}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-4 text-muted-foreground">
          You will be redirected to Stripe to complete your purchase securely.
        </p>

        {/* Order Summary */}
        {cartItems.length > 0 && (
          <div className="mt-8 rounded-lg border bg-card p-6 text-left">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="mt-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPriceFromDollars(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPriceFromDollars(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        <div className="mt-8 rounded-lg border bg-muted/50 p-8">
          <LoadingSpinner className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            {isLoading ? "Preparing your checkout session..." : "Redirecting to Stripe..."}
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LockIcon className="h-4 w-4" />
          <span>Secured by Stripe</span>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
