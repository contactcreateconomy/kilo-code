"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Input } from "@createconomy/ui";
import { useCart } from "@/hooks/use-cart";
import type { ConvexCartItem } from "@/hooks/use-cart";
import { formatPriceCents } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: ConvexCartItem;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      void removeItem(item.id);
    } else {
      void updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex gap-4 py-4">
      {/* Product Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.primaryImage ? (
          <Image
            src={item.primaryImage}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <Link
              href={`/products/${item.slug}`}
              className="font-medium hover:underline"
            >
              {item.name}
            </Link>
            {!item.inStock && (
              <p className="mt-1 text-sm text-destructive">Out of stock</p>
            )}
          </div>
          <p className="font-semibold">{formatPriceCents(item.price)}</p>
        </div>

        {/* Quantity Controls */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                handleQuantityChange(parseInt(e.target.value) || 1)
              }
              className="h-8 w-14 text-center"
              aria-label="Quantity"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {formatPriceCents(item.subtotal)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void removeItem(item.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
