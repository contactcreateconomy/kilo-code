import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@createconomy/ui";
import {
  Card,
  CardContent,
} from "@createconomy/ui/components/card";
import { XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  description: "Your checkout was cancelled.",
};

export default function CheckoutCancelPage() {
  return (
    <div className="container py-16">
      <Card className="mx-auto max-w-lg">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Checkout Cancelled
          </h1>
          <p className="mt-4 text-muted-foreground">
            Your checkout was cancelled. Don&apos;t worry, your cart items are
            still saved and you can complete your purchase anytime.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/cart">Return to Cart</Link>
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
