"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@createconomy/ui";
import { initiateCheckout, getStripeErrorMessage } from "@/lib/stripe";

/**
 * Checkout Button Component
 *
 * A reusable button that initiates the Stripe Checkout flow.
 * Handles loading states and error display.
 */

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface CheckoutButtonProps {
  items: CheckoutItem[];
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export function CheckoutButton({
  items,
  disabled = false,
  className,
  children = "Checkout",
  variant = "default",
  size = "default",
  onError,
  onSuccess,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (items.length === 0) {
      const errorMessage = "No items in cart";
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await initiateCheckout(items);
      onSuccess?.();
      // Note: If successful, the user will be redirected to Stripe
    } catch (err) {
      const errorMessage = getStripeErrorMessage(err);
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleCheckout}
        disabled={disabled || isLoading || items.length === 0}
        variant={variant}
        size={size}
        className="w-full"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </Button>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

/**
 * Checkout Button with Cart Integration
 *
 * A version that automatically fetches cart items from localStorage.
 */
interface CartCheckoutButtonProps {
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export function CartCheckoutButton({
  disabled = false,
  className,
  children = "Proceed to Checkout",
  variant = "default",
  size = "lg",
  onError,
  onSuccess,
}: CartCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get cart from localStorage
      const storedCart = localStorage.getItem("cart");
      if (!storedCart) {
        throw new Error("Your cart is empty");
      }

      const cartItems = JSON.parse(storedCart);
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error("Your cart is empty");
      }

      // Map to checkout items
      const items = cartItems.map((item: { productId: string; quantity: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      await initiateCheckout(items);
      onSuccess?.();
    } catch (err) {
      const errorMessage = getStripeErrorMessage(err);
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        className="w-full"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <LockIcon className="mr-2 h-4 w-4" />
            {children}
          </>
        )}
      </Button>

      {error && (
        <p className="mt-2 text-sm text-destructive text-center">{error}</p>
      )}

      <p className="mt-2 text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <LockIcon className="h-3 w-3" />
        Secured by Stripe
      </p>
    </div>
  );
}

/**
 * Buy Now Button
 *
 * A button for immediate purchase of a single product.
 */
interface BuyNowButtonProps {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export function BuyNowButton({
  productId,
  quantity = 1,
  disabled = false,
  className,
  children = "Buy Now",
  variant = "default",
  size = "default",
  onError,
  onSuccess,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuyNow = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await initiateCheckout([{ productId, quantity }]);
      onSuccess?.();
    } catch (err) {
      const errorMessage = getStripeErrorMessage(err);
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleBuyNow}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </Button>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

// Helper Components
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

export default CheckoutButton;
