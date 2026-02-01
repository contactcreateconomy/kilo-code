"use client";

import { useState } from "react";
import { Button } from "@createconomy/ui";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@createconomy/ui";

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
  const { addItem, isInCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const inCart = isInCart(productId);

  const handleAddToCart = async () => {
    if (inCart) return;

    setIsLoading(true);
    try {
      await addItem(productId);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (inCart) {
    return (
      <Button
        size={size}
        variant="secondary"
        className={cn("pointer-events-none", className)}
        disabled
      >
        <CheckIcon className="mr-2 h-4 w-4" />
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
          <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : isAdded ? (
        <>
          <CheckIcon className="mr-2 h-4 w-4" />
          Added!
        </>
      ) : (
        <>
          <CartIcon className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}

function CartIcon({ className }: { className?: string }) {
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
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LoadingIcon({ className }: { className?: string }) {
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
