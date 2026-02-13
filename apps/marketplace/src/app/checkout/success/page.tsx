"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import { Button } from "@createconomy/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@createconomy/ui/components/card";
import { Badge } from "@createconomy/ui/components/badge";
import { Separator } from "@createconomy/ui/components/separator";
import { verifyCheckoutSession, formatPrice } from "@/lib/stripe";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * Checkout Success Page
 *
 * Displays order confirmation after successful Stripe Checkout.
 * Verifies the session and clears the Convex cart.
 */

interface OrderDetails {
  id: string;
  paymentStatus: string;
  customerEmail?: string;
  amountTotal?: number;
  currency?: string;
  lineItems?: Array<{
    name: string;
    quantity: number;
    amount: number;
  }>;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const clearCart = useMutation(api.functions.cart.clearCart);
  const cartClearedRef = useRef(false);

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setError("No session ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const result = await verifyCheckoutSession(sessionId);

        if (!result.success || !result.session) {
          setError(result.error || "Failed to verify payment");
          setIsLoading(false);
          return;
        }

        setOrderDetails(result.session as OrderDetails);

        // Clear cart in Convex after successful payment
        if (!cartClearedRef.current) {
          cartClearedRef.current = true;
          try {
            await clearCart({});
          } catch (clearErr) {
            // Cart clearing is not critical — don't block the success page
            console.error("Failed to clear cart:", clearErr);
          }
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setIsLoading(false);
      }
    }

    void verifyPayment();
  }, [sessionId, clearCart]);

  if (isLoading) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-lg">
          <CardContent className="py-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Verifying your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-lg">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              Verification Issue
            </h1>
            <p className="mt-4 text-muted-foreground">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              If you completed your payment, please check your email for
              confirmation or contact support.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/account/orders">View Orders</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <Card className="mx-auto max-w-lg">
        <CardContent className="pt-6 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Order Confirmed!
          </h1>
          <p className="mt-4 text-muted-foreground">
            Thank you for your purchase. Your order has been successfully placed
            and you will receive a confirmation email shortly.
          </p>

          {/* Order Reference */}
          {sessionId && (
            <p className="mt-4 text-sm text-muted-foreground">
              Order reference:{" "}
              <code className="rounded bg-muted px-2 py-1 font-mono">
                {sessionId.slice(0, 20)}...
              </code>
            </p>
          )}
        </CardContent>

        {/* Order Details */}
        {orderDetails && (
          <>
            <Separator />
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Customer Email */}
              {orderDetails.customerEmail && (
                <p className="mb-4 text-sm text-muted-foreground">
                  Confirmation sent to: {orderDetails.customerEmail}
                </p>
              )}

              {/* Line Items */}
              {orderDetails.lineItems && orderDetails.lineItems.length > 0 && (
                <div className="space-y-2">
                  {orderDetails.lineItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(
                          item.amount,
                          orderDetails.currency || "usd"
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              {orderDetails.amountTotal && (
                <>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {formatPrice(
                        orderDetails.amountTotal,
                        orderDetails.currency || "usd"
                      )}
                    </span>
                  </div>
                </>
              )}

              {/* Payment Status */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Payment Status:
                </span>
                <Badge
                  variant={
                    orderDetails.paymentStatus === "paid"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    orderDetails.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                      : ""
                  }
                >
                  {orderDetails.paymentStatus === "paid"
                    ? "Paid"
                    : "Processing"}
                </Badge>
              </div>
            </CardContent>
          </>
        )}

        {/* Actions */}
        <Separator />
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/account/orders">View Orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/support" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
