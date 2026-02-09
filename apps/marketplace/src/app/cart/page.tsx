import type { Metadata } from "next";
import Link from "next/link";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
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
import { Button } from "@createconomy/ui";
import { Separator } from "@createconomy/ui/components/separator";
import { ShoppingCart } from "lucide-react";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your cart and proceed to checkout.",
};

export default function CartPage() {
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
            <BreadcrumbPage>Cart</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-8 text-3xl font-bold tracking-tight">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items — left column (wider) */}
        <div className="lg:col-span-2">
          <CartItemsList />
        </div>

        {/* Cart Summary — right column (narrower, sticky handled inside) */}
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
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Looks like you haven&apos;t added any products yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Cart Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.map((item, index) => (
          <div key={item.id}>
            <CartItem item={item} />
            {index < items.length - 1 && <Separator className="my-0" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
