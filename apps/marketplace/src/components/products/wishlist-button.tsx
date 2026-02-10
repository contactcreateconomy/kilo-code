"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@createconomy/ui";
import { useToast } from "@createconomy/ui";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  variant?: "default" | "icon";
  size?: "sm" | "default" | "lg";
  className?: string;
}

/**
 * Wishlist toggle button for product cards and detail pages.
 * Shows filled heart when product is in wishlist, outline when not.
 */
export function WishlistButton({
  productId,
  variant = "icon",
  size = "default",
  className,
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isToggling, setIsToggling] = useState(false);
  const toast = useToast();

  const isInWishlist = useQuery(
    api.functions.wishlists.isInWishlist,
    isAuthenticated ? { productId: productId as Id<"products"> } : "skip"
  );

  const toggleWishlist = useMutation(api.functions.wishlists.toggleWishlist);

  async function handleToggle() {
    if (!isAuthenticated) {
      toast.addToast("Please sign in to save items to your wishlist", "error");
      return;
    }

    setIsToggling(true);
    try {
      const result = await toggleWishlist({
        productId: productId as Id<"products">,
      });
      if (result.inWishlist) {
        toast.addToast("Added to wishlist", "success");
      } else {
        toast.addToast("Removed from wishlist", "success");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update wishlist";
      toast.addToast(message, "error");
    } finally {
      setIsToggling(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={cn(
          "group inline-flex items-center justify-center rounded-full p-2 transition-colors",
          "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isToggling ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isInWishlist
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground group-hover:text-red-500"
            )}
          />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isToggling}
      variant={isInWishlist ? "default" : "outline"}
      size={size}
      className={cn("gap-1.5", className)}
    >
      {isToggling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "h-4 w-4",
            isInWishlist && "fill-current"
          )}
        />
      )}
      {isInWishlist ? "Saved" : "Save to Wishlist"}
    </Button>
  );
}
