"use client";

import { useState } from "react";
import { Button } from "@createconomy/ui";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@createconomy/ui";
import { ShoppingCart, Check, Loader2, LogIn } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function AddToCartButton({
  productId,
  size = "default",
  variant = "default",
  className,
}: AddToCartButtonProps) {
  const { addItem, isInCart, isAuthenticated } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const inCart = isInCart(productId);

  const handleAddToCart = async () => {
    if (inCart) return;

    if (!isAuthenticated) {
      // addItem will redirect to sign-in, but we can also handle it here
      window.location.href = "/auth/signin?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsLoading(true);
    try {
      await addItem(productId, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button
        size={size}
        variant={variant}
        className={className}
        onClick={handleAddToCart}
      >
        <LogIn className="mr-2 h-4 w-4" />
        Sign in to Buy
      </Button>
    );
  }

  if (inCart) {
    return (
      <Button
        size={size}
        variant="secondary"
        className={cn("pointer-events-none", className)}
        disabled
      >
        <Check className="mr-2 h-4 w-4" />
        In Cart
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={handleAddToCart}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : isAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
