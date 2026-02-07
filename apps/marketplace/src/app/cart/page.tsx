import type { Metadata } from "next";
import Link from "next/link";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@createconomy/ui";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your cart and proceed to checkout.",
};

export default function CartPage() {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <CartItemsList />
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}

function CartItemsList() {
  // This would use the useCart hook in a client component
  // For now, showing a placeholder structure
  const items: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    seller: string;
    quantity: number;
    slug?: string;
    variant?: string;
  }> = [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <ShoppingCartIcon className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Looks like you haven&apos;t added any products yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
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
