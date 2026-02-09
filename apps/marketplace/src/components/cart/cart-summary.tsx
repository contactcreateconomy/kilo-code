"use client";

import Link from "next/link";
import { Button } from "@createconomy/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@createconomy/ui/components/card";
import { Separator } from "@createconomy/ui/components/separator";
import { useCart } from "@/hooks/use-cart";
import { Lock, ShieldCheck } from "lucide-react";

export function CartSummary() {
  const { items, subtotal, tax, total } = useCart();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        {/* Promo Code */}
        <div>
          <Separator className="mb-6" />
          <p className="text-sm font-medium">Have a promo code?</p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Enter code"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            />
            <Button variant="outline" size="sm">
              Apply
            </Button>
          </div>
        </div>

        {/* Trust Badges */}
        <div>
          <Separator className="mb-6" />
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1 text-xs">
              <Lock className="h-4 w-4" />
              Secure Checkout
            </div>
            <div className="flex items-center gap-1 text-xs">
              <ShieldCheck className="h-4 w-4" />
              Money-back Guarantee
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
