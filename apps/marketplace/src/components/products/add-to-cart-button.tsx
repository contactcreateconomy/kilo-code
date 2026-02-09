"use client";

import { useState } from "react";
import { Button } from "@createconomy/ui";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@createconomy/ui";
import { ShoppingCart, Check, Loader2 } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productSlug?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  productSlug,
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
      await addItem({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        slug: productSlug,
      });
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
