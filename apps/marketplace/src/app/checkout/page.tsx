"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@createconomy/ui";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@createconomy/ui/components/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@createconomy/ui/components/card";
import { Separator } from "@createconomy/ui/components/separator";
import { initiateCheckout, formatPriceFromDollars } from "@/lib/stripe";
import { Loader2, AlertCircle, Lock } from "lucide-react";

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
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="mx-auto max-w-lg">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Checkout Error</h1>
            <p className="mt-4 text-muted-foreground">{error}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  window.location.reload();
                }}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/cart")}
              >
                Return to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Checkout</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-4 text-center text-muted-foreground">
          You will be redirected to Stripe to complete your purchase securely.
        </p>

        {/* Order Summary */}
        {cartItems.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPriceFromDollars(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        <Card className="mt-8 bg-muted/50">
          <CardContent className="py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              {isLoading ? "Preparing your checkout session..." : "Redirecting to Stripe..."}
            </p>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Secured by Stripe</span>
        </div>
      </div>
    </div>
  );
}
