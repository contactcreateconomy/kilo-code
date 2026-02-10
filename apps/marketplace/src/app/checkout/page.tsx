"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { Button, Skeleton } from "@createconomy/ui";
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
import { initiateCheckout } from "@/lib/stripe";
import { formatPriceCents } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle, Lock } from "lucide-react";

/**
 * Checkout Page
 *
 * 1. Loads cart from Convex
 * 2. Creates a Stripe Checkout session
 * 3. Redirects to Stripe Checkout
 */

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const cart = useQuery(
    api.functions.cart.getCart,
    isAuthenticated ? {} : "skip"
  );

  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin?redirect=/checkout");
    }
  }, [authLoading, isAuthenticated, router]);

  // Initiate checkout when cart is loaded
  useEffect(() => {
    if (cart === undefined || isRedirecting || error) return;

    if (!cart || cart.items.length === 0) {
      router.push("/cart");
      return;
    }

    async function startCheckout() {
      setIsRedirecting(true);
      try {
        await initiateCheckout(
          cart!.items
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .map((item) => ({
              productId: item.productId as string,
              quantity: item.quantity,
            }))
        );
        // If successful, user is redirected to Stripe
      } catch (err) {
        console.error("Checkout error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to start checkout"
        );
        setIsRedirecting(false);
      }
    }

    startCheckout();
  }, [cart, router, isRedirecting, error]);

  // Calculate total from Convex data (in cents)
  const totalCents = cart?.subtotal ?? 0;

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
            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              Checkout Error
            </h1>
            <p className="mt-4 text-muted-foreground">{error}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={() => {
                  setError(null);
                  setIsRedirecting(false);
                }}
              >
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push("/cart")}>
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
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Checkout
        </h1>
        <p className="mt-4 text-center text-muted-foreground">
          You will be redirected to Stripe to complete your purchase securely.
        </p>

        {/* Order Summary */}
        {cart && cart.items.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cart.items
                  .filter(
                    (item): item is NonNullable<typeof item> => item !== null
                  )
                  .map((item) => (
                  <div
                    key={item.id as string}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPriceCents(item.subtotal)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPriceCents(totalCents)}</span>
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
              {cart === undefined
                ? "Loading your cart..."
                : "Redirecting to Stripe..."}
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
