"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@createconomy/ui";
import { verifyCheckoutSession, formatPrice } from "@/lib/stripe";

/**
 * Checkout Success Page
 *
 * Displays order confirmation after successful Stripe Checkout.
 * Verifies the session and shows order details.
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

        // Clear cart after successful payment
        localStorage.removeItem("cart");
      } catch (err) {
        console.error("Verification error:", err);
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setIsLoading(false);
      }
    }

    verifyPayment();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-lg text-center">
          <LoadingSpinner className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <WarningIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Verification Issue
          </h1>
          <p className="mt-4 text-muted-foreground">
            {error}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            If you completed your payment, please check your email for confirmation
            or contact support.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/account/orders">View Orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-lg text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckIcon className="h-8 w-8 text-green-600" />
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
            Order reference: <code className="font-mono bg-muted px-2 py-1 rounded">{sessionId.slice(0, 20)}...</code>
          </p>
        )}

        {/* Order Details */}
        {orderDetails && (
          <div className="mt-8 rounded-lg border bg-card p-6 text-left">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            {/* Customer Email */}
            {orderDetails.customerEmail && (
              <p className="mt-2 text-sm text-muted-foreground">
                Confirmation sent to: {orderDetails.customerEmail}
              </p>
            )}

            {/* Line Items */}
            {orderDetails.lineItems && orderDetails.lineItems.length > 0 && (
              <div className="mt-4 space-y-2">
                {orderDetails.lineItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.amount, orderDetails.currency || "usd")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            {orderDetails.amountTotal && (
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {formatPrice(orderDetails.amountTotal, orderDetails.currency || "usd")}
                  </span>
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Payment Status:</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                orderDetails.paymentStatus === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {orderDetails.paymentStatus === "paid" ? "Paid" : "Processing"}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/account/orders">View Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/support" className="text-primary hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

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

function WarningIcon({ className }: { className?: string }) {
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
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
